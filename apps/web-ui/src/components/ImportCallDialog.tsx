/**
 * ImportCallDialog.tsx
 *
 * Created by Min-Kyu Lee on 25-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { useState } from "react";
import { parseFunctionCall, toPatternParams } from "@gsg/shared";
import type { FunctionSchema } from "@gsg/shared";

type Props = {
	schemas: FunctionSchema[];
	onImport: (name: string, params: Record<string, unknown>) => void;
	onClose: () => void;
};

type ParsedResult = {
	functionName: string;
	params: Record<string, unknown>;
};

export const ImportCallDialog = ({ schemas, onImport, onClose }: Props): React.ReactElement => {
	const [text, setText] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [parsedResult, setParsedResult] = useState<ParsedResult | null>(null);

	const handleParse = () => {
		setError(null);
		const result = parseFunctionCall(text);
		if (!result) {
			setError(
				"Could not parse the function call. Make sure it matches the format: functionName({ key: value, ... })",
			);
			return;
		}

		const schema = schemas.find((s) => s.name === result.functionName);
		if (!schema) {
			setError(
				`Unknown function "${result.functionName}". Available functions: ${schemas.map((s) => s.name).join(", ")}`,
			);
			return;
		}

		setParsedResult({
			functionName: result.functionName,
			params: toPatternParams(schema, result.params),
		});
	};

	const handleConfirmImport = () => {
		onImport?.(parsedResult!.functionName, parsedResult!.params);
		onClose?.();
	};

	const handleEdit = () => {
		setParsedResult(null);
		setError(null);
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
			e.preventDefault();
			if (parsedResult) {
				handleConfirmImport();
			} else {
				handleParse();
			}
		}
	};

	return (
		<div className="dialog-overlay" onClick={() => onClose?.()}>
			<div className="dialog" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => {
				if (e.key === "Escape") {
					e.stopPropagation();
					if (parsedResult) {
						setParsedResult(null);
					} else {
						onClose?.();
					}
					return;
				}
				handleKeyDown(e);
			}}>
				{!parsedResult ? (
					<>
						<div className="dialog-header">
							<h3>Paste Function Call</h3>
							<button className="dialog-close" onClick={() => onClose?.()} aria-label="Close dialog">&times;</button>
						</div>
						<div className="dialog-body">
							<p className="dialog-hint">
								Paste a function call string to edit it visually, or paste from clipboard.
							</p>
							<textarea
								className="dialog-input"
								placeholder={"createLongQuotesSlides({\n  longQuoteItems: [\n    {\n      title: \"Hello\",\n      subtitle: \"World\",\n      quote: \"Sample quote\"\n    }\n  ]\n})"}
								value={text}
								onChange={(e) => setText(e.target.value)}
								rows={10}
								autoFocus
							/>
							{error && <p className="dialog-error">{error}</p>}
						</div>
						<div className="dialog-footer">
							<span className="dialog-footer-hint">Ctrl+Enter to parse</span>
							<div className="dialog-actions">
								<button className="reset-btn" onClick={() => onClose?.()}>Cancel</button>
								<button className="btn-primary" onClick={handleParse} disabled={text.trim().length === 0}>
									Parse
								</button>
							</div>
						</div>
					</>
				) : (
					<>
						<div className="dialog-header">
							<h3>Import Call</h3>
							<button className="dialog-close" onClick={() => onClose?.()} aria-label="Close dialog">&times;</button>
						</div>
						<div className="dialog-body">
							<p className="dialog-hint">
								Parsed <strong>{parsedResult.functionName}</strong> with
								{" "}{Object.keys(parsedResult.params).length} param{Object.keys(parsedResult.params).length !== 1 ? "s" : ""}:
							</p>
							<div className="import-preview">
								<div className="import-preview-fn">
									<span className="import-preview-label">Function</span>
									<code className="import-preview-value">{parsedResult.functionName}</code>
								</div>
								{Object.entries(parsedResult.params).map(([key, value]) => (
									<div key={key} className="import-preview-param">
										<span className="import-preview-label">{key}</span>
										<code className="import-preview-value">
											{typeof value === "string" ? `"${value}"` : JSON.stringify(value)}
										</code>
									</div>
								))}
							</div>
						</div>
						<div className="dialog-footer">
							<span className="dialog-footer-hint">Ctrl+Enter to confirm</span>
							<div className="dialog-actions">
								<button className="reset-btn" onClick={handleEdit}>Edit</button>
								<button className="btn-primary" onClick={handleConfirmImport}>
									Import
								</button>
							</div>
						</div>
					</>
				)}
			</div>
		</div>
	);
};
