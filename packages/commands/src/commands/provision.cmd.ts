import { env, logger } from "@ifx/shared";
import { IFXCommand } from "./base.cmd";
import { DeployCommand } from "./deploy.cmd";

export class ProvisionCommand extends IFXCommand {
	async execute() {
		logger.debug(`ARC_ENV is "${env.ARC_ENV}"`);
		logger.debug({ definition: this.def }, "Definition");

		const integration = await this.ifx.getIntegration();
		logger.debug({ integration }, "IFX integrations");

		if (integration) {
			await this.updateIntegration();
		} else {
			await this.createIntegration();
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

	async createIntegration() {
		logger.info(`Creating IFX integration ${this.def.integrationName}`);
		await this.ifx.create();

		const bundles = await this.ifx.getBundles();
		const deploying = bundles.results.find((bundle) => bundle.status === "DEPLOYING");
		if (deploying) {
			logger.info(`System bundle ${deploying.name} is deploying. Waiting for it to finish...`);
			await this.ifx.waitForDeployed(deploying.name);
		} else {
			logger.info("System bundle is deployed");
		}

		logger.info("Deploying new bundle");
		await this.executeSubCommand(DeployCommand);
	}

	async updateIntegration() {
		logger.info(`Updating IFX integration ${this.def.integrationName}`);
		await this.ifx.update();
	}
}
