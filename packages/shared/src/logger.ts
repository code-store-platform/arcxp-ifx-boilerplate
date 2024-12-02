import pino, { type Level, type Logger } from "pino";
import { ctx } from "./async_storage";
import { env } from "./env";

const level: Level = "debug";
const transport = getTransport();

export const logger: Logger = pino({
	level,
	transport,
	base: null,
	mixin(_context, level) {
		return { levelLabel: logger.levels.labels[level], ctx: ctx.get() };
	},
});

function getTransport() {
	if (env.PRETTY_PRINT !== "true") return undefined;

	return { target: "pino-pretty" };
}
