import { randomUUID } from "node:crypto";
import type { ArcTypes } from "@code.store/arcxp-sdk-ts";
import { ctx } from "./async_storage";
import { logger } from "./logger";
import type { IFXEvent } from "./types";

export type Handler<T = any, R = any> = (event: IFXEvent<T>) => Promise<R>;

export type HandlerOptions = {
	handlerName?: string; // passed into async context for further identification
	safe?: boolean; // if true - the handler will not throw, but log the error, (default: true)
};

export const handler = <Fn extends Handler = Handler<unknown, unknown>>(fn: Fn, options?: Partial<HandlerOptions>) => {
	const safe = options?.safe ?? true;
	const handlerName = options?.handlerName || "unknown";
	const withCtx = async (event) => {
		return ctx.run({ id: event?.uuid || randomUUID(), eventName: event?.key, handlerName }, () =>
			fn(event).catch((error) => {
				if (!safe) throw error;

				logger.error(error, "HandlerError");
			}),
		);
	};

	return withCtx as Fn;
};
