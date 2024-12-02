import { env, logger } from "@ifx/shared";
import { IFXCommand } from "./base.cmd";

export class ProvisionCommand extends IFXCommand {
	async execute() {
		logger.debug(`ARC_ENV is "${env.ARC_ENV}"`);
		logger.debug({ definition: this.def }, "Definition");

		const integration = await this.ifx.getIntegration();
		logger.debug({ integration }, "IFX integrations");

		if (integration) {
			logger.info(`Updating IFX integration ${this.def.integrationName}`);
			await this.ifx.update();
		} else {
			logger.info(`Creating IFX integration ${this.def.integrationName}`);
			await this.ifx.create();
			logger.info("IFX integration created. Now upload and promote the bundle");
			return;
		}

		if (!this.def.enabled) {
			logger.info(`Integration ${this.def.integrationName} is disabled`);
			return;
		}

		logger.info("Subscribing");
		await this.ifx.subscribe();

		logger.info("Adding secrets");
		await this.ifx.addSecrets();
	}
}
