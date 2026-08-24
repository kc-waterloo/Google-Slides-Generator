/**
 * tests/shared/copy-slide.test.ts
 *
 * Created by Min-Kyu Lee on 24-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { copySlide_ } from "../../src/shared/copy-slide";
import { buildMockPresentation, resetMocks } from "../helpers";

beforeEach(() => {
	resetMocks();
});

describe("copySlide_", () => {
	it("creates a new slide at the given index", () => {
		const { presentation } = buildMockPresentation();

		const result = copySlide_({
			presentation,
			originalSlideId: "title-slide-id",
			newSlideIndex: 2,
		});

		expect(result).not.toBeNull();
		expect(presentation.getSlides().length).toBe(3);
	});

	it("returns null when original slide does not exist", () => {
		const { presentation } = buildMockPresentation();

		const result = copySlide_({
			presentation,
			originalSlideId: "nonexistent-id",
			newSlideIndex: 2,
		});

		expect(result).toBeNull();
	});

	it("forwards linkingMode to presentation.insertSlide", () => {
		const { presentation } = buildMockPresentation();

		copySlide_({
			presentation,
			originalSlideId: "title-slide-id",
			newSlideIndex: 2,
			linkingMode: SlidesApp.SlideLinkingMode.LINKED,
		});

		const slides = presentation.getSlides();
		expect(slides.length).toBe(3);
		const newSlide = slides[2]!;
		expect(newSlide.getSlideLinkingMode()).toBe("LINKED");
	});

	it("creates unlinked copies by default", () => {
		const { presentation } = buildMockPresentation();

		copySlide_({
			presentation,
			originalSlideId: "title-slide-id",
			newSlideIndex: 2,
		});

		const slides = presentation.getSlides();
		const newSlide = slides[2]!;
		expect(newSlide.getSlideLinkingMode()).toBe("NOT_LINKED");
	});

	it("inserts at index 0", () => {
		const { presentation } = buildMockPresentation();

		const result = copySlide_({
			presentation,
			originalSlideId: "title-slide-id",
			newSlideIndex: 0,
		});

		expect(result).not.toBeNull();
		expect(presentation.getSlides().length).toBe(3);
		expect(presentation.getSlides()[0]!.getObjectId()).toBe(result!.getObjectId());
	});

	it("inserts beyond presentation length", () => {
		const { presentation } = buildMockPresentation();

		const result = copySlide_({
			presentation,
			originalSlideId: "title-slide-id",
			newSlideIndex: 10,
		});

		expect(result).not.toBeNull();
		expect(presentation.getSlides().length).toBe(3);
		expect(presentation.getSlides()[2]!.getObjectId()).toBe(result!.getObjectId());
	});

	it("handles NaN newSlideIndex without crashing", () => {
		jest.spyOn(console, "log").mockImplementation(() => {});
		jest.spyOn(console, "error").mockImplementation(() => {});
		const { presentation } = buildMockPresentation();

		copySlide_({
			presentation,
			originalSlideId: "title-slide-id",
			newSlideIndex: NaN,
		});

		expect(presentation.getSlides().length).toBe(3);
	});

	it("handles Infinity newSlideIndex without crashing", () => {
		jest.spyOn(console, "log").mockImplementation(() => {});
		jest.spyOn(console, "error").mockImplementation(() => {});
		const { presentation } = buildMockPresentation();

		copySlide_({
			presentation,
			originalSlideId: "title-slide-id",
			newSlideIndex: Infinity,
		});

		expect(presentation.getSlides().length).toBe(3);
	});

	it("handles undefined originalSlideId", () => {
		jest.spyOn(console, "log").mockImplementation(() => {});
		jest.spyOn(console, "error").mockImplementation(() => {});
		const { presentation } = buildMockPresentation();

		const result = copySlide_({
			presentation,
			originalSlideId: undefined as unknown as string,
			newSlideIndex: 2,
		});

		expect(result).toBeNull();
	});

	it("handles getSlideById throwing", () => {
		jest.spyOn(console, "log").mockImplementation(() => {});
		jest.spyOn(console, "error").mockImplementation(() => {});
		const { presentation } = buildMockPresentation();
		presentation.getSlideById = jest.fn(() => {
			throw new Error("getSlideById error");
		});

		expect(() => {
			copySlide_({
				presentation,
				originalSlideId: "title-slide-id",
				newSlideIndex: 2,
			});
		}).toThrow("getSlideById error");
	});

	it("handles insertSlide returning null", () => {
		jest.spyOn(console, "log").mockImplementation(() => {});
		jest.spyOn(console, "error").mockImplementation(() => {});
		const { presentation } = buildMockPresentation();
		presentation.insertSlide = jest.fn(() => null as unknown as never);

		const result = copySlide_({
			presentation,
			originalSlideId: "title-slide-id",
			newSlideIndex: 2,
		});

		expect(result).toBeNull();
	});

	it("uses provided originalSlide directly, skipping getSlideById", () => {
		const { presentation } = buildMockPresentation();
		const getSlideByIdSpy = jest.spyOn(presentation, "getSlideById");

		const preloadedSlide = presentation.getSlideById("title-slide-id")!;
		getSlideByIdSpy.mockClear();

		const result = copySlide_({
			presentation,
			originalSlideId: "title-slide-id",
			newSlideIndex: 2,
			originalSlide: preloadedSlide,
		});

		expect(result).not.toBeNull();
		expect(getSlideByIdSpy).not.toHaveBeenCalled();
	});

	it("falls back to getSlideById when originalSlide is not provided", () => {
		const { presentation } = buildMockPresentation();
		const getSlideByIdSpy = jest.spyOn(presentation, "getSlideById");

		const result = copySlide_({
			presentation,
			originalSlideId: "title-slide-id",
			newSlideIndex: 2,
		});

		expect(result).not.toBeNull();
		expect(getSlideByIdSpy).toHaveBeenCalledWith("title-slide-id");
	});
});
