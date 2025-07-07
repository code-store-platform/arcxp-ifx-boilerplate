import { logger } from "@ifx/shared";
import { IFXCommand } from "./base.cmd";

export class StatusCommand extends IFXCommand {
	async execute() {
		logger.debug({ definition: this.def }, "Definition");

		const bundles = await this.ifx.getBundles();
		logger.debug({ bundles }, "Bundles");

		const subscriptions = await this.ifx.getSubscriptions();
		logger.debug({ subscriptions }, "Subscriptions");

		const integration = await this.ifx.getIntegration();
		logger.debug({ integration }, "Integration");

		const secrets = await this.ifx.getSecrets();
		logger.debug({ secrets }, "Secrets");
	}
}
