/* eslint-disable */
/**
 * tests/__mocks__/google-apps-script.ts
 *
 * Created by Min-Kyu Lee on 24-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 *
 * Comprehensive mocks for Google Apps Script runtime objects.
 * All mock factories return objects cast to the correct GAS type
 * (via `as unknown as Type`) so that source code type-checks pass.
 */

// ----- Enums / Constants (cast to GAS enum types) -----
// We don't import the GAS types directly in this file; the cast ensures
// assignability at the call site.

export const SlideLinkingMode = {
	UNSUPPORTED: "UNSUPPORTED" as const,
	LINKED: "LINKED" as const,
	NOT_LINKED: "NOT_LINKED" as const,
};

export const LinkType = {
	UNSUPPORTED: "UNSUPPORTED" as const,
	URL: "URL" as const,
	SLIDE_POSITION: "SLIDE_POSITION" as const,
	SLIDE_ID: "SLIDE_ID" as const,
	SLIDE_INDEX: "SLIDE_INDEX" as const,
};

export const ThemeColorType = {
	DARK1: "DARK1" as const,
	LIGHT1: "LIGHT1" as const,
	DARK2: "DARK2" as const,
	LIGHT2: "LIGHT2" as const,
	ACCENT1: "ACCENT1" as const,
	ACCENT2: "ACCENT2" as const,
	ACCENT3: "ACCENT3" as const,
	ACCENT4: "ACCENT4" as const,
	ACCENT5: "ACCENT5" as const,
	ACCENT6: "ACCENT6" as const,
};

export const ParagraphHeading = {
	TITLE: "TITLE" as const,
	SUBTITLE: "SUBTITLE" as const,
	HEADING1: "HEADING1" as const,
	HEADING2: "HEADING2" as const,
	HEADING3: "HEADING3" as const,
	HEADING4: "HEADING4" as const,
	HEADING5: "HEADING5" as const,
	HEADING6: "HEADING6" as const,
	NORMAL: "NORMAL" as const,
};

// ----- Internal state types -----

export interface MockShapeState {
	text: string;
	bold: boolean;
	italic: boolean;
	strikethrough: boolean;
	underline: boolean;
	fontSize: number | null;
	foregroundColor: string | null;
	borderColor: string | null;
}

// ----- Helpers to capture state from mocks -----

export function getMockShapeState(shape: GoogleAppsScript.Slides.Shape): MockShapeState {
	const s = shape as unknown as MockShapeInternal;
	const textState = s._textRangeInternal.getState();
	const styleState = s._textRangeInternal._textStyleInternal.getState();
	return { ...styleState, text: textState.text };
}

// ----- Internal interfaces used to reach into mock state -----

interface MockTextStyleInternal {
	getState(): MockShapeState;
	setBold: jest.Mock;
	setForegroundColor: jest.Mock;
	setFontSize: jest.Mock;
	setItalic: jest.Mock;
	setStrikethrough: jest.Mock;
	setUnderline: jest.Mock;
}

interface MockTextRangeInternal {
	getState(): MockShapeState;
	setText: jest.Mock;
	getTextStyle(): MockTextStyleInternal;
	setState(s: Partial<MockShapeState>): void;
	_textStyleInternal: MockTextStyleInternal;
}

interface MockShapeInternal {
	getText(): MockTextRangeInternal;
	getBorder(): GoogleAppsScript.Slides.Border;
	_textRangeInternal: MockTextRangeInternal;
	_borderInternal: GoogleAppsScript.Slides.Border;
	_link: GoogleAppsScript.Slides.Link | null;
}

interface MockPageElementInternal {
	_shapeInternal: MockShapeInternal;
}

export interface MockSlideInternal {
	_pageElements: GoogleAppsScript.Slides.PageElement[];
	remove?: jest.Mock;
	_linkingMode?: string;
}

export interface MockPresentationInternal {
	_slides: GoogleAppsScript.Slides.Slide[];
}

// ----- Factory: TextStyle -----

