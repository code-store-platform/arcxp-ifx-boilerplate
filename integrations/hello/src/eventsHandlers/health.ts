import type { ArcTypes } from "@code.store/arcxp-sdk-ts";
import { handler, logger } from "@ifx/shared";
import { env } from "../env";

export const health = handler<ArcTypes.Story.AStory>(
	async (event) => {
		logger.debug({ ...event, body: event?.body?._id }, "event");
		logger.debug(`Custom ENV is ${env.CUSTOM_ENV}`);

		return {
			status: "event processed correctly",
			result: {
				ok: true,
			},
		};
	},
	{
		handlerName: "health",
		safe: false,
	},
);
