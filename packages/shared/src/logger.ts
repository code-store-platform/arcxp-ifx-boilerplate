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

if (env.DATADOG_ENABLED === "true") {
	const organization = env.ARC_ORGANIZATION_NAME?.split(".").at(-1) || "unknown-org";
	const site = env.DATADOG_SITE || "datadoghq.eu";
	const service = env.DATADOG_SERVICE_NAME || `ifx-${organization}`;

	const datadogWorker = pino.transport({
		target: "pino-datadog-transport",
		options: {
			ddClientConf: {
				authMethods: { apiKeyAuth: env.DATADOG_API_KEY },
			},
			ddServerConf: { site },
			service,
			ddsource: "nodejs",
			ddtags: `env:${env.ARC_ORGANIZATION_NAME},team:ifx`,
			retries: 20,
		},
	});

	datadogWorker.on("error", (err: any) => {
		console.error("Datadog worker error (kept alive):", err);
	});

	streams.push({ level, stream: datadogWorker });
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
