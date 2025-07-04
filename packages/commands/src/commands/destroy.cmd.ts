import { logger } from "@ifx/shared";
import inquirer from "inquirer";
import { IFXCommand } from "./base.cmd";

export class DestroyCommand extends IFXCommand {
	async execute() {
		this.notAllowedInTurbo(
			"Run this command in the integration directory: cd ./integrations/<integration> && npm run destroy",
		);

		const input = await inquirer.prompt([
			{
				name: "confirm",
				type: "list",
				message: `Are you sure you want to delete integration "${this.def.integrationName}"?`,
				choices: ["No", "Yes"],
			},
		]);

		if (input.confirm !== "Yes") {
			logger.info("Deletion cancelled");
			return;
		}

		logger.debug(`Deleting integration "${this.def.integrationName}"`);

		const token = await this.api.IFX.generateDeleteIntegrationToken(this.def.integrationName);
		if (!token.deleteToken) {
			throw new Error("Delete token is not defined");
		}

		await this.api.IFX.deleteIntegration(this.def.integrationName, token.deleteToken);
	}
}
