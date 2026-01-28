import { execSync } from "node:child_process";
import { cp } from "node:fs/promises";
import { logger } from "@ifx/shared";
import esbuild from "esbuild";
import { IFXCommand } from "./base.cmd";

export class BuildCommand extends IFXCommand {
	public async execute() {
		this.lint();
		this.cleanDist();
		await this.build();
		await this.copyRouter();
		await this.copyNodeModules();
		await this.executeHealthRoute();
	}

	cleanDist() {
		execSync(`npx rimraf ${this.ifxDir("dist")}`);
	}

	lint() {
		execSync("npm run lint", { stdio: "inherit" });
	}

	typeCheck() {
		execSync("npx tsc --noEmit", { stdio: "inherit" });
	}

	async build() {
		logger.debug("Building source");

		this.typeCheck();

		await esbuild.build({
			entryPoints: [this.eventsHandlersPath],
			outdir: this.ifxDir("dist", "src"),
			bundle: true,
			platform: "node",
			define: {
				"process.env.PRETTY_PRINT": "false",
			},
		});
	}

	async copyRouter() {
		logger.debug("Copying router");
		await this.copy(this.eventsRouterPath, this.ifxDir("dist", "src", "eventsRouter.json"));
	}

	async copyNodeModules() {
		logger.debug("Copying node_modules");
		await this.copy(this.ifxDir("node_modules"), this.ifxDir("dist", "node_modules"));
	}

	async executeHealthRoute() {
		logger.debug("Executing health route");

		try {
			await require(this.ifxDir("dist", "src", "eventsHandlers.js")).health({
				key: "key",
				eventName: "build",
			});
		} catch (error) {
			logger.error(error, "health route failed");
			throw error;
		}
	}

	async copy(from: string, to: string) {
		await cp(from, to, { recursive: true });
	}
}
