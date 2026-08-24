/**
 * tests/shared/update-slide-links.test.ts
 *
 * Created by Min-Kyu Lee on 25-05-2026
 * Copyright © 2026 Min-Kyu Lee. All rights reserved.
 */

import { updateSlideLinks_ } from "../../src/shared/link/update-slide-links";
import { createMockSlide, createMockPageElement } from "../__mocks__/google-apps-script";
import * as logger from "../../src/shared/logger/logger";

describe("updateSlideLinks_", () => {
	it("does nothing with empty map", () => {
		const map = new Map<string, GoogleAppsScript.Slides.Slide>();
		expect(() => updateSlideLinks_({ originalToCopyMap: map })).not.toThrow();
	});

	it("skips non-shape page elements (asShape returns null)", () => {
		const el = createMockPageElement("test-key");
		(el.asShape as jest.Mock).mockReturnValue(null);
		const slide = createMockSlide([el], "slide-1");
		const map = new Map([["original-id", slide]]);
		expect(() => updateSlideLinks_({ originalToCopyMap: map })).not.toThrow();
	});

	it("skips shapes without links (getLink returns null)", () => {
		const slide = createMockSlide([createMockPageElement("test-key")], "slide-1");
		const map = new Map([["original-id", slide]]);
		expect(() => updateSlideLinks_({ originalToCopyMap: map })).not.toThrow();
	});

	it("skips shapes where getLink throws", () => {
		const el = createMockPageElement("test-key");
		const shape = el.asShape() as unknown as { getLink: jest.Mock };
		shape.getLink.mockImplementation(() => { throw new Error("getLink failed"); });
		const slide = createMockSlide([el], "slide-1");
		const map = new Map([["original-id", slide]]);
		expect(() => updateSlideLinks_({ originalToCopyMap: map })).not.toThrow();
	});

	it("skips external URL links (not SLIDE_ID/SLIDE_INDEX/SLIDE_POSITION)", () => {
		const el = createMockPageElement("test-key");
		const shape = el.asShape() as unknown as { getLink: jest.Mock; setLinkUrl: jest.Mock };
		shape.setLinkUrl("https://example.com");
		const slide = createMockSlide([el], "slide-1");
		const map = new Map([["original-id", slide]]);
		expect(() => updateSlideLinks_({ originalToCopyMap: map })).not.toThrow();
	});

	it("skips shapes where getLinkType throws", () => {
		const el = createMockPageElement("test-key");
		const target = createMockSlide([], "target-id");
		const shape = el.asShape();
		shape.setLinkSlide(target);
		const link = shape.getLink() as unknown as { getLinkType: jest.Mock };
		link.getLinkType.mockImplementation(() => { throw new Error("getLinkType failed"); });
		const slide = createMockSlide([el], "slide-1");
		const map = new Map([["target-id", slide]]);
		expect(() => updateSlideLinks_({ originalToCopyMap: map })).not.toThrow();
	});

	it("skips shapes where getSlideId throws", () => {
		const el = createMockPageElement("test-key");
		const target = createMockSlide([], "target-id");
		const shape = el.asShape();
		shape.setLinkSlide(target);
		const link = shape.getLink() as unknown as { getSlideId: jest.Mock };
		link.getSlideId.mockImplementation(() => { throw new Error("getSlideId failed"); });
		const slide = createMockSlide([el], "slide-1");
		const map = new Map([["target-id", slide]]);
		expect(() => updateSlideLinks_({ originalToCopyMap: map })).not.toThrow();
	});

	it("skips shapes where getSlideId returns empty string", () => {
		const el = createMockPageElement("test-key");
		const target = createMockSlide([], "target-id");
		const shape = el.asShape();
		shape.setLinkSlide(target);
		const link = shape.getLink() as unknown as { getSlideId: jest.Mock };
		link.getSlideId.mockReturnValue("");
		const slide = createMockSlide([el], "slide-1");
		const map = new Map([["target-id", slide]]);
		expect(() => updateSlideLinks_({ originalToCopyMap: map })).not.toThrow();
	});

	it("handles setLinkSlide failure gracefully", () => {
		const el = createMockPageElement("test-key");
		const target = createMockSlide([], "target-id");
		const shape = el.asShape();
		shape.setLinkSlide(target);
		const mockSetLinkSlide = shape.setLinkSlide as jest.Mock;
		mockSetLinkSlide.mockImplementation(() => { throw new Error("setLinkSlide failed"); });
		const slide = createMockSlide([el], "slide-1");
		const map = new Map([["target-id", slide]]);
		expect(() => updateSlideLinks_({ originalToCopyMap: map })).not.toThrow();
	});

	it("redirects shape link from original slide to its copy", () => {
		const sourceSlide = createMockSlide([], "source-id");
		const copySlide = createMockSlide([
			createMockPageElement("linked-key"),
		], "copy-id");
		const el = copySlide.getPageElements()[0]!;
		const shape = el.asShape();

		shape.setLinkSlide(sourceSlide);

		const map = new Map<string, GoogleAppsScript.Slides.Slide>([
			["source-id", copySlide],
		]);

		const logSpy = jest.spyOn(logger, "logInfo").mockImplementation(() => {});

		updateSlideLinks_({ originalToCopyMap: map });

		expect(shape.setLinkSlide).toHaveBeenCalledWith(copySlide);
		expect(logSpy).toHaveBeenCalledWith(
			"updateSlideLinks_",
			"Updated 1 slide links to point to duplicated targets",
		);
		logSpy.mockRestore();
	});
});
