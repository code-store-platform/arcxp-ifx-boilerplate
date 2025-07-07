import { arc, logger } from "@ifx/shared";
import inquirer from "inquirer";

export async function execute() {
	const integrations = await arc.IFX.getIntegrations();
	const { integration } = await inquirer.prompt([
		{
			name: "integration",
			type: "list",
			message: "Select integration to promote",
			choices: integrations.map((i) => i.IntegrationName),
		},
	]);

	const bundles = await arc.IFX.getBundles(integration);
	const available = bundles.results.filter((b) => b.deployVersion).slice(0, 10);
	const { bundle } = await inquirer.prompt([
		{
			name: "bundle",
			type: "list",
			message: "Select bundle to promote",
			loop: false,
			choices: available.map((b) => ({
				name: JSON.stringify({
					...b,
					deployedOn: undefined,
					promotedOn: undefined,
					uploadedOn: undefined,
					integrationName: undefined,
					organizationId: undefined,
				}),
				value: b,
			})),
		},
	]);

	if (!bundle) {
		return logger.warn("No bundle selected!");
	}

	logger.info({ bundle }, "Promoting selected bundle...");

	const promoteResponse = await arc.IFX.promoteBundle(integration, bundle.deployVersion);
	logger.debug(promoteResponse, "Promote response");
}
