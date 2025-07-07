import { arc, logger } from "@ifx/shared";
import inquirer from "inquirer";

export async function execute() {
	const integrations = await arc.IFX.getIntegrations();
	const { integration } = await inquirer.prompt([
		{
			name: "integration",
			type: "list",
			message: "Select integration to delete",
			choices: integrations.map((i) => i.IntegrationName),
		},
	]);

	const { confirm } = await inquirer.prompt([
		{
			name: "confirm",
			type: "confirm",
			message: `Are you sure you want to delete integration "${integration}"?`,
		},
	]);

	if (!confirm) {
		return logger.warn("Aborted");
	}

	logger.debug(`Deleting integration "${integration}"`);

	const token = await arc.IFX.generateDeleteIntegrationToken(integration);
	if (!token.deleteToken) {
		throw new Error("Delete token is not defined");
	}

	await arc.IFX.deleteIntegration(integration, token.deleteToken);
}
