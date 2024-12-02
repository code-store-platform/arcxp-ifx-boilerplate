import { ArcAPI } from "@code.store/arcxp-sdk-ts";
import { env } from "./env";

export const arc = ArcAPI({
	credentials: {
		accessToken: env.ARC_ACCESS_TOKEN,
		organizationName: env.ARC_ORGANIZATION_NAME,
	},
	maxRPS: 10,
});
