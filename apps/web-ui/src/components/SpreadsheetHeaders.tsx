/**
 * SpreadsheetHeaders.tsx
 *
 * Created by Min-Kyu Lee on 25-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { useState, useEffect } from "react";

type Props = {
	headers: string[];
	onHeadersChange: (headers: string[]) => void;
};

const STORAGE_KEY = "gsg-spreadsheet-headers";

export const SpreadsheetHeaders = ({ headers = [], onHeadersChange }: Props): React.ReactElement => {
	const safeHeaders = headers ?? [];
	const [open, setOpen] = useState(false);
	const [text, setText] = useState(safeHeaders.join("\n"));

	useEffect(() => {
		if (open) {
			setText(safeHeaders.join("\n"));
		}
	}, [open, safeHeaders]);

	const handleApply = () => {
		const parsed = text
			.split(/[\n\t]+/)
			.map((s) => s.trim())
			.filter((s) => s.length > 0);
		onHeadersChange?.(parsed);
		localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
	};

	const handleClear = () => {
		setText("");
		onHeadersChange?.([]);
		localStorage.removeItem(STORAGE_KEY);
	};

	return (
		<div className="spreadsheet-headers">
			<button
				className="history-toggle"
				onClick={() => setOpen(!open)}
				type="button"
			>
				<span>{open ? "▾" : "▸"}</span>
				{" "}Spreadsheet Headers{safeHeaders.length > 0 ? ` (${safeHeaders.length})` : ""}
			</button>
			{open && (
				<div className="spreadsheet-body">
					<p className="dialog-hint">
						Paste column headers (tab or newline separated) to reference column indices by name.
					</p>
					<textarea
						className="dialog-input"
						placeholder={"Title\nAuthor\nDate\nCategory"}
						value={text}
						onChange={(e) => setText(e.target.value)}
						rows={4}
					/>
					<div className="spreadsheet-actions">
						<button className="btn-sm" onClick={handleApply}>Apply</button>
						<button className="btn-sm" onClick={handleClear}>Clear</button>
					</div>
					{safeHeaders.length > 0 && (
						<div className="spreadsheet-ref">
							<p className="spreadsheet-ref-title">Column Reference</p>
							<div className="spreadsheet-ref-table">
								{safeHeaders.map((h, i) => (
									<div key={i} className="spreadsheet-ref-row">
										<span className="spreadsheet-ref-index">{i}</span>
										<span className="spreadsheet-ref-arrow">&rarr;</span>
										<span className="spreadsheet-ref-name">{h}</span>
									</div>
								))}
							</div>
						</div>
					)}
				</div>
			)}
		</div>
	);
};
