/**
 * CallChain.tsx
 *
 * Created by Min-Kyu Lee on 25-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import type { CallEntry } from "../hooks/useFunctionForm";
import { useState, useRef, useCallback } from "react";

type Props = {
	calls: CallEntry[];
	activeId: string | null;
	onSelect: (id: string) => void;
	onRemove: (id: string) => void;
	onMoveUp: (id: string) => void;
	onMoveDown: (id: string) => void;
	onReorder?: (fromIndex: number, toIndex: number) => void;
	onAdd: () => void;
	onSave: (label?: string) => void;
};

export const CallChain = ({
	calls,
	activeId,
	onSelect,
	onRemove,
	onMoveUp,
	onMoveDown,
	onReorder,
	onAdd,
	onSave,
}: Props): React.ReactElement => {
	const [saving, setSaving] = useState(false);
	const [saveLabel, setSaveLabel] = useState("");
	const [dragIndex, setDragIndex] = useState<number | null>(null);
	const [dropIndex, setDropIndex] = useState<number | null>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	const handleSaveClick = () => {
		const autoLabel = calls.map((c, i) => c.name || `Call ${i + 1}`).join(" + ");
		setSaveLabel(autoLabel);
		setSaving(true);
		setTimeout(() => inputRef.current?.select(), 50);
	};

	const commitSave = () => {
		onSave(saveLabel.trim() || undefined);
		setSaving(false);
		setSaveLabel("");
	};

	const handleDragStart = useCallback((e: React.DragEvent, idx: number) => {
		setDragIndex(idx);
		e.dataTransfer.effectAllowed = "move";
		e.dataTransfer.setData("text/plain", String(idx));
	}, []);

	const handleDragOver = useCallback((e: React.DragEvent, idx: number) => {
		e.preventDefault();
		e.dataTransfer.dropEffect = "move";
		setDropIndex(idx);
	}, []);

	const handleDragEnd = useCallback(() => {
		setDragIndex(null);
		setDropIndex(null);
	}, []);

	const handleDrop = useCallback((e: React.DragEvent, idx: number) => {
		e.preventDefault();
		if (dragIndex !== null && dragIndex !== idx) {
			onReorder?.(dragIndex, idx);
		}
		setDragIndex(null);
		setDropIndex(null);
	}, [dragIndex, onReorder]);

	if (calls.length <= 1 && !saving) {
		return (
			<div className="call-chain-bar">
				<button className="chain-add-btn" onClick={onAdd} title="Add another call">
					+ Add Call
				</button>
				{calls.length === 1 && (
					<button className="chain-save-btn" onClick={handleSaveClick} title="Save chain to history">
						Save
					</button>
				)}
			</div>
		);
	}

	return (
		<div className="call-chain">
			<div className="call-chain-header">
				<span className="call-chain-title">Call Chain ({calls.length})</span>
				<div className="call-chain-actions">
					<button className="chain-save-btn" onClick={handleSaveClick} title="Save chain to history">
						Save
					</button>
					<button className="chain-add-btn" onClick={onAdd} title="Add another call">
						+ Add
					</button>
				</div>
			</div>

			{saving && (
				<div className="chain-save-dialog">
					<input
						ref={inputRef}
						className="chain-save-input"
						value={saveLabel}
						onChange={(e) => setSaveLabel(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter") commitSave();
							if (e.key === "Escape") setSaving(false);
						}}
						placeholder="Name this preset..."
						autoFocus
					/>
					<div className="chain-save-actions">
						<button className="btn-sm" onClick={commitSave} type="button">
							Save
						</button>
						<button className="btn-sm" onClick={() => setSaving(false)} type="button">
							Cancel
						</button>
					</div>
				</div>
			)}

			<div className="call-chain-list">
				{calls.map((call, i) => {
					const classes = [
						"call-chain-item",
						call.id === activeId ? " active" : "",
						dragIndex === i ? " dragging" : "",
						dropIndex === i && dragIndex !== null && dragIndex !== i ? " drag-over" : "",
					].join("");

					return (
						<div
							key={call.id}
							className={classes}
							onClick={() => onSelect(call.id)}
							tabIndex={0}
							role="button"
							aria-current={call.id === activeId ? "true" : undefined}
							onKeyDown={(e) => {
								if (e.key === "Enter" || e.key === " ") {
									e.preventDefault();
									onSelect(call.id);
								}
							}}
							draggable
							onDragStart={(e) => { e.stopPropagation(); handleDragStart(e, i); }}
							onDragOver={(e) => { e.preventDefault(); handleDragOver(e, i); }}
							onDragEnd={handleDragEnd}
							onDrop={(e) => { e.preventDefault(); handleDrop(e, i); }}
						>
							<span className="chain-grip" aria-label="Drag to reorder">&#x2630;</span>
							<span className="chain-index">{i + 1}.</span>
							<span className="chain-name">{call.name || `Call ${i + 1}`}</span>
							<span className="chain-actions">
								<button
									className="chain-btn"
									disabled={i === 0}
									onClick={(e) => { e.stopPropagation(); onMoveUp(call.id); }}
									title="Move up"
									aria-label="Move up"
								>
									&#9650;
								</button>
								<button
									className="chain-btn"
									disabled={i === calls.length - 1}
									onClick={(e) => { e.stopPropagation(); onMoveDown(call.id); }}
									title="Move down"
									aria-label="Move down"
								>
									&#9660;
								</button>
								<button
									className="chain-btn chain-remove"
									onClick={(e) => { e.stopPropagation(); onRemove(call.id); }}
									title="Remove"
									aria-label="Remove"
								>
									&#10005;
								</button>
							</span>
						</div>
					);
				})}
			</div>
		</div>
	);
};
