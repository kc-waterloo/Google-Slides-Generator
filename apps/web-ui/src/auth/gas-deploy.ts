/**
 * gas-deploy.ts
 *
 * Created by Min-Kyu Lee on 01-06-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

export interface DeployResult {
	success: boolean;
	versionNumber?: number;
	updateTime?: string;
	error?: string;
}

const APPS_SCRIPT_API = "https://script.googleapis.com/v1";

async function apiFetch<T>(
	path: string,
	token: string,
	options: RequestInit = {},
): Promise<T> {
	const res = await fetch(`${APPS_SCRIPT_API}${path}`, {
		...options,
		headers: {
			"Authorization": `Bearer ${token}`,
			"Content-Type": "application/json",
			...options.headers,
		},
	});

	if (!res.ok) {
		const body = await res.text();
		let message: string;
		try {
			const err = JSON.parse(body);
			message = err.error?.message ?? err.message ?? body;
		} catch {
			message = body;
		}
		throw new Error(`Apps Script API error (${res.status}): ${message}`);
	}

	return res.json() as Promise<T>;
}

export async function updateScriptContent(
	scriptId: string,
	code: string,
	token: string,
): Promise<{ versionNumber: number; updateTime: string }> {
	const result = await apiFetch<{
		versionNumber: number;
		updateTime: string;
	}>(`/projects/${scriptId}/content`, token, {
		method: "PUT",
		body: JSON.stringify({
			files: [
				{
					name: "generated",
					type: "SERVER_JS",
					source: code,
				},
			],
		}),
	});
	const versionNumber = result.versionNumber ?? 0;
	if (versionNumber === 0) {
		throw new Error("Apps Script API returned success without versionNumber");
	}
	return {
		versionNumber,
		updateTime: result.updateTime ?? new Date().toISOString(),
	};
}

export async function deployToGAS(
	scriptId: string,
	code: string,
	token: string,
): Promise<DeployResult> {
	try {
		const result = await updateScriptContent(scriptId, code, token);
		return {
			success: true,
			versionNumber: result.versionNumber,
			updateTime: result.updateTime,
		};
	} catch (err) {
		return {
			success: false,
			error: err instanceof Error ? err.message : (typeof err === "object" && err !== null && "message" in err ? String((err as Record<string, unknown>).message) : "Unknown error"),
		};
	}
}
