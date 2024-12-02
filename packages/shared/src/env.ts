import dotenv from "dotenv";

const args = process.argv.slice(2);
const ARC_ENV = args.find((a) => a.startsWith("--env="))?.split("=")[1] || "sandbox";

dotenv.config({ path: [`.env.${ARC_ENV}`, `../../.env.${ARC_ENV}`] });

export const env = {
	ARC_ORGANIZATION_NAME: process.env.ARC_ORGANIZATION_NAME || "",
	ARC_ACCESS_TOKEN: process.env.ARC_ACCESS_TOKEN || "",
	PRETTY_PRINT: process.env.PRETTY_PRINT || "",
	ARC_ENV,
};

export const config = <T extends {}>(obj: T) => {
	Object.assign(env, obj);
	return env as T & typeof env;
};
