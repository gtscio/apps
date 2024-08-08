// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { PasswordHelper, type AuthenticationUser } from "@gtsc/api-auth-entity-storage-service";
import { CLIDisplay } from "@gtsc/cli-core";
import { Converter, I18n, Is, RandomHelper, StringHelper } from "@gtsc/core";
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
import { writeSystemConfig } from "./configure.js";
import type { IOptions } from "./models/IOptions.js";
import { systemLogInfo } from "./services/logging.js";
import { AUTH_SIGNING_NAME_VAULT_KEY } from "./services/processors.js";

/**
 * Bootstrap the application.
 * @param options The options for the web server.
 * @param services The services to bootstrap.
 */
export async function bootstrap(options: IOptions, services: IService[]): Promise<void> {
	CLIDisplay.break();
	CLIDisplay.task(
		I18n.formatMessage("apiServer.bootstrapStarted", { filename: options.systemConfigFilename })
	);
	CLIDisplay.break();

	const hasIdentity = Is.stringValue(options.systemConfig.systemIdentity);

	for (const service of services) {
		if (Is.function(service.bootstrap)) {
			systemLogInfo(I18n.formatMessage("apiServer.bootstrapping", { element: service.CLASS_NAME }));
			await service.bootstrap(options.systemLoggingConnectorName);
		}
	}

	await bootstrapSystem(options);
	await bootstrapAuth(options);

	if (!hasIdentity) {
		systemLogInfo(
			I18n.formatMessage("apiServer.systemConfigRecord", { filename: options.systemConfigFilename })
		);
		CLIDisplay.break();
		await writeSystemConfig(
			options.storageFileRoot,
			options.systemConfigFilename,
			options.systemConfig
		);
	} else {
		systemLogInfo(
			I18n.formatMessage("apiServer.systemConfigExists", { filename: options.systemConfigFilename })
		);
	}

	CLIDisplay.task(I18n.formatMessage("apiServer.bootstrapComplete"));
	CLIDisplay.break();
}

/**
 * Bootstrap the system creating any necessary resources.
 * @param options The options for the web server.
 */
export async function bootstrapSystem(options: IOptions): Promise<void> {
	// If there is no identity set in the system config then we need
	// to setup the identity for the node
	if (!Is.stringValue(options.systemConfig.systemIdentity)) {
		// When we bootstrap the system we need to generate an identity for it,
		// But we have a chicken and egg problem in that we can't create the identity
		// to store the mnemonic in the vault without an identity. We use a temporary identity
		// and then replace it with the new identity later in the process.
		const bootstrapSystemIdentity = `bootstrap-${Converter.bytesToBase64(RandomHelper.generate(32))}`;

		// Create a secure mnemonic and store it in the vault so that wallet operations
		// can be performed
		const mnemonic = Bip39.randomMnemonic();
		systemLogInfo(I18n.formatMessage("apiServer.generatingMnemonic", { mnemonic }));

		const vaultConnector = VaultConnectorFactory.get(options.envVars.SERVER_VAULT_CONNECTOR);
		await vaultConnector.setSecret(`${bootstrapSystemIdentity}/mnemonic`, mnemonic);

		// Generate an address from the wallet, this will use the mnemonic from above
		const walletConnector = WalletConnectorFactory.get(options.envVars.SERVER_WALLET_CONNECTOR);
		const addresses = await walletConnector.getAddresses(bootstrapSystemIdentity, 0, 5);

		let address0 = addresses[0];

		if (options.envVars.SERVER_WALLET_CONNECTOR === "iota") {
			address0 = `${options.envVars.SERVER_IOTA_EXPLORER_URL}addr/${address0}`;
		}

		systemLogInfo(I18n.formatMessage("apiServer.fundingWallet", { address: address0 }));

		// Add some funds to the wallet from the faucet
		await walletConnector.ensureBalance(bootstrapSystemIdentity, addresses[0], 1000000000n);

		systemLogInfo(I18n.formatMessage("apiServer.generatingSystemIdentity"));

		// Now create an identity for the system controlled by the address we just funded
		const identityConnector = IdentityConnectorFactory.get(
			options.envVars.SERVER_IDENTITY_CONNECTOR
		);
		const identityDocument = await identityConnector.createDocument(bootstrapSystemIdentity);

		if (options.envVars.SERVER_IDENTITY_CONNECTOR === "iota") {
			systemLogInfo(
				I18n.formatMessage("apiServer.identityExplorer", {
					url: `${process.env.SERVER_IOTA_EXPLORER_URL}addr/${IotaIdentityUtils.didToAddress(identityDocument.id)}?tab=DID`
				})
			);
		}

		// If we are using entity storage for wallet the identity associated with the
		// address will be wrong, so fix it
		if (options.envVars.SERVER_WALLET_CONNECTOR === "entity-storage") {
			const walletAddress = EntityStorageConnectorFactory.get<
				IEntityStorageConnector<WalletAddress>
			>(StringHelper.kebabCase(nameof<WalletAddress>()));
			const addr = await walletAddress.get(addresses[0]);
			if (!Is.empty(addr)) {
				addr.identity = identityDocument.id;
				await walletAddress.set(addr);
			}
		}

		options.systemConfig.systemIdentity = identityDocument.id;
		options.systemConfig.addresses = addresses;

		// Now that we have an identity we can remove the temporary one
		// and store the mnemonic with the new identity
		await vaultConnector.removeSecret(`${bootstrapSystemIdentity}/mnemonic`);

		await vaultConnector.setSecret(`${identityDocument.id}/mnemonic`, mnemonic);

		// Add attestation verification method to DID, the correct system context is now in place
		// so the keys for the verification method will be stored correctly
		systemLogInfo(I18n.formatMessage("apiServer.addingAttestation"));
		await identityConnector.addVerificationMethod(
			identityDocument.id,
			identityDocument.id,
			"assertionMethod",
			"attestation"
		);

		systemLogInfo(
			I18n.formatMessage("apiServer.systemIdentity", {
				identity: options.systemConfig.systemIdentity
			})
		);
	}
}

