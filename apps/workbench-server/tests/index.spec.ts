// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { ComponentFactory } from "@twin.org/core";
import { MemoryStateStorage } from "@twin.org/engine-core";
import {
	AttestationConnectorType,
	BackgroundTaskConnectorType,
	BlobStorageConnectorType,
	EntityStorageConnectorType,
	FaucetConnectorType,
	IdentityConnectorType,
	IdentityProfileConnectorType,
	ImmutableStorageConnectorType,
	LoggingConnectorType,
	NftConnectorType,
	TelemetryConnectorType,
	VaultConnectorType,
	WalletConnectorType
} from "@twin.org/engine-types";
import type { MemoryEntityStorageConnector } from "@twin.org/entity-storage-connector-memory";
import { EntityStorageConnectorFactory } from "@twin.org/entity-storage-models";
import type { IWorkbenchVariables } from "../src/models/IWorkbenchVariables";
import { start } from "../src/server";
import { initialiseLocales } from "../src/utils";

describe("workbench-server", () => {
	test("Can start and bootstrap the server with minimal config in memory", async () => {
		const config: IWorkbenchVariables = {
			debug: "true",
			entityStorageConnectorType: EntityStorageConnectorType.Memory
		};

		await initialiseLocales(".");

		const memoryStateStorage = new MemoryStateStorage(false, {
			nodeIdentity: "bob",
			bootstrappedComponents: [],
			componentStates: {}
		});

		const startResult = await start(
			{
				name: "foo",
				version: "0.0.0"
			},
			config,
			"",
			memoryStateStorage
		);

		const res = await fetch("http://localhost:3000/info");
		expect(await res.json()).toEqual({
			name: "foo",
			version: "0.0.0"
		});

		expect(ComponentFactory.names()).toEqual(["logging", "information"]);

		await startResult.server.stop();
	});

	test("Can start and bootstrap the server in memory", async () => {
		const config: IWorkbenchVariables = {
			entityStorageConnectorType: EntityStorageConnectorType.Memory,
			blobStorageConnectorType: BlobStorageConnectorType.Memory,
			loggingConnector: LoggingConnectorType.EntityStorage,
			telemetryConnector: TelemetryConnectorType.EntityStorage,
			backgroundTaskConnector: BackgroundTaskConnectorType.EntityStorage,
			vaultConnector: VaultConnectorType.EntityStorage,
			identityConnector: IdentityConnectorType.EntityStorage,
			identityProfileConnector: IdentityProfileConnectorType.EntityStorage,
			nftConnector: NftConnectorType.EntityStorage,
			immutableStorageConnector: ImmutableStorageConnectorType.EntityStorage,
			attestationConnector: AttestationConnectorType.EntityStorage,
			faucetConnector: FaucetConnectorType.EntityStorage,
			walletConnector: WalletConnectorType.EntityStorage
		};

		await initialiseLocales(".");

		const memoryStateStorage = new MemoryStateStorage();

		const startResult = await start(
			{
				name: "foo",
				version: "0.0.0"
			},
			config,
			"",
			memoryStateStorage
		);

		expect(startResult).toBeDefined();

		const res = await fetch("http://localhost:3000/info");
		expect(await res.json()).toEqual({
			name: "foo",
			version: "0.0.0"
		});

		expect(ComponentFactory.names()).toEqual([
			"logging",
			"user-attestation-entry",
			"blob",
			"did",
			"identity-profile",
			"nft",
			"immutable-proof",
			"attestation",
			"aig",
			"ais",
			"information"
		]);

		const identityDocumentEntityStorage =
			EntityStorageConnectorFactory.get<MemoryEntityStorageConnector>("identity-document");
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const identityDocument = identityDocumentEntityStorage.getStore()[0] as any;
		expect(identityDocument?.document?.assertionMethod?.length).toEqual(2);

		await startResult.server.stop();
	});
});
