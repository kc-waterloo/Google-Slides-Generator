/**
 * DeployButton.test.tsx
 *
 * Created by Min-Kyu Lee on 01-06-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { DeployButton } from "../DeployButton";

describe("DeployButton", () => {
	const baseProps = {
		generatedCode: "function test() {}",
		onDeploy: vi.fn(),
		onAuthenticate: vi.fn(),
		onSignOut: vi.fn(),
		onReset: vi.fn(),
		clientId: "",
		onClientIdChange: vi.fn(),
	};

	it("shows client ID input when no clientId set", () => {
		render(<DeployButton {...baseProps} state={{ status: "idle" }} />);
		expect(screen.getByPlaceholderText(/Google OAuth client ID/)).toBeInTheDocument();
	});

	it("shows authenticate button when clientId is set", () => {
		render(
			<DeployButton
				{...baseProps}
				clientId="test-id"
				state={{ status: "idle" }}
			/>,
		);
		expect(screen.getByText("Authenticate with Google")).toBeInTheDocument();
	});

	it("shows authenticating button during auth", () => {
		render(<DeployButton {...baseProps} state={{ status: "authenticating" }} />);
		expect(screen.getByText("Authenticating...")).toBeInTheDocument();
	});

	it("shows authenticated state with sign out and deploy", () => {
		render(
			<DeployButton
				{...baseProps}
				state={{
					status: "authenticated",
					token: { accessToken: "t", expiresAt: 9999999999999, scopes: [] },
				}}
			/>,
		);
		expect(screen.getByText("Authenticated")).toBeInTheDocument();
		expect(screen.getByText("Sign Out")).toBeInTheDocument();
		expect(screen.getByText("Deploy to Google Apps Script")).toBeInTheDocument();
	});

	it("shows script ID input when deploy clicked", () => {
		render(
			<DeployButton
				{...baseProps}
				state={{
					status: "authenticated",
					token: { accessToken: "t", expiresAt: 9999999999999, scopes: [] },
				}}
			/>,
		);
		fireEvent.click(screen.getByText("Deploy to Google Apps Script"));
		expect(screen.getByPlaceholderText(/Apps Script project ID/)).toBeInTheDocument();
	});

	it("calls onDeploy when deploy confirmed", () => {
		const onDeploy = vi.fn();
		render(
			<DeployButton
				{...baseProps}
				onDeploy={onDeploy}
				state={{
					status: "authenticated",
					token: { accessToken: "t", expiresAt: 9999999999999, scopes: [] },
				}}
			/>,
		);
		fireEvent.click(screen.getByText("Deploy to Google Apps Script"));
		const input = screen.getByPlaceholderText(/Apps Script project ID/);
		fireEvent.change(input, { target: { value: "my-script-id" } });
		fireEvent.click(screen.getByText("Deploy"));
		expect(onDeploy).toHaveBeenCalledWith("my-script-id", "function test() {}");
	});

	it("calls onSignOut when sign out clicked", () => {
		const onSignOut = vi.fn();
		render(
			<DeployButton
				{...baseProps}
				onSignOut={onSignOut}
				state={{
					status: "authenticated",
					token: { accessToken: "t", expiresAt: 9999999999999, scopes: [] },
				}}
			/>,
		);
		fireEvent.click(screen.getByText("Sign Out"));
		expect(onSignOut).toHaveBeenCalled();
	});

	it("shows deploying state", () => {
		render(<DeployButton {...baseProps} state={{ status: "deploying" }} />);
		expect(screen.getByText("Deploying...")).toBeInTheDocument();
	});

	it("shows success state", () => {
		render(
			<DeployButton
				{...baseProps}
				state={{
					status: "success",
					result: { success: true, versionNumber: 5, updateTime: "2026-01-01T00:00:00Z" },
				}}
			/>,
		);
		expect(screen.getByText(/Deployed successfully/)).toBeInTheDocument();
	});

	it("shows error state with retry button", () => {
		const onAuthenticate = vi.fn();
		render(
			<DeployButton
				{...baseProps}
				onAuthenticate={onAuthenticate}
				state={{ status: "error", message: "Auth failed" }}
			/>,
		);
		expect(screen.getByText("Auth failed")).toBeInTheDocument();
		fireEvent.click(screen.getByText("Retry"));
		expect(onAuthenticate).toHaveBeenCalled();
	});

	it("success state shows Deploy Again button and calls onReset", () => {
		const onReset = vi.fn();
		render(
			<DeployButton
				{...baseProps}
				onReset={onReset}
				state={{
					status: "success",
					result: { success: true, versionNumber: 5, updateTime: "2026-01-01T00:00:00Z" },
				}}
			/>,
		);
		expect(screen.getByText(/Deployed successfully/)).toBeInTheDocument();
		expect(screen.getByText("Deploy Again")).toBeInTheDocument();
		fireEvent.click(screen.getByText("Deploy Again"));
		expect(onReset).toHaveBeenCalled();
	});

	it("calls onClientIdChange when client ID input changes", () => {
		const onClientIdChange = vi.fn();
		render(
			<DeployButton
				{...baseProps}
				onClientIdChange={onClientIdChange}
				state={{ status: "idle" }}
			/>,
		);
		const input = screen.getByPlaceholderText(/Google OAuth client ID/);
		fireEvent.change(input, { target: { value: "my-client-id.apps.googleusercontent.com" } });
		expect(onClientIdChange).toHaveBeenCalledWith("my-client-id.apps.googleusercontent.com");
	});

	it("cancel button closes deploy config", () => {
		render(
			<DeployButton
				{...baseProps}
				state={{
					status: "authenticated",
					token: { accessToken: "t", expiresAt: 9999999999999, scopes: [] },
				}}
			/>,
		);
		fireEvent.click(screen.getByText("Deploy to Google Apps Script"));
		expect(screen.getByPlaceholderText(/Apps Script project ID/)).toBeInTheDocument();
		fireEvent.click(screen.getByText("Cancel"));
		expect(screen.queryByPlaceholderText(/Apps Script project ID/)).not.toBeInTheDocument();
	});

	it("disables deploy button when generatedCode is null", () => {
		render(
			<DeployButton
				{...baseProps}
				generatedCode={null}
				state={{
					status: "authenticated",
					token: { accessToken: "t", expiresAt: 9999999999999, scopes: [] },
				}}
			/>,
		);
		fireEvent.click(screen.getByText("Deploy to Google Apps Script"));
		const input = screen.getByPlaceholderText(/Apps Script project ID/);
		fireEvent.change(input, { target: { value: "my-script-id" } });
		const deployBtn = screen.getByText("Deploy").closest("button");
		expect(deployBtn).toBeDisabled();
	});

	it("does not crash when onAuthenticate is null", () => {
		render(
			<DeployButton
				state={{ status: "idle" }}
				generatedCode="function test() {}"
				onDeploy={vi.fn()}
				onAuthenticate={null as unknown as () => void}
				onSignOut={vi.fn()}
				onReset={vi.fn()}
				clientId="test-client-id"
				onClientIdChange={vi.fn()}
			/>,
		);
		expect(screen.getByText("Authenticate with Google")).toBeTruthy();
	});

	it("does not crash when onDeploy is null", () => {
		render(
			<DeployButton
				state={{ status: "authenticated", token: { accessToken: "test", expiresAt: Date.now() + 3600000, scopes: [] } }}
				generatedCode="function test() {}"
				onDeploy={null as unknown as (scriptId: string, code: string) => void}
				onAuthenticate={vi.fn()}
				onSignOut={vi.fn()}
				onReset={vi.fn()}
				clientId="test-client-id"
				onClientIdChange={vi.fn()}
			/>,
		);
		expect(screen.getByText("Deploy to Google Apps Script")).toBeTruthy();
	});
});
