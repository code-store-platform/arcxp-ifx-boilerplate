import pino, { type Level, type Logger, multistream } from "pino";
import { ctx } from "./async_storage";
import { env } from "./env";

const level: Level = (env.LOG_LEVEL as Level) || "debug";
const streams: pino.StreamEntry[] = [];

if (env.PRETTY_PRINT === "true") {
	streams.push({ level, stream: pino.transport({ target: "pino-pretty" }) });
} else {
	streams.push({ level, stream: pino.destination(1) });
}

export const logger: Logger = pino(
	{
		level,
		base: undefined,
		mixin(_context, level) {
			return {
				levelLabel: logger.levels.labels[level],
				ctx: ctx.get(),
			};
		},
	},
	multistream(streams),
);
