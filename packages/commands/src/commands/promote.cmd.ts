import { logger } from "@ifx/shared";
import inquirer from "inquirer";
import { IFXCommand } from "./base.cmd";

export class PromoteCommand extends IFXCommand {
	async execute() {
		this.notAllowedInTurbo(
			"Run this command in the integration directory: cd ./integrations/<integration> && npm run promote",
		);

		const bundles = await this.ifx.getBundles();
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

		await this.ifx.promoteBundle(bundle.deployVersion);
		await this.ifx.waitForLive(bundle.name);

		logger.info(`Bundle ${bundle.name} is now live 🚀`);
	}
}
