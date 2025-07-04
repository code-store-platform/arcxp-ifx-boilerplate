import path from "node:path";
import { pathToFileURL } from "node:url";
import { type ArcAPI, type IFXIntegrationDefinition, type IFXService, paths } from "@ifx/shared";

export class IFXCommand {
	protected eventsHandlersPath = this.ifxDir("src", "eventsHandlers.ts");
	protected eventsRouterPath = this.ifxDir("src", "eventsRouter.json");

	constructor(
		public def: IFXIntegrationDefinition,
		public ifx: IFXService,
		public api: ArcAPI,
	) {}

	execute(): any {
		return Promise.reject(new Error("Command is not implemented"));
	}

	executeSubCommand(Command: typeof IFXCommand) {
		return new Command(this.def, this.ifx, this.api).execute();
	}

	protected ifxDir(...values: string[]) {
		return path.join(paths.cwd, ...values);
	}

	protected eventsHandlers() {
		return import(pathToFileURL(this.eventsHandlersPath).href);
	}

	protected eventsRouter() {
		try {
			return require(this.eventsRouterPath) as Record<string, string[]>;
		} catch (error) {
			throw new Error("require eventsRouter.json failed", { cause: error });
		}
	}

	protected notAllowedInTurbo(explanation: string) {
		const isTurbo = !!process.env.TURBO_HASH;

		if (isTurbo) {
			throw new Error(`Command is not allowed in turbo. ${explanation}`);
		}
	}
}
