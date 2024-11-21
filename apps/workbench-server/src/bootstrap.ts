// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { PasswordHelper, type AuthenticationUser } from "@twin.org/api-auth-entity-storage-service";
import { Coerce, Converter, I18n, Is, RandomHelper, StringHelper } from "@twin.org/core";
import { Bip39, PasswordGenerator } from "@twin.org/crypto";
import type { IEngineCoreEnvironmentVariables } from "@twin.org/engine-core";
import type { IEngineCore, IEngineCoreContext } from "@twin.org/engine-models";
import type { IEngineServerEnvironmentVariables } from "@twin.org/engine-server";
import {
	EntityStorageConnectorFactory,
	type IEntityStorageConnector
} from "@twin.org/entity-storage-models";
import { IotaIdentityUtils } from "@twin.org/identity-connector-iota";
import {
	IdentityConnectorFactory,
	IdentityProfileConnectorFactory
} from "@twin.org/identity-models";
import { nameof } from "@twin.org/nameof";
import { VaultConnectorFactory, VaultKeyType } from "@twin.org/vault-models";
import type { WalletAddress } from "@twin.org/wallet-connector-entity-storage";
import { WalletConnectorFactory } from "@twin.org/wallet-models";
import type { Person, WithContext } from "schema-dts";
import type { IWorkbenchState } from "./models/IWorkbenchState";

/**
 * Bootstrap the application.
 * @param engineCore The engine core for the node.
 * @param context The context for the node.
 * @param envVars The environment variables for the node.
 */
export async function bootstrap(
	engineCore: IEngineCore,
	context: IEngineCoreContext<IWorkbenchState>,
	envVars: IEngineCoreEnvironmentVariables & IEngineServerEnvironmentVariables
): Promise<void> {
	await bootstrapNodeIdentity(engineCore, context, envVars);
	await bootstrapNodeUser(engineCore, context, envVars);
	await bootstrapAuth(engineCore, context, envVars);
	await bootstrapBlobEncryption(engineCore, context, envVars);
	await bootstrapImmutableProofEncryption(engineCore, context, envVars);
	await bootstrapAttestationMethod(engineCore, context, envVars);
	await bootstrapImmutableProofMethod(engineCore, context, envVars);
}

/**
 * Bootstrap the node creating any necessary resources.
 * @param engineCore The engine core for the node.
 * @param context The context for the node.
 * @param envVars The environment variables for the node.
 */
export async function bootstrapNodeIdentity(
	engineCore: IEngineCore,
	context: IEngineCoreContext<IWorkbenchState>,
	envVars: IEngineCoreEnvironmentVariables & IEngineServerEnvironmentVariables
): Promise<void> {
	// If there is no identity set in the node config then we need
	// to setup the identity for the node
	if (!Is.stringValue(context.state.nodeIdentity)) {
		// When we bootstrap the node we need to generate an identity for it,
		// But we have a chicken and egg problem in that we can't create the identity
		// to store the mnemonic in the vault without an identity. We use a temporary identity
		// and then replace it with the new identity later in the process.
		const engineDefaultTypes = engineCore.getDefaultTypes();

		const nodeIdentity = `bootstrap-temp-${Converter.bytesToHex(RandomHelper.generate(16))}`;
		const vaultConnector = VaultConnectorFactory.get(engineDefaultTypes.vaultConnector);

		let tempSecretName;
		try {
			// Create a secure mnemonic and store it in the vault so that wallet operations
			// can be performed
			const mnemonic = Bip39.randomMnemonic();
			engineCore.logInfo(I18n.formatMessage("workbench.generatingMnemonic", { mnemonic }));

			tempSecretName = `${nodeIdentity}/mnemonic`;
			await vaultConnector.setSecret(tempSecretName, mnemonic);

			// Generate an address from the wallet, this will use the mnemonic from above
			const walletConnector = WalletConnectorFactory.get(engineDefaultTypes.walletConnector);
			const addresses = await walletConnector.getAddresses(nodeIdentity, 0, 0, 5);

			let address0 = addresses[0];

			if (engineDefaultTypes.walletConnector === "iota") {
				address0 = `${envVars.iotaExplorerEndpoint}addr/${address0}`;
			}

			engineCore.logInfo(I18n.formatMessage("workbench.fundingWallet", { address: address0 }));

			// Add some funds to the wallet from the faucet
			await walletConnector.ensureBalance(nodeIdentity, addresses[0], 1000000000n);

			engineCore.logInfo(I18n.formatMessage("workbench.generatingNodeIdentity"));

			// Now create an identity for the node controlled by the address we just funded
			const identityConnector = IdentityConnectorFactory.get(engineDefaultTypes.identityConnector);
			const identityDocument = await identityConnector.createDocument(nodeIdentity);

			if (engineDefaultTypes.identityConnector === "iota") {
				engineCore.logInfo(
					I18n.formatMessage("workbench.identityExplorer", {
						url: `${envVars.iotaExplorerEndpoint}addr/${IotaIdentityUtils.didToAddress(identityDocument.id)}?tab=DID`
					})
				);
			}

			// If we are using entity storage for wallet the identity associated with the
			// address will be wrong, so fix it
			if (engineDefaultTypes.walletConnector === "entity-storage") {
				const walletAddress = EntityStorageConnectorFactory.get<
					IEntityStorageConnector<WalletAddress>
				>(StringHelper.kebabCase(nameof<WalletAddress>()));
				const addr = await walletAddress.get(addresses[0]);
				if (!Is.empty(addr)) {
					addr.identity = identityDocument.id;
					await walletAddress.set(addr);
				}
			}

			// Now that we have an identity we can remove the temporary one
			// and store the mnemonic with the new identity
			await vaultConnector.setSecret(`${identityDocument.id}/mnemonic`, mnemonic);
			await vaultConnector.removeSecret(tempSecretName);
			tempSecretName = undefined;

			context.state.nodeIdentity = identityDocument.id;
			context.state.addresses = addresses;
			context.stateDirty = true;

			engineCore.logInfo(
				I18n.formatMessage("workbench.nodeIdentity", {
					identity: context.state.nodeIdentity
				})
			);
		} finally {
			// remove the temp secret name if something went wrong and it still exists
			if (Is.stringValue(tempSecretName)) {
				try {
					await vaultConnector.removeSecret(tempSecretName);
				} catch {}
			}
		}
	}
}

