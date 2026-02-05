import type { ArcTypes } from "@code.store/arcxp-sdk-ts";
import { type IFXEvent, handler, logger } from "@ifx/shared";
import { env } from "../env";

export const health = handler(
	async (event: IFXEvent<ArcTypes.ANS.AStory>) => {
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
