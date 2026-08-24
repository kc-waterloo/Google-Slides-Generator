/**
 * ParamInput.tsx
 *
 * Created by Min-Kyu Lee on 24-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { useMemo, useRef, useEffect } from "react";
import type { ParamSchema } from "@gsg/shared";
import { splitIntoParagraphs } from "../utils/split-into-paragraphs";
import { toDisplayName } from "../utils/display-name";

type Props = {
	schema: ParamSchema;
	value: unknown;
	onChange?: (value: unknown) => void;
	errors?: string[];
	spreadsheetHeaders?: string[];
};

const placeholderText = (schema: ParamSchema): string => {
	if (schema.defaultValue === undefined) return "";
	return `default: ${JSON.stringify(schema.defaultValue)}`;
};


const SPLIT_MODES = [
	{ value: "paragraph", label: "Paragraphs (blank line)" },
	{ value: "sentence", label: "By sentence" },
	{ value: "char-count", label: "By character count" },
	{ value: "none", label: "No split (one slide)" },
];

export const ParamInput = ({ schema, value, onChange, errors = [], spreadsheetHeaders = [] }: Props): React.ReactElement | null => {
	if (!schema) return null;
	const id = `param-${schema.name}`;
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	const handleStringChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
		onChange?.(e.target.value);
	};

	const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const raw = e.target.value;
		onChange?.(raw === "" ? undefined : Number(raw));
	};

	const handleBooleanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		onChange?.(e.target.checked);
	};

	useEffect(() => {
		const ta = textareaRef.current;
		if (ta) {
			ta.style.height = "auto";
			ta.style.height = `${Math.max(60, ta.scrollHeight)}px`;
		}
	}, [value]);

	const strValue = typeof value === "string" ? value : "";
	const showQuotePreview = schema.name === "quote" && strValue.trim().length > 0;
	const paragraphs = useMemo(
		() => showQuotePreview ? splitIntoParagraphs(strValue) : [],
		[showQuotePreview, strValue],
	);
	const slideEstimate = paragraphs.length > 0 ? 1 + paragraphs.length : null;
	const isMultiline = strValue.includes("\n") || schema.name === "quote";

	return (
		<div className="param-group">
			<div className="param-label-row">
				<label className="param-label" htmlFor={id}>
					{toDisplayName(schema.name)}
					{!schema.optional && <span className="param-required">*</span>}
					<span className="param-code-name">{schema.name}</span>
				</label>
				<span className="param-type-badge">{schema.type}</span>
				{schema.defaultValue !== undefined && (
					<span className="param-default">default: <code>{JSON.stringify(schema.defaultValue)}</code></span>
				)}
			</div>
			{schema.description && <p className="param-desc">{schema.description}</p>}
			{schema.name === "splitMode" ? (
				<select
					id={id}
					value={strValue || "paragraph"}
					onChange={handleStringChange}
					className={errors.length > 0 ? "input-error" : ""}
				>
					{SPLIT_MODES.map((m) => (
						<option key={m.value} value={m.value}>{m.label}</option>
					))}
				</select>
			) : schema.type === "boolean" ? (
				<input
					id={id}
					type="checkbox"
					checked={Boolean(value)}
					onChange={handleBooleanChange}
				/>
			) : schema.type === "number" ? (
				<>
					<input
						id={id}
						type="number"
						placeholder={placeholderText(schema)}
						value={String(value ?? "")}
						onChange={handleNumberChange}
						className={errors.length > 0 ? "input-error" : ""}
					/>
					{spreadsheetHeaders.length > 0 && value !== undefined && typeof value === "number" && value >= 0 && value < spreadsheetHeaders.length && (
						<p className="col-hint">
							Column {value} = {spreadsheetHeaders[value]}
						</p>
					)}
				</>
			) : isMultiline ? (
				<textarea
					ref={textareaRef}
					id={id}
					placeholder={placeholderText(schema)}
					value={strValue}
					onChange={handleStringChange}
					className={errors.length > 0 ? "input-error" : ""}
					style={{ maxHeight: "400px", overflowY: "auto" }}
				/>
			) : (
				<input
					id={id}
					type="text"
					placeholder={placeholderText(schema)}
					value={strValue}
					onChange={handleStringChange}
					className={errors.length > 0 ? "input-error" : ""}
				/>
			)}

			{showQuotePreview && (
				<div className="quote-preview">
					<p className="quote-preview-header">
						{strValue.length} chars &middot; {paragraphs.length} paragraph{paragraphs.length !== 1 ? "s" : ""}
						{` · ${slideEstimate} slide${slideEstimate !== 1 ? "s" : ""} per item`}
					</p>
					<div className="quote-preview-slides">
						<div className="quote-preview-slide quote-preview-title">
							<span className="quote-preview-label">Title slide</span>
						</div>
						{paragraphs.map((para, i) => (
							<div key={i} className="quote-preview-slide">
								<span className="quote-preview-label">Slide {i + 1}</span>
								<span className="quote-preview-text">{para.length > 120 ? para.slice(0, 120) + "…" : para}</span>
							</div>
						))}
					</div>
				</div>
			)}

			{errors.map((msg, i) => (
				<p key={i} className="field-error">{msg}</p>
			))}
		</div>
	);
};


