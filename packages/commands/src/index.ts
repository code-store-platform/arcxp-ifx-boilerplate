import { IFXService, arc, env, getDefinition, logger } from "@ifx/shared";
import { commands } from "./commands";

export function execute() {
	const definition = getDefinition();
	const cmd = process.argv.at(2) || "";
	const Command = commands[cmd];

	if (!cmd) {
		return logger.warn("No command provided");
	}
	if (!Command) {
		return logger.warn(`Command "${cmd}" not found`);
	}
	if (definition.ignore) {
		return logger.warn(`Integration "${definition.integrationName}" is ignored, ${cmd} will not be executed`);
	}

	const ifx = new IFXService(definition, arc);
	return new Command(definition, ifx, arc).execute();
}
