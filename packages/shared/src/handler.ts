import { randomUUID } from "node:crypto";
import { ctx } from "./async_storage";
import { logger } from "./logger";
import type { IFXEvent } from "./types";

export type Handler<T = any> = (event: IFXEvent<T>) => Promise<any>;

export type HandlerOptions = {
	handlerName?: string; // passed into async context for further identification
	safe?: boolean; // if true - the handler will not throw, but log the error, (default: true)
};

export const handler = <T>(fn: Handler<T>, options?: Partial<{ handlerName: string; safe }>): Handler<T> => {
	const safe = options?.safe ?? true;
	const handlerName = options?.handlerName || "unknown";

	return (event) => {
		return ctx.run({ id: event?.uuid || randomUUID(), eventName: event?.key, handlerName }, () =>
			fn(event).catch((error) => {
				if (!safe) throw error;

				logger.error(error, "HandlerError");
			}),
		);
	};
};