export const createMockTextStyle = (initial?: Partial<MockShapeState>): GoogleAppsScript.Slides.TextStyle => {
	const state: MockShapeState = {
		text: initial?.text ?? "",
		bold: initial?.bold ?? false,
		italic: initial?.italic ?? false,
		strikethrough: initial?.strikethrough ?? false,
		underline: initial?.underline ?? false,
		fontSize: initial?.fontSize ?? null,
		foregroundColor: initial?.foregroundColor ?? null,
		borderColor: initial?.borderColor ?? null,
	};

	const mock = {
		getState: () => ({ ...state }),
		setBold: jest.fn((b: boolean) => { state.bold = b; }),
		setForegroundColor: jest.fn((c: GoogleAppsScript.Slides.ThemeColorType) => { state.foregroundColor = c as unknown as string; }),
		setFontSize: jest.fn((s: number) => { state.fontSize = s; }),
		setItalic: jest.fn((i: boolean) => { state.italic = i; }),
		setStrikethrough: jest.fn((s: boolean) => { state.strikethrough = s; }),
		setUnderline: jest.fn((u: boolean) => { state.underline = u; }),
	};

	return mock as unknown as GoogleAppsScript.Slides.TextStyle;
};

// ----- Factory: TextRange -----

export const createMockTextRange = (initial?: Partial<MockShapeState>): GoogleAppsScript.Slides.TextRange => {
	const state: MockShapeState = {
		text: initial?.text ?? "",
		bold: initial?.bold ?? false,
		italic: initial?.italic ?? false,
		strikethrough: initial?.strikethrough ?? false,
		underline: initial?.underline ?? false,
		fontSize: initial?.fontSize ?? null,
		foregroundColor: initial?.foregroundColor ?? null,
		borderColor: initial?.borderColor ?? null,
	};
	const textStyle = createMockTextStyle(state);

	const mock = {
		getState: () => ({ ...state }),
		asString: jest.fn(() => state.text),
		setText: jest.fn((t: string) => { state.text = t; }),
		getTextStyle: jest.fn(() => textStyle),
		setState: (s: Partial<MockShapeState>) => Object.assign(state, s),
		_textStyleInternal: textStyle,
	};

	return mock as unknown as GoogleAppsScript.Slides.TextRange;
};

// ----- Factory: LineFill / Border -----

export const createMockLineFill = (): GoogleAppsScript.Slides.LineFill => {
	let solidColor: string | null = null;
	const mock = {
		setSolidFill: jest.fn((c: GoogleAppsScript.Slides.ThemeColorType) => { solidColor = c as unknown as string; }),
	};
	return mock as unknown as GoogleAppsScript.Slides.LineFill;
};

export const createMockBorder = (): GoogleAppsScript.Slides.Border => {
	const lineFill = createMockLineFill();
	const mock = {
		getLineFill: jest.fn(() => lineFill),
	};
	return mock as unknown as GoogleAppsScript.Slides.Border;
};

export const createMockPageBackground = (): GoogleAppsScript.Slides.PageBackground => {
	let solidColor: GoogleAppsScript.Slides.ThemeColorType | null = null;
	const mock = {
		setSolidFill: jest.fn((c: GoogleAppsScript.Slides.ThemeColorType) => { solidColor = c; }),
		getSolidFill: jest.fn(() => null),
		setTransparent: jest.fn(),
	};
	return mock as unknown as GoogleAppsScript.Slides.PageBackground;
};

// ----- Factory: Link -----

export const createMockLink = ({
	linkedSlide,
	slideId,
	linkType = "UNSUPPORTED",
}: {
	linkedSlide?: GoogleAppsScript.Slides.Slide,
	slideId?: string,
	linkType?: string,
} = {}): GoogleAppsScript.Slides.Link => {
	const mock = {
		getLinkType: jest.fn(() => linkType),
		getLinkedSlide: jest.fn(() => linkedSlide ?? null),
		getSlideId: jest.fn(() => slideId ?? ""),
		getSlideIndex: jest.fn(() => -1),
		getUrl: jest.fn(() => ""),
	};
	return mock as unknown as GoogleAppsScript.Slides.Link;
};

// ----- Factory: Shape -----

