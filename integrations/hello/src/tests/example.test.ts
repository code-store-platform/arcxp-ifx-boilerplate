import { describe, expect, test } from "vitest";
import { health } from "../eventsHandlers";

describe("example", () => {
	test("should return ok", async () => {
		const result = await health({
			typeId: 1,
			version: 1,
			uuid: "test",
			key: "story:create",
			time: Date.now(),
			body: {
				type: "story",
				version: "0.10.12",
			},
		});

		expect(result).toMatchObject({ result: { ok: true } });
	});
});
