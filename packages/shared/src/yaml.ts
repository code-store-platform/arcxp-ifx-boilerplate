import { readFileSync } from "node:fs";
import YAML from "yaml";
import { paths } from "./paths";
import type { IFXIntegrationDefinition } from "./types";

export const getDefinition = () => {
	const file = readFileSync(paths.definition, "utf8");
	const definition = YAML.parse(file) as IFXIntegrationDefinition;

	return definition;
};

export const parseYaml = (yaml: string) => {
	return YAML.parse(yaml);
};

export const stringifyYaml = (yaml: any) => {
	return YAML.stringify(yaml);
};