export const createMockShape = (initialText?: string): GoogleAppsScript.Slides.Shape => {
	const textRange = createMockTextRange({ text: initialText });
	const border = createMockBorder();
	const objectId = `shape-${Math.random().toString(36).slice(2, 8)}`;
	let link: GoogleAppsScript.Slides.Link | null = null;

	const mock = {
		getText: jest.fn(() => textRange),
		getBorder: jest.fn(() => border),
		asShape: jest.fn(function () { return this as unknown as GoogleAppsScript.Slides.Shape; }),
		getObjectId: jest.fn(() => objectId),
		getLink: jest.fn(() => link),
		setLinkSlide: jest.fn((slide: GoogleAppsScript.Slides.Slide) => {
			link = createMockLink({
				linkedSlide: slide,
				slideId: slide.getObjectId(),
				linkType: "SLIDE_ID",
			});
			return link;
		}),
		setLinkUrl: jest.fn((url: string) => {
			link = createMockLink({
				linkType: "URL",
				slideId: url,
			});
			return link;
		}),
		_textRangeInternal: textRange,
		_borderInternal: border,
		get _link() { return link; },
		set _link(v: GoogleAppsScript.Slides.Link | null) { link = v; },
	};

	return mock as unknown as GoogleAppsScript.Slides.Shape;
};

// ----- Factory: PageElement -----

export const createMockPageElement = (description: string, initialText?: string): GoogleAppsScript.Slides.PageElement => {
	const shape = createMockShape(initialText);
	const objectId = `element-${Math.random().toString(36).slice(2, 8)}`;
	const mock = {
		getDescription: jest.fn(() => description),
		getObjectId: jest.fn(() => objectId),
		asShape: jest.fn(() => shape),
		_shapeInternal: shape,
	};

	return mock as unknown as GoogleAppsScript.Slides.PageElement;
};

// ----- Factory: Slide -----

export const createMockSlide = (
	elements?: GoogleAppsScript.Slides.PageElement[],
	objectIdArg?: string,
): GoogleAppsScript.Slides.Slide => {
	const pageElements = elements ?? [];
	let objectId = objectIdArg ?? `slide-${Math.random().toString(36).slice(2, 10)}`;
	const pageBackground = createMockPageBackground();
	let linkingMode: string = SlideLinkingMode.NOT_LINKED;

	const mock = {
		getObjectId: jest.fn(() => objectId),
		getPageElements: jest.fn(() => pageElements),
		insertPageElement: jest.fn((el: GoogleAppsScript.Slides.PageElement) => {
			pageElements.push(el);
			return el;
		}),
		replaceAllText: jest.fn(),
		getBackground: jest.fn(() => pageBackground),
		getSlideLinkingMode: jest.fn(() => linkingMode),
		_pageElements: pageElements,
		_pageBackground: pageBackground,
		get _linkingMode() { return linkingMode; },
		set _linkingMode(v: string) { linkingMode = v; },
	};

	return mock as unknown as GoogleAppsScript.Slides.Slide;
};

// ----- Factory: Presentation -----

export const createMockPresentation = (slides?: GoogleAppsScript.Slides.Slide[]): GoogleAppsScript.Slides.Presentation => {
	const slideList = slides ?? [];
	const objectId = `presentation-${Math.random().toString(36).slice(2, 10)}`;

	slideList.forEach((slide: GoogleAppsScript.Slides.Slide): void => {
		const mockSlide = slide as unknown as MockSlideInternal;
		mockSlide.remove = jest.fn(() => {
			const idx = slideList.indexOf(slide);
			if (idx !== -1) {
				slideList.splice(idx, 1);
			}
		});
	});

	const copyPageElements_ = (originalSlide: GoogleAppsScript.Slides.Slide): GoogleAppsScript.Slides.PageElement[] => {
		return (originalSlide as unknown as MockSlideInternal)._pageElements.map(el => {
			const newEl = createMockPageElement(
				el.getDescription(),
				(el as unknown as MockPageElementInternal)._shapeInternal.getText && 
				((el as unknown as MockPageElementInternal)._shapeInternal.getText() as unknown as MockTextRangeInternal).getState().text
			);
			const originalLink = (el as unknown as MockPageElementInternal)._shapeInternal._link;
			if (originalLink) {
				(newEl as unknown as MockPageElementInternal)._shapeInternal._link = originalLink;
			}
			return newEl;
		});
	};

	const mock = {
		getSlides: jest.fn(() => slideList),
		getSlideById: jest.fn((id: string) => {
			return (slideList as GoogleAppsScript.Slides.Slide[]).find(s => s.getObjectId() === id) ?? null;
		}),
		insertSlide: jest.fn((index: number, originalSlide?: GoogleAppsScript.Slides.Slide, linkingMode?: GoogleAppsScript.Slides.SlideLinkingMode) => {
			const newSlide = originalSlide
				? ((): GoogleAppsScript.Slides.Slide => {
					const slide = createMockSlide(copyPageElements_(originalSlide));
					const mockSlide = slide as unknown as MockSlideInternal;
					if (linkingMode) {
						mockSlide._linkingMode = linkingMode as unknown as string;
					}
					mockSlide.remove = jest.fn(() => {
						const idx = slideList.indexOf(slide);
						if (idx !== -1) {
							slideList.splice(idx, 1);
						}
					});
					return slide;
				})()
				: createMockSlide();
			slideList.splice(index, 0, newSlide);
			return newSlide;
		}),
		getObjectId: jest.fn(() => objectId),
		_slides: slideList,
	};

	return mock as unknown as GoogleAppsScript.Slides.Presentation;
};

