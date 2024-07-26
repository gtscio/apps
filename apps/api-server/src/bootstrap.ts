// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

import { PasswordHelper, type AuthenticationUser } from "@gtsc/api-auth-entity-storage-service";
import type { ApiKey } from "@gtsc/api-processors";
import { Converter, I18n, Is, RandomHelper, StringHelper } from "@gtsc/core";
import { Bip39, PasswordGenerator } from "@gtsc/crypto";
import {
	EntityStorageConnectorFactory,
	type IEntityStorageConnector
} from "@gtsc/entity-storage-models";
import { IotaIdentityUtils } from "@gtsc/identity-connector-iota";
import { IdentityConnectorFactory } from "@gtsc/identity-models";
import { nameof } from "@gtsc/nameof";
import type { IService, IServiceRequestContext } from "@gtsc/services";
import { VaultConnectorFactory, VaultKeyType } from "@gtsc/vault-models";
import type { WalletAddress } from "@gtsc/wallet-connector-entity-storage";
import { WalletConnectorFactory } from "@gtsc/wallet-models";
import { SYSTEM_CONFIG_FILENAME, writeSystemConfig } from "./configure.js";
import type { IOptions } from "./models/IOptions";
import { systemLogInfo } from "./services/logging.js";
import { AUTH_SIGNING_NAME_VAULT_KEY } from "./services/processors.js";

/**
 * Bootstrap the application.
 * @param options The options for the web server.
 * @param services The services to bootstrap.
 */
export async function bootstrap(options: IOptions, services: IService[]): Promise<void> {
	const hasIdentity = Is.stringValue(options.systemConfig.systemIdentity);

	for (const service of services) {
		if (Is.function(service.bootstrap)) {
			systemLogInfo(I18n.formatMessage("apiServer.bootstrapping", { element: service.CLASS_NAME }));
			await service.bootstrap(options.systemLoggingConnectorName);
		}
	}

	await bootstrapSystem(options);
	await bootstrapPartition(options);
	await bootstrapAuth(options);

	if (!hasIdentity) {
		systemLogInfo(
			I18n.formatMessage("apiServer.systemConfigRecord", { filename: SYSTEM_CONFIG_FILENAME })
		);
		await writeSystemConfig(options.storageFileRoot, options.systemConfig);
	} else {
		systemLogInfo(
			I18n.formatMessage("apiServer.systemConfigExists", { filename: SYSTEM_CONFIG_FILENAME })
		);
	}
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
		const tempSystemIdentity = `temp:${Converter.bytesToBase64(RandomHelper.generate(32))}`;
		const systemRequestContext: IServiceRequestContext = {
			partitionId: options.systemConfig.systemPartitionId,
			systemIdentity: tempSystemIdentity,
			userIdentity: tempSystemIdentity
		};

		// Create a secure mnemonic and store it in the vault so that wallet operations
		// can be performed
		const mnemonic = Bip39.randomMnemonic();
		systemLogInfo(I18n.formatMessage("apiServer.generatingMnemonic", { mnemonic }));

		const vaultConnector = VaultConnectorFactory.get(options.envVars.GTSC_VAULT_CONNECTOR);
		await vaultConnector.setSecret("mnemonic", mnemonic, systemRequestContext);

		// Generate an address from the wallet, this will use the mnemonic from above
		const walletConnector = WalletConnectorFactory.get(options.envVars.GTSC_WALLET_CONNECTOR);
		const addresses = await walletConnector.getAddresses(0, 5, systemRequestContext);

		let address0 = addresses[0];

		if (options.envVars.GTSC_WALLET_CONNECTOR === "iota") {
			address0 = `${options.envVars.GTSC_IOTA_EXPLORER_URL}addr/${address0}`;
		}

		systemLogInfo(I18n.formatMessage("apiServer.fundingWallet", { address: address0 }));

		// Add some funds to the wallet from the faucet
		await walletConnector.ensureBalance(addresses[0], 1000000000n, undefined, systemRequestContext);

		systemLogInfo(I18n.formatMessage("apiServer.generatingSystemIdentity"));

		// Now create an identity for the system controlled by the address we just funded
		const identityConnector = IdentityConnectorFactory.get(options.envVars.GTSC_IDENTITY_CONNECTOR);
		const identityDocument = await identityConnector.createDocument(
			addresses[0],
			systemRequestContext
		);

		if (options.envVars.GTSC_IDENTITY_CONNECTOR === "iota") {
			systemLogInfo(
				I18n.formatMessage("apiServer.identityExplorer", {
					url: `${process.env.GTSC_IOTA_EXPLORER_URL}addr/${IotaIdentityUtils.didToAddress(identityDocument.id)}?tab=DID`
				})
			);
		}

		// If we are using entity storage for wallet the identity associated with the
		// address will be wrong, so fix it
		if (options.envVars.GTSC_WALLET_CONNECTOR === "entity-storage") {
			const walletAddress = EntityStorageConnectorFactory.get<
				IEntityStorageConnector<WalletAddress>
			>(StringHelper.kebabCase(nameof<WalletAddress>()));
			const addr = await walletAddress.get(addresses[0], undefined, systemRequestContext);
			if (!Is.empty(addr)) {
				addr.identity = identityDocument.id;
				await walletAddress.set(addr, systemRequestContext);
			}
		}

		options.systemConfig.systemIdentity = identityDocument.id;
		options.systemConfig.addresses = addresses;

		// Now that we have an identity we can remove the temporary one
		// and store the mnemonic with the new identity
		await vaultConnector.removeSecret("mnemonic", systemRequestContext);

		systemRequestContext.systemIdentity = identityDocument.id;
		systemRequestContext.userIdentity = identityDocument.id;

		await vaultConnector.setSecret("mnemonic", mnemonic, systemRequestContext);

		// Add attestation verification method to DID, the correct system context is now in place
		// so the keys for the verification method will be stored correctly
		systemLogInfo(I18n.formatMessage("apiServer.addingAttestation"));
		await identityConnector.addVerificationMethod(
			identityDocument.id,
			"assertionMethod",
			"attestation",
			systemRequestContext
		);

		systemLogInfo(
			I18n.formatMessage("apiServer.systemPartition", {
				partition: options.systemConfig.systemPartitionId
			})
		);
		systemLogInfo(
			I18n.formatMessage("apiServer.systemIdentity", {
				identity: options.systemConfig.systemIdentity
			})
		);
	}
}

