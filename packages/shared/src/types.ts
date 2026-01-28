import type { ArcAPIType } from "@code.store/arcxp-sdk-ts";

export type ArcAPI = ArcAPIType;

export type IFXIntegrationDefinition = {
	integrationName: string;
	description: string;
	email: string;
	events: string[];
	runtime: "node";
	enabled: boolean;
	ignore: boolean; // If true the integration will not be deployed/promoted
};

export type IFXEvent<Body = any> = {
	key: string;
	typeId: number;
	version: number;
	uuid: string;
	body: Body;
	time: number | null;
};
