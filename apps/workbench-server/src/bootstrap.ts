// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { PasswordHelper, type AuthenticationUser } from "@gtsc/api-auth-entity-storage-service";
import { CLIDisplay } from "@gtsc/cli-core";
import { Converter, GeneralError, I18n, Is, RandomHelper, StringHelper } from "@gtsc/core";
import { Bip39, PasswordGenerator } from "@gtsc/crypto";
import {
	EntityStorageConnectorFactory,
	type IEntityStorageConnector
} from "@gtsc/entity-storage-models";
import { IotaIdentityUtils } from "@gtsc/identity-connector-iota";
import { IdentityConnectorFactory, IdentityProfileConnectorFactory } from "@gtsc/identity-models";
import { nameof } from "@gtsc/nameof";
import { SchemaOrgDataTypes } from "@gtsc/schema";
import type { IService } from "@gtsc/services";
import { VaultConnectorFactory, VaultKeyType } from "@gtsc/vault-models";
import type { WalletAddress } from "@gtsc/wallet-connector-entity-storage";
import { WalletConnectorFactory } from "@gtsc/wallet-models";
import { writeConfig } from "./configure.js";
import type { IWorkbenchContext } from "./models/IWorkbenchContext.js";
import { nodeLogInfo } from "./services/logging.js";
import { AUTH_SIGNING_NAME_VAULT_KEY } from "./services/processors.js";

export const DEFAULT_NODE_ADMIN_EMAIL = "admin@node";

/**
 * Bootstrap the application.
 * @param context The context for the node.
 * @param services The services to bootstrap.
 */
export async function bootstrap(context: IWorkbenchContext, services: IService[]): Promise<void> {
	CLIDisplay.break();
	CLIDisplay.task(
		I18n.formatMessage("workbench.bootstrapStarted", { filename: context.workbenchConfigFilename })
	);
	CLIDisplay.break();

	const hasIdentity = Is.stringValue(context.config.nodeIdentity);

	for (const service of services) {
		if (Is.function(service.bootstrap)) {
			nodeLogInfo(I18n.formatMessage("workbench.bootstrapping", { element: service.CLASS_NAME }));
			const result = await service.bootstrap(context.nodeLoggingConnectorName);
			if (!result) {
				throw new GeneralError("Workbench", "bootstrapFailed");
			}
		}
	}

	await bootstrapNode(context);
	await bootstrapAuth(context);

	if (!hasIdentity) {
		nodeLogInfo(
			I18n.formatMessage("workbench.nodeConfigRecord", {
				filename: context.workbenchConfigFilename
			})
		);
		CLIDisplay.break();
		await writeConfig(context.storageFileRoot, context.workbenchConfigFilename, context.config);
	} else {
		nodeLogInfo(
			I18n.formatMessage("workbench.nodeConfigExists", {
				filename: context.workbenchConfigFilename
			})
		);
	}

	CLIDisplay.task(I18n.formatMessage("workbench.bootstrapComplete"));
	CLIDisplay.break();
}

/**
 * Bootstrap the node creating any necessary resources.
 * @param context The context for the node.
 */
export async function bootstrapNode(context: IWorkbenchContext): Promise<void> {
	// If there is no identity set in the node config then we need
	// to setup the identity for the node
	if (!Is.stringValue(context.config.nodeIdentity)) {
		// When we bootstrap the node we need to generate an identity for it,
		// But we have a chicken and egg problem in that we can't create the identity
		// to store the mnemonic in the vault without an identity. We use a temporary identity
		// and then replace it with the new identity later in the process.
		const bootstrapNodeIdentity = `bootstrap-${Converter.bytesToBase64(RandomHelper.generate(32))}`;

		// Create a secure mnemonic and store it in the vault so that wallet operations
		// can be performed
		const mnemonic = Bip39.randomMnemonic();
		nodeLogInfo(I18n.formatMessage("workbench.generatingMnemonic", { mnemonic }));

		const vaultConnector = VaultConnectorFactory.get(context.envVars.WORKBENCH_VAULT_CONNECTOR);
		await vaultConnector.setSecret(`${bootstrapNodeIdentity}/mnemonic`, mnemonic);

		// Generate an address from the wallet, this will use the mnemonic from above
		const walletConnector = WalletConnectorFactory.get(context.envVars.WORKBENCH_WALLET_CONNECTOR);
		const addresses = await walletConnector.getAddresses(bootstrapNodeIdentity, 0, 5);

		let address0 = addresses[0];

		if (context.envVars.WORKBENCH_WALLET_CONNECTOR === "iota") {
			address0 = `${context.envVars.WORKBENCH_IOTA_EXPLORER_URL}addr/${address0}`;
		}

		nodeLogInfo(I18n.formatMessage("workbench.fundingWallet", { address: address0 }));

		// Add some funds to the wallet from the faucet
		await walletConnector.ensureBalance(bootstrapNodeIdentity, addresses[0], 1000000000n);

		nodeLogInfo(I18n.formatMessage("workbench.generatingNodeIdentity"));

		// Now create an identity for the node controlled by the address we just funded
		const identityConnector = IdentityConnectorFactory.get(
			context.envVars.WORKBENCH_IDENTITY_CONNECTOR
		);
		const identityDocument = await identityConnector.createDocument(bootstrapNodeIdentity);

		if (context.envVars.WORKBENCH_IDENTITY_CONNECTOR === "iota") {
			nodeLogInfo(
				I18n.formatMessage("workbench.identityExplorer", {
					url: `${process.env.WORKBENCH_IOTA_EXPLORER_URL}addr/${IotaIdentityUtils.didToAddress(identityDocument.id)}?tab=DID`
				})
			);
		}

		// If we are using entity storage for wallet the identity associated with the
		// address will be wrong, so fix it
		if (context.envVars.WORKBENCH_WALLET_CONNECTOR === "entity-storage") {
			const walletAddress = EntityStorageConnectorFactory.get<
				IEntityStorageConnector<WalletAddress>
			>(StringHelper.kebabCase(nameof<WalletAddress>()));
			const addr = await walletAddress.get(addresses[0]);
			if (!Is.empty(addr)) {
				addr.identity = identityDocument.id;
				await walletAddress.set(addr);
			}
		}

		context.config.nodeIdentity = identityDocument.id;
		context.config.addresses = addresses;

		// Now that we have an identity we can remove the temporary one
		// and store the mnemonic with the new identity
		await vaultConnector.removeSecret(`${bootstrapNodeIdentity}/mnemonic`);

		await vaultConnector.setSecret(`${identityDocument.id}/mnemonic`, mnemonic);

		// Add attestation verification method to DID, the correct node context is now in place
		// so the keys for the verification method will be stored correctly
		nodeLogInfo(I18n.formatMessage("workbench.addingAttestation"));
		await identityConnector.addVerificationMethod(
			identityDocument.id,
			identityDocument.id,
			"assertionMethod",
			"attestation"
		);

		nodeLogInfo(
			I18n.formatMessage("workbench.nodeIdentity", {
				identity: context.config.nodeIdentity
			})
		);
	}
}

