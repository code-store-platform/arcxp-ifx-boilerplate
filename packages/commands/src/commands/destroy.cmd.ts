import { logger } from "@ifx/shared";
import { IFXCommand } from "./base.cmd";

export class DestroyCommand extends IFXCommand {
	async execute() {
		logger.debug(`Deleting integration "${this.def.integrationName}"`);
		const token = await this.api.IFX.generateDeleteIntegrationToken(this.def.integrationName);
		if (!token.deleteToken) {
			throw new Error("Delete token is not defined");
		}
		await this.api.IFX.deleteIntegration(this.def.integrationName, token.deleteToken);
	}
}