/**
 * Bootstrap the user.
 * @param engineCore The engine core for the node.
 * @param context The context for the node.
 * @param envVars The environment variables for the node.
 */
export async function bootstrapNodeUser(
	engineCore: IEngineCore,
	context: IEngineCoreContext<IWorkbenchState>,
	envVars: IEngineCoreEnvironmentVariables & IEngineServerEnvironmentVariables
): Promise<void> {
	const engineDefaultTypes = engineCore.getDefaultTypes();
	if (
		engineDefaultTypes.authenticationComponent === "authentication-entity-storage" &&
		Is.stringValue(context.state.nodeIdentity) &&
		!context.state.bootstrappedComponents.includes("LoginUser")
	) {
		// Create the login for the node user
		const authUserEntityStorage = EntityStorageConnectorFactory.get<
			IEntityStorageConnector<AuthenticationUser>
		>(StringHelper.kebabCase(nameof<AuthenticationUser>()));

		const generatedPassword = PasswordGenerator.generate(16);
		const passwordBytes = Converter.utf8ToBytes(generatedPassword);
		const saltBytes = RandomHelper.generate(16);

		const hashedPassword = await PasswordHelper.hashPassword(passwordBytes, saltBytes);

		const nodeAdminUser: AuthenticationUser = {
			email: envVars.adminUsername,
			password: hashedPassword,
			salt: Converter.bytesToBase64(saltBytes),
			identity: context.state.nodeIdentity
		};

		engineCore.logInfo(
			I18n.formatMessage("workbench.nodeAdminUserEmail", { email: nodeAdminUser.email })
		);
		engineCore.logInfo(
			I18n.formatMessage("workbench.nodeAdminUserPassword", { password: generatedPassword })
		);

		await authUserEntityStorage.set(nodeAdminUser);

		// We have create a node user, now we need to create a profile for the user
		const identityProfileConnector = IdentityProfileConnectorFactory.get(
			engineDefaultTypes.identityProfileConnector
		);

		if (identityProfileConnector) {
			const publicProfile: WithContext<Person> = {
				"@context": "https://schema.org",
				"@type": "Person",
				name: "Node Administrator"
			};
			const privateProfile: WithContext<Person> = {
				"@context": "https://schema.org",
				"@type": "Person",
				givenName: "Node",
				familyName: "Administrator",
				email: nodeAdminUser.email
			};
			await identityProfileConnector.create(
				context.state.nodeIdentity,
				publicProfile,
				privateProfile
			);
		}
		context.state.bootstrappedComponents.push("LoginUser");
		context.stateDirty = true;
	}
}

/**
 * Bootstrap the attestation verification methods.
 * @param engineCore The engine core for the node.
 * @param context The context for the node.
 * @param envVars The environment variables for the node.
 */
export async function bootstrapAttestationMethod(
	engineCore: IEngineCore,
	context: IEngineCoreContext<IWorkbenchState>,
	envVars: IEngineCoreEnvironmentVariables & IEngineServerEnvironmentVariables
): Promise<void> {
	if (
		Is.stringValue(context.state.nodeIdentity) &&
		!context.state.bootstrappedComponents.includes("AttestationMethod")
	) {
		const engineDefaultTypes = engineCore.getDefaultTypes();
		const identityConnector = IdentityConnectorFactory.get(engineDefaultTypes.identityConnector);

		// Add attestation verification method to DID, the correct node context is now in place
		// so the keys for the verification method will be stored correctly
		engineCore.logInfo(I18n.formatMessage("workbench.addingAttestation"));
		await identityConnector.addVerificationMethod(
			context.state.nodeIdentity,
			context.state.nodeIdentity,
			"assertionMethod",
			envVars.attestationAssertionMethodId
		);

		context.state.bootstrappedComponents.push("AttestationMethod");
		context.stateDirty = true;
	}
}

