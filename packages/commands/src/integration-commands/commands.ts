import type { IFXCommand } from "./base.cmd";
import { BuildCommand } from "./build.cmd";
import { DeployCommand } from "./deploy.cmd";
import { DevCommand } from "./dev.cmd";
import { LogsCommand } from "./logs.cmd";
import { ProvisionCommand } from "./provision.cmd";
import { StatusCommand } from "./status.cmd";

export const commands: Record<string, typeof IFXCommand> = {
	deploy: DeployCommand,
	build: BuildCommand,
	provision: ProvisionCommand,
	logs: LogsCommand,
	dev: DevCommand,
	status: StatusCommand,
};