/**
 * Bootstrap the users.
 * @param options The options for the web server.
 */
export async function bootstrapAuth(options: IOptions): Promise<void> {
	if (options.envVars.SERVER_AUTH_PROCESSOR_TYPE === "entity-storage") {
		// Create a new JWT signing key and a user login for the system if one does not exist
		// Create the signing key for the JWT token
		let hasSigningKey = false;
		const vaultConnector = VaultConnectorFactory.get(options.envVars.SERVER_VAULT_CONNECTOR);

		try {
			const vaultKey = await vaultConnector.getKey(
				`${options.systemConfig.systemIdentity}/${AUTH_SIGNING_NAME_VAULT_KEY}`
			);
			hasSigningKey = Is.notEmpty(vaultKey);
		} catch {}

		if (!hasSigningKey) {
			await vaultConnector.createKey(
				`${options.systemConfig.systemIdentity}/${AUTH_SIGNING_NAME_VAULT_KEY}`,
				VaultKeyType.Ed25519
			);
		}

		// Create the login for the system user
		const authUserEntityStorage = EntityStorageConnectorFactory.get<
			IEntityStorageConnector<AuthenticationUser>
		>(StringHelper.kebabCase(nameof<AuthenticationUser>()));

		let hasSystemUser = false;
		try {
			const systemUser = await authUserEntityStorage.get("system@system");
			hasSystemUser = Is.notEmpty(systemUser);
		} catch {}

		if (!hasSystemUser) {
			const generatedPassword = PasswordGenerator.generate(16);
			const passwordBytes = Converter.utf8ToBytes(generatedPassword);
			const saltBytes = RandomHelper.generate(16);

			const hashedPassword = await PasswordHelper.hashPassword(passwordBytes, saltBytes);

			const systemUser: AuthenticationUser = {
				email: "system@system",
				password: hashedPassword,
				salt: Converter.bytesToBase64(saltBytes),
				identity: options.systemConfig.systemIdentity
			};

			systemLogInfo(I18n.formatMessage("apiServer.systemUserEmail", { email: systemUser.email }));
			systemLogInfo(
				I18n.formatMessage("apiServer.systemUserPassword", { password: generatedPassword })
			);

			await authUserEntityStorage.set(systemUser);

			// We have create a system user, now we need to create a profile for the user
			const identityProfileConnector = IdentityProfileConnectorFactory.get(
				options.envVars.SERVER_IDENTITY_PROFILE_CONNECTOR
			);

			if (identityProfileConnector) {
				await identityProfileConnector.create(options.systemConfig.systemIdentity, [
					{
						key: "role",
						type: SchemaOrgDataTypes.TYPE_TEXT,
						value: "System",
						isPublic: false
					},
					{
						key: "firstName",
						type: SchemaOrgDataTypes.TYPE_TEXT,
						value: "System",
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
						value: systemUser.email,
						isPublic: false
					}
				]);
			}
		}
	}
}