/**
 * Bootstrap the partitioning.
 * @param options The options for the web server.
 */
export async function bootstrapPartition(options: IOptions): Promise<void> {
	if (options.envVars.GTSC_PARTITION_PROCESSOR_TYPE === "api-key") {
		// Create a new API key for the system if one does not exist
		const systemRequestContext: IServiceRequestContext = {
			partitionId: options.systemConfig.systemPartitionId,
			systemIdentity: options.systemConfig.systemIdentity,
			userIdentity: options.systemConfig.systemIdentity
		};

		const apiKeyEntityStorage = EntityStorageConnectorFactory.get<IEntityStorageConnector<ApiKey>>(
			StringHelper.kebabCase(nameof<ApiKey>())
		);

		const systemApiKey = await apiKeyEntityStorage.get(
			options.systemConfig.systemIdentity,
			"owner",
			systemRequestContext
		);

		if (Is.empty(systemApiKey?.key)) {
			const apiKey = Converter.bytesToBase64(RandomHelper.generate(32));

			systemLogInfo(I18n.formatMessage("apiServer.systemApiKey", { apiKey }));

			await apiKeyEntityStorage.set(
				{
					key: apiKey,
					partitionId: options.systemConfig.systemPartitionId,
					owner: options.systemConfig.systemIdentity
				},
				systemRequestContext
			);
		}
	}
}

/**
 * Bootstrap the users.
 * @param options The options for the web server.
 */
export async function bootstrapAuth(options: IOptions): Promise<void> {
	if (options.envVars.GTSC_AUTH_PROCESSOR_TYPE === "entity-storage") {
		// Create a new JWT signing key and a user login for the system if one does not exist
		const systemRequestContext: IServiceRequestContext = {
			partitionId: options.systemConfig.systemPartitionId,
			systemIdentity: options.systemConfig.systemIdentity,
			userIdentity: options.systemConfig.systemIdentity
		};

		// Create the signing key for the JWT token
		let hasSigningKey = false;
		const vaultConnector = VaultConnectorFactory.get(options.envVars.GTSC_VAULT_CONNECTOR);

		try {
			const vaultKey = await vaultConnector.getKey(
				AUTH_SIGNING_NAME_VAULT_KEY,
				systemRequestContext
			);
			hasSigningKey = Is.notEmpty(vaultKey);
		} catch {}

		if (!hasSigningKey) {
			await vaultConnector.createKey(
				AUTH_SIGNING_NAME_VAULT_KEY,
				VaultKeyType.Ed25519,
				systemRequestContext
			);
		}

		// Create the login for the system user
		const authUserEntityStorage = EntityStorageConnectorFactory.get<
			IEntityStorageConnector<AuthenticationUser>
		>(StringHelper.kebabCase(nameof<AuthenticationUser>()));

		let hasSystemUser = false;
		try {
			const systemUser = await authUserEntityStorage.get(
				"system@system",
				undefined,
				systemRequestContext
			);
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

			await authUserEntityStorage.set(systemUser, systemRequestContext);
		}
	}
}
