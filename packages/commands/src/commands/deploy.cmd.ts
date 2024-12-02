import { execSync } from "node:child_process";
import { rmSync } from "node:fs";
import path from "node:path";
import { env, logger, paths } from "@ifx/shared";
import { IFXCommand } from "./base.cmd";

export class DeployCommand extends IFXCommand {
	async execute() {
		const tmpBundlePath = path.join(paths.tmp, `${this.def.integrationName}.zip`);

		logger.debug({ tmpBundlePath }, `Deploy started to env ${env.ARC_ENV}`);

		rmSync(tmpBundlePath, { force: true });
		execSync("npm run lint", { stdio: "inherit" });
		execSync("npm run build", { stdio: "inherit" });
		execSync(`(cd dist/ && zip -r ${tmpBundlePath} ./* -x \"dist.zip\")`, { stdio: "inherit" });

		const bundleName = this.getBundleName();

		const version = await this.ifx.deployBundle(bundleName, tmpBundlePath);
		if (!version) {
			throw new Error("Bundle deployment failed. Version is not defined");
		}

		await this.ifx.promoteBundle(version);
		await this.ifx.waitForLive(bundleName);

		logger.info(`Bundle ${bundleName} deployed successfully 🏆`);
	}

	getBundleName() {
		return `${new Date().toISOString().replaceAll(/[:.]/g, "_")}-${process.env.USER || "anon"}`;
	}
}