/**
 * Bootstrap the users.
 * @param context The context for the node.
 */
export async function bootstrapAuth(context: IWorkbenchContext): Promise<void> {
	if (context.envVars.WORKBENCH_AUTH_PROCESSOR_TYPE === "entity-storage") {
		// Create a new JWT signing key and a user login for the node if one does not exist
		// Create the signing key for the JWT token
		let hasSigningKey = false;
		const vaultConnector = VaultConnectorFactory.get(context.envVars.WORKBENCH_VAULT_CONNECTOR);

		try {
			const vaultKey = await vaultConnector.getKey(
				`${context.config.nodeIdentity}/${AUTH_SIGNING_NAME_VAULT_KEY}`
			);
			hasSigningKey = Is.notEmpty(vaultKey);
		} catch {}

		if (!hasSigningKey) {
			await vaultConnector.createKey(
				`${context.config.nodeIdentity}/${AUTH_SIGNING_NAME_VAULT_KEY}`,
				VaultKeyType.Ed25519
			);
		}

		// Create the login for the node user
		const authUserEntityStorage = EntityStorageConnectorFactory.get<
			IEntityStorageConnector<AuthenticationUser>
		>(StringHelper.kebabCase(nameof<AuthenticationUser>()));

		let hasNodeAdminUser = false;
		try {
			const nodeAdminUser = await authUserEntityStorage.get(DEFAULT_NODE_ADMIN_EMAIL);
			hasNodeAdminUser = Is.notEmpty(nodeAdminUser);
		} catch {}

		if (!hasNodeAdminUser) {
			const generatedPassword = PasswordGenerator.generate(16);
			const passwordBytes = Converter.utf8ToBytes(generatedPassword);
			const saltBytes = RandomHelper.generate(16);

			const hashedPassword = await PasswordHelper.hashPassword(passwordBytes, saltBytes);

			const nodeAdminUser: AuthenticationUser = {
				email: DEFAULT_NODE_ADMIN_EMAIL,
				password: hashedPassword,
				salt: Converter.bytesToBase64(saltBytes),
				identity: context.config.nodeIdentity
			};

			nodeLogInfo(
				I18n.formatMessage("workbench.nodeAdminUserEmail", { email: nodeAdminUser.email })
			);
			nodeLogInfo(
				I18n.formatMessage("workbench.nodeAdminUserPassword", { password: generatedPassword })
			);

			await authUserEntityStorage.set(nodeAdminUser);

			// We have create a node user, now we need to create a profile for the user
			const identityProfileConnector = IdentityProfileConnectorFactory.get(
				context.envVars.WORKBENCH_IDENTITY_PROFILE_CONNECTOR
			);

			if (identityProfileConnector) {
				await identityProfileConnector.create(context.config.nodeIdentity, [
					{
						key: "role",
						type: SchemaOrgDataTypes.TYPE_TEXT,
						value: "Node",
						isPublic: false
					},
					{
						key: "firstName",
						type: SchemaOrgDataTypes.TYPE_TEXT,
						value: "Node",
						isPublic: false
					},
					{
						key: "lastName",
						type: SchemaOrgDataTypes.TYPE_TEXT,
						value: "Administrator",
						isPublic: false
					},
					{
						key: "email",
						type: SchemaOrgDataTypes.TYPE_TEXT,
						value: nodeAdminUser.email,
						isPublic: false
					}
				]);
			}
		}
	}
}