/**
 * Bootstrap the immutable proof verification methods.
 * @param engineCore The engine core for the node.
 * @param context The context for the node.
 * @param envVars The environment variables for the node.
 */
export async function bootstrapImmutableProofMethod(
	engineCore: IEngineCore,
	context: IEngineCoreContext<IWorkbenchState>,
	envVars: IEngineCoreEnvironmentVariables & IEngineServerEnvironmentVariables
): Promise<void> {
	const engineDefaultTypes = engineCore.getDefaultTypes();
	if (
		Is.stringValue(context.state.nodeIdentity) &&
		!context.state.bootstrappedComponents.includes("ImmutableProofMethod")
	) {
		const identityConnector = IdentityConnectorFactory.get(engineDefaultTypes.identityConnector);

		// Add AIG verification method to DID, the correct node context is now in place
		// so the keys for the verification method will be stored correctly
		engineCore.logInfo(I18n.formatMessage("workbench.addingImmutableProof"));
		await identityConnector.addVerificationMethod(
			context.state.nodeIdentity,
			context.state.nodeIdentity,
			"assertionMethod",
			envVars.immutableProofAssertionMethodId
		);

		context.state.bootstrappedComponents.push("ImmutableProofMethod");
		context.stateDirty = true;
	}
}

/**
 * Bootstrap the keys for blob encryption.
 * @param engineCore The engine core for the node.
 * @param context The context for the node.
 * @param envVars The environment variables for the node.
 */
export async function bootstrapBlobEncryption(
	engineCore: IEngineCore,
	context: IEngineCoreContext<IWorkbenchState>,
	envVars: IEngineCoreEnvironmentVariables & IEngineServerEnvironmentVariables
): Promise<void> {
	if (
		(Coerce.boolean(envVars.blobStorageEnableEncryption) ?? false) &&
		Is.stringValue(context.state.nodeIdentity) &&
		!context.state.bootstrappedComponents.includes("BlobEncryption")
	) {
		const engineDefaultTypes = engineCore.getDefaultTypes();

		// Create a new key for encrypting blobs
		const vaultConnector = VaultConnectorFactory.get(engineDefaultTypes.vaultConnector);

		await vaultConnector.createKey(
			`${context.state.nodeIdentity}/${envVars.blobStorageEncryptionKey}`,
			VaultKeyType.ChaCha20Poly1305
		);

		context.state.bootstrappedComponents.push("BlobEncryption");
		context.stateDirty = true;
	}
}

/**
 * Bootstrap the keys for immutable proof encryption.
 * @param engineCore The engine core for the node.
 * @param context The context for the node.
 * @param envVars The environment variables for the node.
 */
export async function bootstrapImmutableProofEncryption(
	engineCore: IEngineCore,
	context: IEngineCoreContext<IWorkbenchState>,
	envVars: IEngineCoreEnvironmentVariables & IEngineServerEnvironmentVariables
): Promise<void> {
	if (
		Is.stringValue(context.state.nodeIdentity) &&
		!context.state.bootstrappedComponents.includes("ImmutableProof")
	) {
		const engineDefaultTypes = engineCore.getDefaultTypes();

		// Create a new key for encrypting auditable item graph data
		const vaultConnector = VaultConnectorFactory.get(engineDefaultTypes.vaultConnector);

		await vaultConnector.createKey(
			`${context.state.nodeIdentity}/${envVars.immutableProofHashKeyId}`,
			VaultKeyType.Ed25519
		);

		context.state.bootstrappedComponents.push("ImmutableProof");
		context.stateDirty = true;
	}
}

/**
 * Bootstrap the JWT signing key.
 * @param engineCore The engine core for the node.
 * @param context The context for the node.
 * @param envVars The environment variables for the node.
 */
export async function bootstrapAuth(
	engineCore: IEngineCore,
	context: IEngineCoreContext<IWorkbenchState>,
	envVars: IEngineCoreEnvironmentVariables & IEngineServerEnvironmentVariables
): Promise<void> {
	const engineDefaultTypes = engineCore.getDefaultTypes();
	if (
		engineDefaultTypes.authenticationComponent === "authentication-entity-storage" &&
		Is.stringValue(context.state.nodeIdentity) &&
		!context.state.bootstrappedComponents.includes("JwtKey")
	) {
		// Create a new JWT signing key and a user login for the node
		const vaultConnector = VaultConnectorFactory.get(engineDefaultTypes.vaultConnector);
		await vaultConnector.createKey(
			`${context.state.nodeIdentity}/${envVars.authSigningKeyId}`,
			VaultKeyType.Ed25519
		);

		context.state.bootstrappedComponents.push("JwtKey");
		context.stateDirty = true;
	}
}
