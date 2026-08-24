/**
 * ParamEditor.tsx
 *
 * Created by Min-Kyu Lee on 24-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { useRef, useEffect, useState, useCallback } from "react";
import { isRecordArray } from "@gsg/shared";
import type { FunctionSchema, ValidationError, ParamSchema } from "@gsg/shared";
import { ParamInput } from "./ParamInput";
import { toDisplayName } from "../utils/display-name";
import { ArrayEditor } from "./ArrayEditor";
import { RegexpEditor } from "./RegexpEditor";

type Props = {
	schema: FunctionSchema;
	params: Record<string, unknown>;
	onChange: (name: string, value: unknown) => void;
	errors: ValidationError[];
	spreadsheetHeaders?: string[];
};

const Section = ({
	title,
	defaultOpen,
	children,
	toggleVersion,
	toggleOpen,
}: {
	title: string;
	defaultOpen: boolean;
	children: React.ReactNode;
	toggleVersion: number;
	toggleOpen: boolean;
}): React.ReactElement => {
	const [open, setOpen] = useState(defaultOpen);
	const prevVersion = useRef(toggleVersion);

	useEffect(() => {
		if (prevVersion.current !== toggleVersion) {
			prevVersion.current = toggleVersion;
			setOpen(toggleOpen);
		}
	}, [toggleVersion, toggleOpen]);

	return (
		<div className="param-section">
			<button
				className="param-section-toggle"
				onClick={() => setOpen(!open)}
				type="button"
				aria-expanded={open}
			>
				<span className={`param-section-arrow ${open ? "open" : ""}`}>&#9662;</span>
				{title}
			</button>
			{open && <div className="param-section-body">{children}</div>}
		</div>
	);
};

const renderParam = (
	paramName: string,
	param: ParamSchema,
	params: Record<string, unknown>,
	onChange: (name: string, value: unknown) => void,
	errors: ValidationError[],
	spreadsheetHeaders: string[] = [],
): React.ReactElement => {
	if (param.type === "object[]") {
		return (
			<div key={paramName} id={`param-${paramName}`} className="param-group">
				<div className="param-label-row">
					<label className="param-label">
						{toDisplayName(paramName)}
						{!param.optional && <span className="param-required">*</span>}
						<span className="param-code-name">{paramName}</span>
					</label>
					<span className="param-type-badge">{param.type}</span>
					{param.defaultValue !== undefined && (
						<span className="param-default">default: <code>{JSON.stringify(param.defaultValue)}</code></span>
					)}
				</div>
				{param.description && <p className="param-desc">{param.description}</p>}
				<ArrayEditor
					schema={param}
					values={isRecordArray(params[paramName]) ? params[paramName] : []}
					onChange={(v) => onChange(paramName, v)}
					errors={errors}
				/>
			</div>
		);
	}

	if (param.type === "RegExp[]") {
		return (
			<div key={paramName} id={`param-${paramName}`} className="param-group">
				<div className="param-label-row">
					<label className="param-label">
						{toDisplayName(paramName)}
						{!param.optional && <span className="param-required">*</span>}
						<span className="param-code-name">{paramName}</span>
					</label>
					<span className="param-type-badge">{param.type}</span>
					{param.defaultValue !== undefined && (
						<span className="param-default">default: <code>{JSON.stringify(param.defaultValue)}</code></span>
					)}
				</div>
				{param.description && <p className="param-desc">{param.description}</p>}
				<RegexpEditor
					values={(params[paramName] as unknown[]) ?? []}
					onChange={(v) => onChange(paramName, v)}
				/>
			</div>
		);
	}

	return (
		<ParamInput
			key={paramName}
			schema={param}
			value={params[paramName]}
			onChange={(v) => onChange(paramName, v)}
			errors={errors
				.filter((e) => e.field === paramName)
				.map((e) => e.message)}
			spreadsheetHeaders={spreadsheetHeaders}
		/>
	);
};

const scrollToField = (fieldName: string): void => {
	const topLevel = fieldName.split(".")[0]!.replace(/\[.*$/, "");
	const el = document.getElementById(`param-${topLevel}`) ?? document.getElementById(`param-${fieldName}`);
	if (el) {
		el.scrollIntoView({ behavior: "smooth", block: "center" });
		const input = el.querySelector("input, textarea");
		if (input instanceof HTMLElement) input.focus();
	}
};

const groupErrors = (es: ValidationError[]): { field: string; messages: string[] }[] => {
	const map = new Map<string, string[]>();
	for (const e of es) {
		const list = map.get(e.field) ?? [];
		list.push(e.message);
		map.set(e.field, list);
	}
	return Array.from(map.entries()).map(([field, messages]) => ({ field, messages }));
};

export const ParamEditor = ({ schema, params, onChange, errors, spreadsheetHeaders = [] }: Props): React.ReactElement => {
	if (!schema) {
		return <></>;
	}
	const safeParams = params ?? {};

	const entries = Object.entries(schema.parameters);
	const [paramFilter, setParamFilter] = useState("");
	const filterLower = paramFilter.toLowerCase();
	const matches = (name: string): boolean => !filterLower || name.toLowerCase().includes(filterLower);
	const required = entries.filter(([name, p]) => !p.optional && matches(name));
	const optional = entries.filter(([name, p]) => p.optional && matches(name));
	const [toggleVersion, setToggleVersion] = useState(0);
	const [toggleOpen, setToggleOpen] = useState(true);

	const handleToggleAll = useCallback((open: boolean) => {
		setToggleOpen(open);
		setToggleVersion((v) => v + 1);
	}, []);

	return (
		<div>
			{errors.length > 0 && (
				<div className="error-summary">
					<span className="error-summary-title">{errors.length} validation error{errors.length !== 1 ? "s" : ""}</span>
					<div className="error-summary-list">
						{groupErrors(errors).map(({ field, messages }) => (
							<button
								key={field}
								className="error-summary-item"
								onClick={() => scrollToField(field)}
								type="button"
							>
								{field}: {messages.join("; ")}
							</button>
						))}
					</div>
				</div>
			)}
			<div className="param-toggle-all">
				<input
					type="text"
					className="param-filter-input"
					placeholder="Filter parameters..."
					aria-label="Filter parameters"
					value={paramFilter}
					onChange={(e) => setParamFilter(e.target.value)}
				/>
				<div className="toggle-all-actions">
					<button
						className="btn-sm toggle-all-btn"
						onClick={() => handleToggleAll(true)}
						type="button"
						title="Expand all sections"
					>
						&#9662; Expand all
					</button>
					<button
						className="btn-sm toggle-all-btn"
						onClick={() => handleToggleAll(false)}
						type="button"
						title="Collapse all sections"
					>
						&#9656; Collapse all
					</button>
				</div>
			</div>
			{filterLower && required.length === 0 && optional.length === 0 ? (
				<p className="param-filter-empty">No parameters match "{paramFilter}"</p>
			) : (
				<>
					{required.length > 0 && (
						<Section
							title={`Required (${required.length})`}
							defaultOpen={true}
							toggleVersion={toggleVersion}
							toggleOpen={toggleOpen}
						>
							{required.map(([name, param]) =>
								renderParam(name, param, safeParams, onChange, errors, spreadsheetHeaders),
							)}
						</Section>
					)}
					{optional.length > 0 && (
						<Section
							title={`Optional (${optional.length})`}
							defaultOpen={false}
							toggleVersion={toggleVersion}
							toggleOpen={toggleOpen}
						>
							{optional.map(([name, param]) =>
								renderParam(name, param, safeParams, onChange, errors, spreadsheetHeaders),
							)}
						</Section>
					)}
				</>
			)}
		</div>
	);
};
