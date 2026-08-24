/**
 * CallHistory.tsx
 *
 * Created by Min-Kyu Lee on 25-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import type { HistoryEntry } from "../hooks/useFunctionForm";
import { useState, useRef, useEffect } from "react";

type Props = {
	entries: HistoryEntry[];
	onLoad: (entry: HistoryEntry) => void;
	onClear: () => void;
	onRename: (timestamp: number, label: string) => void;
	onDelete: (timestamp: number) => void;
};

const formatTime = (ts: number): string => {
	const diff = Date.now() - ts;
	if (diff < 0) return "Just now";
	if (diff < 60000) return "Just now";
	if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
	if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
	return new Date(ts).toLocaleDateString();
};

const EditableLabel = ({
	label,
	onRename,
}: {
	label: string;
	onRename: (label: string) => void;
}): React.ReactElement => {
	const [editing, setEditing] = useState(false);
	const [value, setValue] = useState(label);
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (editing) inputRef.current?.select();
	}, [editing]);

	if (editing) {
		return (
			<input
				ref={inputRef}
				className="history-edit-input"
				value={value}
				onChange={(e) => setValue(e.target.value)}
				onBlur={() => {
					setEditing(false);
					if (value.trim() && value.trim() !== label) onRename(value.trim());
				}}
				onKeyDown={(e) => {
					if (e.key === "Enter" && e.target instanceof HTMLElement) {
						e.target.blur();
					}
					if (e.key === "Escape") {
						setValue(label);
						setEditing(false);
					}
				}}
				onClick={(e) => e.stopPropagation()}
			/>
		);
	}

	return (
		<span
			className="history-label"
			onDoubleClick={(e) => {
				e.stopPropagation();
				setEditing(true);
			}}
			title="Double-click to rename"
		>
			{label}
		</span>
	);
};

export const CallHistory = ({ entries, onLoad, onClear, onRename, onDelete }: Props): React.ReactElement => {
	const [open, setOpen] = useState(false);

	const safeEntries = entries ?? [];

	if (safeEntries.length === 0) return <></>;

	return (
		<div className="call-history">
			<button className="history-toggle" onClick={() => setOpen(!open)} type="button">
				{open ? "▾" : "▸"} History ({safeEntries.length})
			</button>
			{open && (
				<div className="history-list">
					{safeEntries.map((entry) => (
						<div
							key={entry.timestamp}
							className="history-item"
							onClick={() => onLoad?.(entry)}
							tabIndex={0}
							role="button"
							onKeyDown={(e) => {
								if (e.key === "Enter" || e.key === " ") {
									e.preventDefault();
									onLoad?.(entry);
								}
							}}
						>
							<EditableLabel
								label={entry.label}
								onRename={(label) => onRename?.(entry.timestamp, label)}
							/>
							<span className="history-meta">
								<span className="history-time">{formatTime(entry.timestamp)}</span>
								<button
									className="history-delete"
									onClick={(e) => {
										e.stopPropagation();
										onDelete?.(entry.timestamp);
									}}
									title="Delete"
									aria-label="Delete"
									type="button"
								>
									✕
								</button>
							</span>
						</div>
					))}
					<button className="history-clear" onClick={() => onClear?.()} type="button">
						Clear all
					</button>
				</div>
			)}
		</div>
	);
};
