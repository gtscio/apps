// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.

/**
 * The configuration for the workbench node.
 */
export interface IWorkbenchConfig {
	/**
	 * The identity for the node.
	 */
	nodeIdentity: string;

	/**
	 * List of addresses for the node.
	 */
	addresses?: string[];
}
