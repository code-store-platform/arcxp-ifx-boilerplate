import { logger } from "@ifx/shared";
import { commands } from "./commands";

execute();

function execute() {
	const cmd = process.argv.at(2) || "";
	if (!cmd) {
		return logger.warn("No command provided");
	}
	const fn = commands[cmd];
	if (!fn) {
		return logger.warn(`Command "${cmd}" not found`);
	}

	return fn();
}
