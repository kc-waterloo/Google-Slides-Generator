/**
 * SlidePreview.tsx
 *
 * Created by Min-Kyu Lee on 25-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { useState, useMemo, useEffect } from "react";
import {
	allFunctionNames,
	functionTemplateLayouts,
	getPreviewTexts,
} from "@gsg/shared";

type Props = {
	functionName: string | null;
	params: Record<string, unknown>;
};

const THEME_COLORS: Record<string, string> = {
	DARK1: "#1a1a1a",
	LIGHT1: "#f5f5f5",
	ACCENT1: "#4472C4",
	ACCENT2: "#ED7D31",
	ACCENT3: "#A5A5A5",
	ACCENT4: "#FFC000",
	ACCENT5: "#5B9BD5",
	ACCENT6: "#70AD47",
	BACKGROUND: "#ffffff",
	TEXT: "#000000",
};

const resolveColor = (color?: string): string | undefined => {
	if (!color) return undefined;
	if (color.startsWith("#")) return color;
	if (THEME_COLORS[color]) return THEME_COLORS[color];
	return color;
};

export const SlidePreview = ({ functionName, params }: Props): React.ReactElement | null => {
	const [activeSlideIndex, setActiveSlideIndex] = useState(0);

	useEffect(() => {
		setActiveSlideIndex(0);
	}, [functionName]);

	const layout = functionName ? functionTemplateLayouts[functionName] : undefined;

	const slideLayouts = layout?.slides ?? [];

	const currentSlide = slideLayouts[activeSlideIndex];

	const prevSlide = activeSlideIndex > 0;
	const nextSlide = activeSlideIndex < slideLayouts.length - 1;

	const safeParams = params ?? {};

	const texts = useMemo(() => {
		if (!functionName || !currentSlide) return {};
		return getPreviewTexts(safeParams, currentSlide.id, functionName);
	}, [functionName, safeParams, currentSlide]);

	if (!functionName) {
		return null;
	}

	if (!layout) {
		if (allFunctionNames.includes(functionName)) {
			return (
				<section className="panel slide-preview-panel">
					<h3>Slide Preview</h3>
					<p className="slide-preview-none">No slide preview available for this function</p>
				</section>
			);
		}
		return null;
	}

	if (slideLayouts.length === 0) {
		return (
			<section className="panel slide-preview-panel">
				<h3>Slide Preview</h3>
				<p className="slide-preview-none">No slide preview available for this function</p>
			</section>
		);
	}

	return (
		<section className="panel slide-preview-panel slide-preview">
			<div className="slide-preview-header">
				<h3>Slide Preview</h3>
				<div className="slide-preview-nav">
					<button
						className="slide-preview-btn"
						disabled={!prevSlide}
						onClick={() => setActiveSlideIndex((i) => Math.max(0, i - 1))}
						aria-label="Previous slide type"
					>
						◀
					</button>
					<span className="slide-preview-label">
						{currentSlide?.label ?? ""}
					</span>
					<button
						className="slide-preview-btn"
						disabled={!nextSlide}
						onClick={() => setActiveSlideIndex((i) => Math.min(slideLayouts.length - 1, i + 1))}
						aria-label="Next slide type"
					>
						▶
					</button>
				</div>
			</div>
			<p className="slide-preview-desc">{currentSlide?.description ?? ""}</p>
			<div className="slide-preview-canvas">
				<svg
					viewBox="0 0 960 540"
					className="slide-preview-svg"
					role="img"
					aria-label={`Slide preview: ${currentSlide?.label ?? ""}`}
				>
					<rect
						x="0" y="0" width="960" height="540"
						rx="8" fill="#ffffff" stroke="#d0d0d0" strokeWidth="2"
					/>
					<rect
						x="0.5" y="0.5" width="959" height="539"
						rx="8" fill="none" stroke="#e8e8e8" strokeWidth="1"
					/>

					{currentSlide?.elements.map((el) => {
						const info = texts[el.key];
						const displayText = info?.text ?? el.placeholder ?? el.key;
						const displayColor = resolveColor(info?.color) ?? "#333333";

						if (el.key === "top-bar-border-key") {
							return (
								<rect
									key={el.key}
									x={(el.x / 100) * 960}
									y={(el.y / 100) * 540}
									width={(el.width / 100) * 960}
									height={(el.height / 100) * 540}
									fill="#1a1a1a"
								/>
							);
						}

						const xPx = (el.x / 100) * 960;
						const yPx = (el.y / 100) * 540;
						const wPx = (el.width / 100) * 960;
						const hPx = (el.height / 100) * 540;

						const isFullWidth = el.width > 80;
						const isPlaceholder = displayText === (el.placeholder ?? el.key);

						return (
							<g key={el.key}>
								<rect
									x={xPx}
									y={yPx}
									width={wPx}
									height={hPx}
									rx="4"
									fill={isFullWidth ? "#f8f9fa" : "#ffffff"}
									stroke={displayColor}
									strokeWidth="1.5"
									strokeOpacity="0.4"
									strokeDasharray={isPlaceholder ? "6,4" : undefined}
								/>

								{el.label && (
									<text
										x={xPx + 6}
										y={yPx - 6}
										fontSize="11"
										fill="#999"
										fontFamily="system-ui, sans-serif"
									>
										{el.label}
									</text>
								)}

								{displayText && (
									<foreignObject
										x={xPx + 4}
										y={yPx + 4}
										width={Math.max(10, wPx - 8)}
										height={Math.max(10, hPx - 8)}
									>
										<div
											style={{
												width: "100%",
												height: "100%",
												overflow: "hidden",
												fontSize: `${Math.min(16, (hPx - 8) / 1.2)}px`,
												color: displayColor,
												textAlign: el.textAlign,
												fontFamily: "system-ui, sans-serif",
												lineHeight: 1.3,
												wordBreak: "break-word",
												display: "flex",
												alignItems: el.textAlign === "center" ? "center" : "flex-start",
												justifyContent: el.textAlign === "center" ? "center" : "flex-start",
												opacity: isPlaceholder ? 0.5 : 1,
											}}
										>
											{displayText}
										</div>
									</foreignObject>
								)}
							</g>
						);
					})}
				</svg>
			</div>
		</section>
	);
};
