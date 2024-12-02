import { stat } from "node:fs/promises";
import { env } from "./env";
import { logger } from "./logger";
import type { ArcAPI, IFXIntegrationDefinition } from "./types";
import { sleep } from "./utils";

export class IFXService {
	constructor(
		readonly def: IFXIntegrationDefinition,
		readonly arc: ArcAPI,
	) {}
	private readonly logger = logger.child({ service: "IFXService" });

	async create() {
		this.logger.debug(`Creating integration "${this.def.integrationName}"`);

		await this.arc.IFX.createIntegration({
			integrationName: this.def.integrationName,
			description: this.def.description,
			email: this.def.email,
			runtime: this.def.runtime,
		});
	}

	async update() {
		this.logger.debug(`Updating integration "${this.def.integrationName}"`);

		await this.arc.IFX.updateIntegration(this.def.integrationName, {
			email: this.def.email,
			enabled: this.def.enabled,
		});
	}

	async logs() {
		const query = await this.arc.IFX.initializeQuery(this.def.integrationName, "start=100000&limit=100");
		let retriesLeft = 10;

		while (retriesLeft > 0) {
			const logs = await this.arc.IFX.getLogs(query.queryId);
			if (logs.status === "Scheduled" || logs.status === "Running") {
				retriesLeft -= 1;
				await sleep(5 * 1000);
			} else {
				this.logger.debug(logs, "Logs");
				return logs;
			}
		}
	}

	async subscribe() {
		const subscriptions = await this.getSubscriptions();
		const toDelete = subscriptions.filter((s) => !this.def.events.find((e) => e === s.eventName));

		for (const eventName of this.def.events) {
			const exists = subscriptions.find((s) => s.eventName === eventName);
			if (exists) {
				await this.arc.IFX.updateSubscription({
					integrationName: this.def.integrationName,
					eventName,
					enabled: true,
				});
			} else {
				await this.arc.IFX.subscribe({
					integrationName: this.def.integrationName,
					eventName,
					enabled: true,
				});
			}
		}

		for (const subscription of toDelete) {
			await this.arc.IFX.updateSubscription({
				integrationName: this.def.integrationName,
				eventName: subscription.eventName,
				enabled: false,
			});
		}
	}

	async getSubscriptions() {
		const data = await this.arc.IFX.getSubscriptions();

		return data.subscriptions.filter((i) => i.integrationName === this.def.integrationName);
	}

	async getIntegrations() {
		const data = await this.arc.IFX.getIntegrations();

		return data;
	}

	async getIntegration() {
		const data = await this.arc.IFX.getIntegrations();

		return data.find((i) => i.IntegrationName === this.def.integrationName);
	}

	async addSecrets() {
		const overrideValues = {
			PRETTY_PRINT: "false",
		};

		for (const key of Object.keys(env)) {
			const value = overrideValues[key] || env[key]?.toString() || "";

			this.logger.debug(`Adding secret ${key}:${value}`);

			await this.arc.IFX.addSecret({
				integrationName: this.def.integrationName,
				secretName: key,
				secretValue: value,
			});
		}
	}

	async getSecrets() {
		const secrets = await this.arc.IFX.getSecrets(this.def.integrationName);
		return secrets;
	}

	async getBundles() {
		return await this.arc.IFX.getBundles(this.def.integrationName);
	}

	async getBundleByName(bundleName: string) {
		const bundles = await this.getBundles();
		return bundles.results.find((b) => b.name === bundleName);
	}

	async deployBundle(bundleName: string, bundlePath: string) {
		await stat(bundlePath).catch(() => {
			throw new Error(`Bundle does not exist at ${bundlePath}`);
		});

		this.logger.debug(`Uploading bundle ${bundleName} at ${bundlePath}`);
		const uploadResponse = await this.arc.IFX.uploadBundle(this.def.integrationName, bundleName, bundlePath);
		this.logger.debug(uploadResponse, "Upload response");

		const deployResponse = await this.arc.IFX.deployBundle(this.def.integrationName, bundleName);
		this.logger.debug(deployResponse, "Deploy response");

		const bundle = await this.waitForDeployed(bundleName);
		return bundle.deployVersion;
	}

	async waitForDeployed(bundleName: string) {
		return this.waitForBundleStatus(bundleName, "DEPLOYED");
	}

	async waitForLive(bundleName: string) {
		return this.waitForBundleStatus(bundleName, "LIVE");
	}

	async waitForBundleStatus(bundleName: string, status: string, retries = 30) {
		let retriesLeft = retries;

		this.logger.debug(`Waiting for bundle status "${status}"...`);

		while (retriesLeft > 0) {
			const bundle = await this.getBundleByName(bundleName);
			if (bundle?.status === status) {
				return bundle;
			}

			retriesLeft -= 1;
			await sleep(1000);
		}

		throw new Error(`Bundle status "${status}" not reached`);
	}

	async promoteBundle(version: number) {
		const promoteResponse = await this.arc.IFX.promoteBundle(this.def.integrationName, version);
		this.logger.debug(promoteResponse, "Promote response");
	}
}
