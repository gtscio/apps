// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import type { IEngineState } from "@twin.org/engine-models";

/**
 * The configuration for the workbench node.
 */
export interface IWorkbenchState extends IEngineState {
	/**
	 * List of addresses for the node.
	 */
	addresses?: string[];
}