// ----- Mock Document types -----

type MockParagraph = {
	getHeading: jest.Mock;
	getText: jest.Mock;
};

export const createMockParagraph = (
	heading: string,
	text: string,
): GoogleAppsScript.Document.Paragraph => {
	const mock: MockParagraph = {
		getHeading: jest.fn(() => heading),
		getText: jest.fn(() => text),
	};
	return mock as unknown as GoogleAppsScript.Document.Paragraph;
};

export const createMockBody = (
	paragraphs?: GoogleAppsScript.Document.Paragraph[],
): GoogleAppsScript.Document.Body => {
	const paraList = paragraphs ?? [];
	const mock = {
		getParagraphs: jest.fn(() => paraList),
	};
	return mock as unknown as GoogleAppsScript.Document.Body;
};

export const createMockDocument = (
	url: string,
	body?: GoogleAppsScript.Document.Body,
): GoogleAppsScript.Document.Document => {
	const mockBody = body ?? createMockBody();
	const mock = {
		getUrl: () => url,
		getBody: jest.fn(() => mockBody),
	};
	return mock as unknown as GoogleAppsScript.Document.Document;
};

// ----- SlidesApp mock -----

let activePresentation: GoogleAppsScript.Slides.Presentation | null = null;

export const mockSlidesApp = {
	ThemeColorType,
	SlideLinkingMode,
	LinkType,
	getActivePresentation: jest.fn(() => activePresentation),
	setActivePresentation: (p: GoogleAppsScript.Slides.Presentation | null) => { activePresentation = p; },
};

// ----- SpreadsheetApp mock -----

let activeSpreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet | null = null;

export const mockSpreadsheetApp = {
	getActiveSpreadsheet: jest.fn(() => activeSpreadsheet),
	openByUrl: jest.fn((url: string): GoogleAppsScript.Spreadsheet.Spreadsheet | null => {
		return activeSpreadsheet;
	}),
	create: jest.fn((name: string): GoogleAppsScript.Spreadsheet.Spreadsheet => {
		return { getName: () => name } as unknown as GoogleAppsScript.Spreadsheet.Spreadsheet;
	}),
	setActiveSpreadsheet: (s: GoogleAppsScript.Spreadsheet.Spreadsheet | null) => { activeSpreadsheet = s; },
};

// ----- DocumentApp mock -----

const documentMap = new Map<string, GoogleAppsScript.Document.Document>();

export const mockDocumentApp = {
	ParagraphHeading,
	openByUrl: jest.fn((url: string): GoogleAppsScript.Document.Document => {
		const doc = documentMap.get(url);
		if (!doc) {
			throw new Error(`Document not found: ${url}`);
		}
		return doc;
	}),
	addDocument: (url: string, doc: GoogleAppsScript.Document.Document) => {
		documentMap.set(url, doc);
	},
	clearDocuments: () => documentMap.clear(),
};
