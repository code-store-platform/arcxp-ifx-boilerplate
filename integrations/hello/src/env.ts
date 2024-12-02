import { config } from "@ifx/shared";

export const env = config({
	CUSTOM_ENV: process.env.CUSTOM_ENV,
});
