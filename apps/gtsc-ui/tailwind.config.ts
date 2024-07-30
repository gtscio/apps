// Copyright 2024 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
import { execSync } from "node:child_process";
import path from "node:path";
import flowbite from "flowbite/plugin";
import flowbiteTypography from "flowbite-typography";
import type { Config } from "tailwindcss";

const npmRoot = execSync("npm root").toString().trim();

export default {
	content: [
		"./src/**/*.{html,js,svelte,ts}",
		path.join(npmRoot, "/flowbite-svelte/**/*.{html,js,svelte,ts}"),
		path.join(npmRoot, "/flowbite-svelte-blocks/**/*.{html,js,svelte,ts}")
	],

	plugins: [flowbite, flowbiteTypography],

	darkMode: "class",

	theme: {
		extend: {
			colors: {
				// flowbite-svelte
				primary: {
					50: "#FFF5F2",
					100: "#FFF1EE",
					200: "#FFE4DE",
					300: "#FFD5CC",
					400: "#FFBCAD",
					500: "#FE795D",
					600: "#EF562F",
					700: "#EB4F27",
					800: "#CC4522",
					900: "#A5371B"
				}
			}
		}
	}
} as Config;
