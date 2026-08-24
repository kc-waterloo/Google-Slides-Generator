/**
 * FunctionSelector.tsx
 *
 * Created by Min-Kyu Lee on 24-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { useState, useMemo } from "react";
import type { FunctionSchema } from "@gsg/shared";

type Props = {
	schemas: FunctionSchema[];
	selected: FunctionSchema | null;
	onSelect: (schema: FunctionSchema) => void;
	errorCount: number;
};

export const FunctionSelector = ({ schemas, selected, onSelect, errorCount }: Props): React.ReactElement => {
	const [query, setQuery] = useState("");

	const safeSchemas = schemas ?? [];

	const filtered = useMemo(
		() => query.trim()
			? safeSchemas.filter((s) => s.name.toLowerCase().includes(query.trim().toLowerCase()))
			: safeSchemas,
		[safeSchemas, query],
	);

	return (
		<div className="function-selector">
			<input
				type="text"
				className="function-search"
				placeholder="Filter functions..."
				aria-label="Filter functions"
				value={query}
				onChange={(e) => setQuery(e.target.value)}
			/>
			<div className="function-grid">
				{filtered.map((schema) => {
					const isSelected = selected?.name === schema.name;
					return (
						<button
							key={schema.name}
							className={isSelected ? "selected" : ""}
							onClick={() => onSelect(schema)}
						>
							<span className="fn-label">{schema.name}</span>
							{isSelected && errorCount > 0 && (
								<span className="error-badge">{errorCount}</span>
							)}
						</button>
					);
				})}
				{query.trim() && filtered.length === 0 && (
					<p className="function-no-match">No functions match "{query}"</p>
				)}
			</div>
		</div>
	);
};
