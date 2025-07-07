import { IFXCommand } from "./base.cmd";

export class LogsCommand extends IFXCommand {
	async execute() {
		await this.ifx.logs();
	}
}
