import path from "node:path";
import { type ArcAPI, type IFXIntegrationDefinition, type IFXService, paths } from "@ifx/shared";

export class IFXCommand {
	constructor(
		public def: IFXIntegrationDefinition,
		public ifx: IFXService,
		public api: ArcAPI,
	) {}

	execute(): any {
		return Promise.reject(new Error("Command is not implemented"));
	}

	protected ifxDir(...values: string[]) {
		return path.join(paths.cwd, ...values);
	}

	protected eventsHandlers() {
		return import(this.ifxDir("./src/eventsHandlers.ts"));
	}

	protected eventsRouter() {
		try {
			return require(this.ifxDir("./src/eventsRouter.json")) as Record<string, string[]>;
		} catch (error) {
			throw new Error("require eventsRouter.json failed", { cause: error });
		}
	}
}
