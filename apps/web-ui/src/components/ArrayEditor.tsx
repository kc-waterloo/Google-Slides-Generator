/**
 * ArrayEditor.tsx
 *
 * Created by Min-Kyu Lee on 24-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { useState } from "react";
import type { ParamSchema, ValidationError } from "@gsg/shared";
import { ParamInput } from "./ParamInput";

type Props = {
	schema: ParamSchema;
	values: Record<string, unknown>[];
	onChange: (values: Record<string, unknown>[]) => void;
	errors?: ValidationError[];
};

const itemLabel = (values: Record<string, unknown>, index: number): string => {
	const name = values["title"] as string | undefined
		?? values["quote"] as string | undefined
		?? values["sectionName"] as string | undefined;
	return name ? `#${index + 1}: ${name}` : `Item #${index + 1}`;
};

const fieldErrors = (errors: ValidationError[], arrayName: string, index: number, field: string): string[] => {
	const prefix = `${arrayName}[${index}].${field}`;
	return errors
		.filter((e) => e.field === prefix)
		.map((e) => e.message);
};

const parseBulkImport = (text: string, schema: ParamSchema): Record<string, unknown>[] => {
	const fieldNames = Object.keys(schema.arrayItemSchema ?? {});
	const lastIndex = fieldNames.length - 1;

	return text.trim().split("\n")
		.map((line) => line.trim())
		.filter((line) => line.length > 0)
		.map((line) => {
			const parts = line.split("\t");
			const item: Record<string, unknown> = {};
			fieldNames.forEach((name, i) => {
				if (i < lastIndex) {
					item[name] = (parts[i] ?? "").trim();
				} else {
					item[name] = parts.slice(i).join("\n").trim();
				}
			});
			return item;
		});
};

export const ArrayEditor = ({ schema, values, onChange, errors = [] }: Props): React.ReactElement => {
	if (!values) {
		values = [];
	}
	const [showBulk, setShowBulk] = useState(false);
	const [bulkText, setBulkText] = useState("");

	const addItem = () => {
		const empty: Record<string, unknown> = {};
		for (const [fieldName, fieldSchema] of Object.entries(schema.arrayItemSchema ?? {})) {
			empty[fieldName] = fieldSchema.defaultValue;
		}
		onChange([...values, empty]);
	};

	const handleBulkImport = () => {
		const items = parseBulkImport(bulkText, schema);
		if (items.length > 0) {
			onChange([...values, ...items]);
			setBulkText("");
			setShowBulk(false);
		}
	};

	const updateItem = (index: number, field: string, value: unknown) => {
		const next = values.map((item, i) =>
			i === index ? { ...item, [field]: value } : item
		);
		onChange(next);
	};

	const removeItem = (index: number) => {
		onChange(values.filter((_, i) => i !== index));
	};

	const duplicateItem = (index: number) => {
		const next = [...values];
		next.splice(index + 1, 0, { ...values[index] });
		onChange(next);
	};

	return (
		<div className="array-editor">
			{values.length > 0 && (
				<div className="array-toolbar">
					<button className="btn-sm" onClick={() => { setShowBulk(!showBulk); setBulkText(""); }}>
						{showBulk ? "Cancel" : "Bulk import"}
					</button>
				</div>
			)}

			{showBulk && (
				<div className="bulk-import">
					<p className="bulk-import-hint">
						Paste one item per line: <strong>{Object.keys(schema.arrayItemSchema ?? {}).join("<tab>")}</strong>
					</p>
					<textarea
						className="bulk-import-input"
						value={bulkText}
						onChange={(e) => setBulkText(e.target.value)}
						placeholder={Object.keys(schema.arrayItemSchema ?? {}).map((k) => k.charAt(0).toUpperCase() + k.slice(1)).join("\t")}
					/>
					<button
						className="btn-sm btn-primary"
						onClick={handleBulkImport}
						disabled={bulkText.trim().length === 0}
					>
						Import {bulkText.trim().split("\n").filter(Boolean).length} items
					</button>
				</div>
			)}

			{values.map((item, index) => (
				<div key={index} className="array-item">
					<div className="array-item-header">
						<span>{itemLabel(item, index)}</span>
						<div className="array-item-actions">
							<button className="btn-sm" onClick={() => duplicateItem(index)}>Duplicate</button>
							<button className="btn-sm btn-danger" onClick={() => removeItem(index)}>Remove</button>
						</div>
					</div>
					{Object.entries(schema.arrayItemSchema ?? {})
						.filter(([fieldName]) => {
							if (fieldName === "splitMaxChars" && item["splitMode"] !== "char-count") return false;
							return true;
						})
						.map(([fieldName, fieldSchema]) => (
							<ParamInput
								key={fieldName}
								schema={fieldSchema}
								value={item[fieldName]}
								onChange={(v) => updateItem(index, fieldName, v)}
								errors={fieldErrors(errors, schema.name, index, fieldName)}
							/>
						))}
				</div>
			))}

			{values.length > 0 && (
				<button className="array-add-btn" onClick={addItem}>
					+ Add another
				</button>
			)}

			{values.length === 0 && (
				<>
					{!showBulk && (
						<button className="array-add-btn" onClick={addItem}>
							+ Add {schema.name.slice(0, -2)}
						</button>
					)}
				</>
			)}
		</div>
	);
};
