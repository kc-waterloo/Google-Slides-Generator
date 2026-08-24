/**
 * RegexpEditor.tsx
 *
 * Created by Min-Kyu Lee on 24-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { useState, useCallback } from "react";
import { toRegExp, fromRegExp } from "@gsg/shared";

type Props = {
	values: unknown[];
	onChange: (values: unknown[]) => void;
};

const COMMON_PATTERNS = [
	{ label: "Starts with", pattern: "^Chapter" },
	{ label: "Contains", pattern: "Topic" },
	{ label: "Ends with", pattern: "Section$" },
	{ label: "Digits", pattern: "^\\d+" },
	{ label: "Word boundary", pattern: "\\bDraft\\b" },
];

const CHEATSHEET = [
	{ pattern: ".", meaning: "Any character" },
	{ pattern: "^", meaning: "Start of string" },
	{ pattern: "$", meaning: "End of string" },
	{ pattern: "\\d", meaning: "Digit [0-9]" },
	{ pattern: "\\w", meaning: "Word character" },
	{ pattern: "*", meaning: "0 or more" },
	{ pattern: "+", meaning: "1 or more" },
	{ pattern: "?", meaning: "Optional" },
	{ pattern: "(a|b)", meaning: "Either a or b" },
	{ pattern: "[abc]", meaning: "Any of a, b, c" },
];

const tryRegex = (input: string): RegExp | null => {
	try {
		return toRegExp(input);
	} catch {
		return null;
	}
};

const matchResultClass = (matchResult: boolean | null): string => {
	if (matchResult === true) return "match-ok";
	if (matchResult === false) return "match-fail";
	return "";
};

const matchResultLabel = (matchResult: boolean | null): string => {
	if (matchResult === true) return "✓ matches";
	if (matchResult === false) return "✗ no match";
	return "—";
};

const RegexRow = ({
	value,
	onChange,
	onRemove,
}: {
	value: unknown;
	onChange: (v: string) => void;
	onRemove: () => void;
}): React.ReactElement => {
	const pattern = value instanceof RegExp ? fromRegExp(value) : String(value ?? "");
	const [testStr, setTestStr] = useState("");
	const regex = tryRegex(pattern);

	let matchResult: boolean | null = null;
	if (regex && testStr) {
		matchResult = regex.test(testStr);
	}

	return (
		<div className="regexp-row">
			<div className="regexp-row-main">
				<input
					type="text"
					value={pattern}
					placeholder='e.g. ^Chapter, \\d+, /chapter/i'
					onChange={(e) => onChange(e.target.value)}
					className={regex ? "" : "input-error"}
				/>
				<button className="btn-sm" onClick={onRemove}>Remove</button>
			</div>
			{!regex && pattern.length > 0 && (
				<p className="regexp-error">
					Invalid regular expression
				</p>
			)}
			{regex && (
				<>
					<div className="regexp-test">
						<input
							type="text"
							value={testStr}
							placeholder="Test string..."
							onChange={(e) => setTestStr(e.target.value)}
							className={matchResultClass(matchResult)}
						/>
						<span className={`regexp-result ${matchResultClass(matchResult)}`}>
							{matchResultLabel(matchResult)}
						</span>
					</div>
					<p className="regexp-preview">
						{testStr
							? <Preview pattern={regex} text={testStr} />
							: <span className="regexp-hint">Type a test string above to see matches</span>
						}
					</p>
				</>
			)}
		</div>
	);
};

const Preview = ({ pattern, text }: { pattern: RegExp; text: string }): React.ReactElement => {
	const globalFlags = pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`;
	const matches = [...text.matchAll(new RegExp(pattern.source, globalFlags))];
	if (matches.length === 0) {
		return <span className="regexp-hint">No matches found</span>;
	}

	const parts: React.ReactNode[] = [];
	let lastIndex = 0;
	for (const m of matches) {
		const idx = m.index;
		if (idx > lastIndex) {
			parts.push(<span key={`t-${lastIndex}`}>{text.slice(lastIndex, idx)}</span>);
		}
		parts.push(<mark key={`m-${idx}`} className="regexp-mark">{m[0]}</mark>);
		lastIndex = idx + m[0].length;
	}
	if (lastIndex < text.length) {
		parts.push(<span key={`t-${lastIndex}`}>{text.slice(lastIndex)}</span>);
	}
	return <span>{parts}</span>;
};

export const RegexpEditor = ({ values, onChange }: Props): React.ReactElement => {
	const [showHelp, setShowHelp] = useState(false);
	const safeValues = values ?? [];

	const addItem = useCallback(() => {
		onChange?.([...safeValues, ""]);
	}, [safeValues, onChange]);

	const updateItem = useCallback((index: number, value: string) => {
		const next = safeValues.map((item, i) => (i === index ? value : item));
		onChange?.(next);
	}, [safeValues, onChange]);

	const removeItem = useCallback((index: number) => {
		onChange?.(safeValues.filter((_, i) => i !== index));
	}, [safeValues, onChange]);

	const addPattern = useCallback((pattern: string) => {
		onChange?.([...safeValues, pattern]);
	}, [safeValues, onChange]);

	return (
		<div className="regexp-editor">
			<div className="regexp-toolbar">
				<button
					className="btn-sm"
					onClick={() => setShowHelp(!showHelp)}
				>
					{showHelp ? "Hide" : "Help"}
				</button>
				{COMMON_PATTERNS.map((p) => (
					<button
						key={p.pattern}
						className="btn-sm"
						title={p.pattern}
						onClick={() => addPattern(p.pattern)}
					>
						{p.label}
					</button>
				))}
			</div>

			{showHelp && (
				<div className="regexp-cheatsheet">
					<table>
						<tbody>
							{CHEATSHEET.map((row) => (
								<tr key={row.pattern}>
									<td><code className="regexp-code">/{row.pattern}/</code></td>
									<td><span className="regexp-meaning">{row.meaning}</span></td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}

			{safeValues.map((item, index) => (
				<RegexRow
					key={index}
					value={item}
					onChange={(v) => updateItem(index, v)}
					onRemove={() => removeItem(index)}
				/>
			))}

			<button className="array-add-btn" onClick={addItem}>
				+ Add pattern
			</button>
		</div>
	);
};
