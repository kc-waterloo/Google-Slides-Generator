/**
 * useDeploy.ts
 *
 * Created by Min-Kyu Lee on 01-06-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { useState, useCallback } from "react";
import {
	loadStoredToken,
	storeToken,
	clearToken,
	isTokenValid,
	requestAccessToken,
} from "../auth/google-oauth";
import { deployToGAS } from "../auth/gas-deploy";
import type { TokenInfo } from "../auth/google-oauth";
import type { DeployResult } from "../auth/gas-deploy";

const CLIENT_ID_STORAGE_KEY = "gsg-client-id";

export type DeployState =
	| { status: "idle" }
	| { status: "no-client-id" }
	| { status: "authenticating" }
	| { status: "authenticated"; token: TokenInfo }
	| { status: "deploying" }
	| { status: "success"; result: DeployResult }
	| { status: "error"; message: string };

export function useDeploy() {
	const [state, setState] = useState<DeployState>(() => {
		const token = loadStoredToken();
		if (isTokenValid(token)) {
			return { status: "authenticated", token };
		}
		return { status: "idle" };
	});

	const [clientId, setClientIdState] = useState(() => {
		return localStorage.getItem(CLIENT_ID_STORAGE_KEY) ?? "";
	});

	const setClientId = useCallback((id: string) => {
		localStorage.setItem(CLIENT_ID_STORAGE_KEY, id);
		setClientIdState(id);
	}, []);

	const authenticate = useCallback(async () => {
		const storedId = localStorage.getItem(CLIENT_ID_STORAGE_KEY);
		if (!storedId) {
			setState({ status: "no-client-id" });
			return;
		}
		setState({ status: "authenticating" });
		try {
			const token = await requestAccessToken(storedId);
			setState({ status: "authenticated", token });
		} catch (err) {
			setState({
				status: "error",
				message: err instanceof Error ? err.message : "Authentication failed",
			});
		}
	}, []);

	const signOut = useCallback(() => {
		clearToken();
		setState({ status: "idle" });
	}, []);

	const deploy = useCallback(
		async (scriptId: string, code: string): Promise<void> => {
			setState({ status: "deploying" });
			try {
				const token = loadStoredToken();
				if (!isTokenValid(token)) {
					await authenticate();
					return;
				}
				const result = await deployToGAS(scriptId, code, token.accessToken);
				if (result.success) {
					storeToken(token);
					setState({ status: "success", result });
				} else {
					setState({ status: "error", message: result.error ?? "Deploy failed" });
				}
			} catch (err) {
				setState({
					status: "error",
					message: err instanceof Error ? err.message : "Deploy failed",
				});
			}
		},
		[authenticate],
	);

	const reset = useCallback(() => {
		const token = loadStoredToken();
		if (isTokenValid(token)) {
			setState({ status: "authenticated", token });
		} else {
			setState({ status: "idle" });
		}
	}, []);

	return {
		state,
		clientId,
		setClientId,
		authenticate,
		signOut,
		deploy,
		reset,
	};
}
