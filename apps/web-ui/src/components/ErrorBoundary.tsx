/**
 * ErrorBoundary.tsx
 *
 * Created by Min-Kyu Lee on 01-06-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";

type Props = {
	children: ReactNode;
	fallback?: ReactNode;
};

type State = {
	hasError: boolean;
	error: Error | null;
};

export class ErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error };
	}

	override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
		console.error("ErrorBoundary caught:", error, errorInfo);
	}

	handleReset = (): void => {
		this.setState({ hasError: false, error: null });
	};

	override render(): ReactNode {
		if (this.state.hasError) {
			if (this.props.fallback) {
				return this.props.fallback;
			}
			return (
				<div className="error-boundary">
					<h2>Something went wrong</h2>
					<p>{this.state.error?.message ?? "An unexpected error occurred"}</p>
					<button className="btn-primary" onClick={this.handleReset} type="button">
						Try Again
					</button>
				</div>
			);
		}
		return this.props.children;
	}
}
