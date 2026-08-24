/**
 * CodeOutput.tsx
 *
 * Created by Min-Kyu Lee on 24-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { useState, useMemo, useCallback, useEffect, useRef } from "react";

type Props = {
	code: string;
};

const isWordChar = (c: string): boolean => /\w/.test(c);

const tokenize = (code: string): React.ReactNode[] => {
	const tokens: React.ReactNode[] = [];
	let i = 0;

	const ch = (): string => code[i] ?? "";

	while (i < code.length) {
		const start = i;

		// Preserve whitespace as text nodes
		if (/\s/.test(ch())) {
			while (i < code.length && /\s/.test(ch())) i++;
			tokens.push(code.slice(start, i));
			continue;
		}

		// String literal
		if (ch() === "\"") {
			i++;
			while (i < code.length) {
				if (ch() === "\\") { i += 2; continue; }
				if (ch() === "\"") { i++; break; }
				i++;
			}
			tokens.push(<span key={start} className="hl-string">{code.slice(start, i)}</span>);
			continue;
		}

		// Punctuation
		if (/[{}()[\],:]/.test(ch())) {
			tokens.push(<span key={start} className="hl-punc">{ch()}</span>);
			i++;
			continue;
		}

		// Negative number
		if (ch() === "-" && i + 1 < code.length && /\d/.test(code[i + 1] ?? "")) {
			i++;
			while (i < code.length && /\d/.test(ch())) i++;
			if (ch() === "." && i + 1 < code.length && /\d/.test(code[i + 1] ?? "")) {
				i++;
				while (i < code.length && /\d/.test(ch())) i++;
			}
			tokens.push(<span key={start} className="hl-number">{code.slice(start, i)}</span>);
			continue;
		}

		// Positive number
		if (/\d/.test(ch())) {
			i++;
			while (i < code.length && /\d/.test(ch())) i++;
			if (ch() === "." && i + 1 < code.length && /\d/.test(code[i + 1] ?? "")) {
				i++;
				while (i < code.length && /\d/.test(ch())) i++;
			}
			tokens.push(<span key={start} className="hl-number">{code.slice(start, i)}</span>);
			continue;
		}

		// Identifiers, keywords, property keys
		if (isWordChar(ch())) {
			while (i < code.length && isWordChar(ch())) i++;
			const word = code.slice(start, i);

			if (/^(true|false|null|undefined)$/.test(word)) {
				tokens.push(<span key={start} className="hl-keyword">{word}</span>);
			} else {
				let peek = i;
				while (peek < code.length && /\s/.test(code[peek] ?? "")) peek++;
				if ((code[peek] ?? "") === ":") {
					tokens.push(<span key={start} className="hl-key">{word}</span>);
				} else {
					tokens.push(<span key={start} className="hl-punc">{word}</span>);
				}
			}
			continue;
		}

		// Catch-all: non-word, non-whitespace, non-punctuation characters
		tokens.push(<span key={start} className="hl-punc">{ch()}</span>);
		i++;
	}

	return tokens;
};

export const CodeOutput = ({ code }: Props): React.ReactElement => {
	const safeCode = code ?? "";
	const [showToast, setShowToast] = useState(false);
	const toastTimerRef = useRef<ReturnType<typeof setTimeout>>();

	useEffect(() => {
		return () => clearTimeout(toastTimerRef.current);
	}, []);

	const highlighted = useMemo(() => tokenize(safeCode), [safeCode]);

	const handleCopy = useCallback(async () => {
		try {
			if (navigator.clipboard?.writeText) {
				await navigator.clipboard.writeText(safeCode);
			} else {
				const textarea = document.createElement("textarea");
				textarea.value = safeCode;
				textarea.style.position = "fixed";
				textarea.style.opacity = "0";
				document.body.appendChild(textarea);
				textarea.select();
				document.execCommand("copy");
				document.body.removeChild(textarea);
			}
			setShowToast(true);
			clearTimeout(toastTimerRef.current);
			toastTimerRef.current = setTimeout(() => setShowToast(false), 4000);
		} catch {
			setShowToast(false);
		}
	}, [safeCode]);

	return (
		<div>
			<pre className="code-output">{highlighted}</pre>
			<div className="output-actions">
				<button className="copy-btn btn-primary" onClick={handleCopy}>
				Copy to Clipboard
				</button>
				{showToast && <span className="toast">Copied!</span>}
			</div>
		</div>
	);
};
