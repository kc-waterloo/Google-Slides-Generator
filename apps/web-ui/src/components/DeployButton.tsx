/**
 * DeployButton.tsx
 *
 * Created by Min-Kyu Lee on 01-06-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { useState } from "react";
import type { DeployState } from "../hooks/useDeploy";

type Props = {
	state: DeployState;
	generatedCode: string | null;
	onDeploy: (scriptId: string, code: string) => void;
	onAuthenticate: () => void;
	onSignOut: () => void;
	onReset: () => void;
	clientId: string;
	onClientIdChange: (id: string) => void;
};

export const DeployButton = ({
	state,
	generatedCode,
	onDeploy,
	onAuthenticate,
	onSignOut,
	onReset,
	clientId,
	onClientIdChange,
}: Props): React.ReactElement => {
	const [showConfig, setShowConfig] = useState(false);
	const [scriptId, setScriptId] = useState("");

	switch (state.status) {
	case "idle":
	case "no-client-id":
		return (
			<div className="deploy-section">
				{!clientId && (
					<div className="deploy-config">
						<p className="deploy-hint">
							To deploy to Google Apps Script, enter your OAuth client ID:
						</p>
						<input
							className="deploy-input"
							type="text"
							placeholder="Paste your Google OAuth client ID..."
							value={clientId}
							onChange={(e) => onClientIdChange?.(e.target.value)}
						/>
						<button
							className="btn-primary deploy-btn"
							disabled={!clientId.trim()}
							onClick={() => onAuthenticate?.()}
						>
							Authenticate with Google
						</button>
					</div>
				)}
				{clientId && (
					<button className="btn-primary deploy-btn" onClick={() => onAuthenticate?.()}>
						Authenticate with Google
					</button>
				)}
			</div>
		);

	case "authenticating":
		return (
			<div className="deploy-section">
				<button className="btn-primary deploy-btn" disabled>
					Authenticating...
				</button>
			</div>
		);

	case "authenticated":
		return (
			<div className="deploy-section">
				<div className="deploy-authenticated">
					<span className="deploy-status">Authenticated</span>
					<button className="reset-btn" onClick={() => onSignOut?.()}>
						Sign Out
					</button>
				</div>
				{showConfig ? (
					<div className="deploy-config">
						<input
							className="deploy-input"
							type="text"
							placeholder="Paste your Apps Script project ID..."
							value={scriptId}
							onChange={(e) => setScriptId(e.target.value)}
						/>
						<div className="deploy-actions">
							<button
								className="btn-primary deploy-btn"
								disabled={!scriptId.trim() || !generatedCode}
								onClick={() => onDeploy?.(scriptId.trim(), generatedCode ?? "")}
							>
								Deploy
							</button>
							<button className="reset-btn" onClick={() => setShowConfig(false)}>
								Cancel
							</button>
						</div>
					</div>
				) : (
					<button className="btn-primary deploy-btn" onClick={() => setShowConfig(true)}>
						Deploy to Google Apps Script
					</button>
				)}
			</div>
		);

	case "deploying":
		return (
			<div className="deploy-section">
				<button className="btn-primary deploy-btn" disabled>
					Deploying...
				</button>
			</div>
		);

	case "success":
		return (
			<div className="deploy-section">
				<div className="deploy-success">
					<span>Deployed successfully!</span>
					<button className="btn-primary deploy-btn" onClick={() => onReset()}>
						Deploy Again
					</button>
				</div>
			</div>
		);

	case "error":
		return (
			<div className="deploy-section">
				<div className="deploy-error">
					<p className="deploy-error-msg">{state.message}</p>
					<button className="reset-btn" onClick={() => onAuthenticate?.()}>
						Retry
					</button>
				</div>
			</div>
		);
	}
};
