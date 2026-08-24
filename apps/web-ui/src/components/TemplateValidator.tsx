/**
 * TemplateValidator.tsx
 *
 * Created by Min-Kyu Lee on 25-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { useMemo, useState } from "react";

type FunctionKeyInfo = {
	name: string;
	description: string;
	expectedKeys: Record<string, string[]>;
};

const FUNCTION_KEYS: FunctionKeyInfo[] = [
	{
		name: "setHeaders",
		description: "Header bar with section labels and active/inactive highlighting",
		expectedKeys: {
			"Header border": ["top-bar-border-key"],
			"Section labels": ["top-bar-topic-1-of-N-text", "top-bar-topic-2-of-N-text", "..."],
		},
	},
	{
		name: "createLongQuotesSlides",
		description: "Title slide + one or more content slides per quote",
		expectedKeys: {
			"Title slide": ["section-title-text-box", "section-subtitle-text-box"],
			"Content slide": ["quote-text-box", "addendum-text-box"],
		},
	},
	{
		name: "createShortQuotesSlides",
		description: "Single slide per quote with quote and addendum",
		expectedKeys: {
			"Content slide": ["quote-text-box", "addendum-text-box"],
		},
	},
	{
		name: "createHighlightVariationSlides",
		description: "Variation slides for highlighting individual points",
		expectedKeys: {
			"Point slides": ["point-1-of-N-text-box", "point-1-of-N-number-indicator-text-box", "..."],
		},
	},
	{
		name: "createSummarySlide",
		description: "Summary/table-of-contents slide",
		expectedKeys: {
			"Summary slide": ["summary-title-text", "summary-item-1-text", "summary-item-2-text", "..."],
		},
	},
	{
		name: "createBulletSlide",
		description: "Bullet-point slide with title",
		expectedKeys: {
			"Bullet slide": ["bullet-title-text-box", "bullet-point-1-text", "bullet-point-2-text", "..."],
		},
	},
	{
		name: "applyBackgroundColor",
		description: "Sets background color on slides by range",
		expectedKeys: {},
	},
	{
		name: "batchReplaceText",
		description: "Bulk find-and-replace across slide range",
		expectedKeys: {},
	},
	{
		name: "batchSetTextStyle",
		description: "Bulk text style overrides by page element key",
		expectedKeys: {},
	},
	{
		name: "createLongQuotesSlidesFromDoc",
		description: "Same as createLongQuotesSlides but reads from a Google Doc URL",
		expectedKeys: {
			"Title slide": ["section-title-text-box", "section-subtitle-text-box"],
			"Content slide": ["quote-text-box", "addendum-text-box"],
		},
	},
	{
		name: "duplicateSlideRange",
		description: "Duplicates a range of slides",
		expectedKeys: {},
	},
	{
		name: "moveSlides",
		description: "Moves a range of slides to a new position",
		expectedKeys: {},
	},
	{
		name: "replaceAll",
		description: "Find-and-replace text across slides",
		expectedKeys: {},
	},
];

const normalizeKey = (k: string): string => k.trim().toLowerCase();

const matchesPattern = (expected: string, actual: string): boolean => {
	const normalExpected = normalizeKey(expected);
	const normalActual = normalizeKey(actual);
	if (normalExpected === normalActual) return true;
	if (normalExpected.includes("-n-") || normalExpected.endsWith("-n")) {
		const escaped = normalExpected.replace(/[.+?^${}()|[\]\\]/g, "\\$&");
		const pattern = escaped.replace(/-n-/g, "-\\d+-").replace(/-n$/, "-\\d+");
		return new RegExp(`^${pattern}$`).test(normalActual);
	}
	return false;
};

type CheckResult = {
	expected: string;
	found: boolean;
	group: string;
};

export const TemplateValidator = ({
	selectedName,
}: {
	selectedName: string | null;
}): React.ReactElement | null => {
	const [userKeys, setUserKeys] = useState("");
	const [expanded, setExpanded] = useState(false);

	const info = useMemo(
		() => FUNCTION_KEYS.find((f) => f.name === selectedName) ?? null,
		[selectedName],
	);

	const hasKeys = info && Object.keys(info.expectedKeys).length > 0;

	const checkResults = useMemo((): CheckResult[] | null => {
		if (!info || !userKeys.trim()) return null;

		const actual = userKeys.split(/[\s,]+/).filter(Boolean).map(normalizeKey);

		const results: CheckResult[] = [];
		for (const [group, keys] of Object.entries(info.expectedKeys)) {
			for (const key of keys) {
				if (key === "...") continue;
				const found = actual.some((a) => matchesPattern(key, a));
				results.push({ expected: key, found, group });
			}
		}
		return results;
	}, [info, userKeys]);

	if (!info) return null;

	return (
		<section className="panel template-validator-panel">
			<h3>
				Template Requirements
				<button
					className="panel-toggle"
					onClick={() => setExpanded(!expanded)}
					type="button"
				>
					{expanded ? "▾" : "▸"}
				</button>
			</h3>

			{!hasKeys ? (
				<p className="tv-no-keys">This function doesn't need template slides.</p>
			) : (
				<>
					<p className="tv-desc">{info.description}</p>

					{!expanded ? (
						<div className="tv-summary">
							{Object.entries(info.expectedKeys).map(([group, keys]) => (
								<div key={group} className="tv-group-summary">
									<span className="tv-group-name">{group}:</span>
									<span className="tv-key-list">
										{keys.map((k) => (
											<code key={k} className="tv-key">{k === "..." ? "…" : k}</code>
										))}
									</span>
								</div>
							))}
						</div>
					) : (
						<div className="tv-detailed">
							{Object.entries(info.expectedKeys).map(([group, keys]) => (
								<div key={group} className="tv-group">
									<span className="tv-group-name">{group}</span>
									<ul className="tv-key-detail-list">
										{keys.filter((k) => k !== "...").map((k) => (
											<li key={k}><code className="tv-key">{k}</code></li>
										))}
									</ul>
								</div>
							))}

							<div className="tv-checker">
								<label className="tv-checker-label" htmlFor="tv-checker-input">
									Paste your template's page element keys to check:
								</label>
								<input
									id="tv-checker-input"
									className="tv-checker-input"
									type="text"
									placeholder="e.g. quote-text-box, addendum-text-box, section-title-text-box"
									value={userKeys}
									onChange={(e) => setUserKeys(e.target.value)}
								/>
								{checkResults && (
									<div className="tv-results">
										{checkResults.map((r) => (
											<div
												key={r.expected}
												className={`tv-result ${r.found ? "tv-found" : "tv-missing"}`}
											>
												<span className="tv-result-icon">{r.found ? "✅" : "❌"}</span>
												<code className="tv-result-key">{r.expected}</code>
												<span className="tv-result-group">({r.group})</span>
											</div>
										))}
									</div>
								)}
							</div>
						</div>
					)}
				</>
			)}
		</section>
	);
};
