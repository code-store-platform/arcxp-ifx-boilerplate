import dotenv from "dotenv";

const args = process.argv.slice(2);
const ARC_ENV = args.find((a) => a.startsWith("--env="))?.split("=")[1] || "sandbox";

dotenv.config({ path: [`.env.${ARC_ENV}`, `../../.env.${ARC_ENV}`] });

export const env = {
	ARC_ORGANIZATION_NAME: process.env.ARC_ORGANIZATION_NAME || "",
	ARC_ACCESS_TOKEN: process.env.ARC_ACCESS_TOKEN || "",
	PRETTY_PRINT: process.env.PRETTY_PRINT || "",
	ARC_ENV,
	LOG_LEVEL: process.env.LOG_LEVEL || "debug",

	// Datadog keys
	DATADOG_ENABLED: process.env.DATADOG_ENABLED || "false",
	DATADOG_SITE: process.env.DATADOG_SITE || "datadoghq.eu",
	DATADOG_SERVICE_NAME: process.env.DATADOG_SERVICE_NAME,
	DATADOG_API_KEY: process.env.DATADOG_API_KEY,
};

export const config = <T extends {}>(obj: T) => {
	Object.assign(env, obj);
	return env as T & typeof env;
};
