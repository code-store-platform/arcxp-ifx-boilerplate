#!/usr/bin/env tsx
import { spawnSync } from "node:child_process";
import { program } from "commander";

type CommandDef = {
	name: string;
	description: string;
	type: "workspace" | "global";
};

// define all commands in one place
const commands: CommandDef[] = [
	// Workspace commands
	{ name: "dev", description: "Run development mode", type: "workspace" },
	{ name: "build", description: "Build integration", type: "workspace" },
	{ name: "logs", description: "Show logs", type: "workspace" },
	{ name: "deploy", description: "Deploy integration", type: "workspace" },
	{ name: "provision", description: "Provision resources", type: "workspace" },
	{ name: "status", description: "Show status", type: "workspace" },

	// Global commands, without --integration=<name> option
	{ name: "init", description: "Initialize project", type: "global" },
	{ name: "destroy", description: "Destroy project", type: "global" },
	{ name: "promote", description: "Promote deployment", type: "global" },
];

function runWorkspace(cmd: string, integration?: string, env?: string) {
	const filter = integration ? `--filter=@ifx/${integration}` : "";
	return exec("turbo", ["run", "ifx", filter, `--env=${env}`, "--", cmd].filter(Boolean));
}

function runGlobal(cmd: string, env?: string) {
	return exec("pnpm", ["exec", "tsx", "./packages/commands/src/global-commands/index.ts", cmd, `--env=${env}`]);
}

function exec(cmd: string, args: string[] = []) {
	const result = spawnSync(cmd, args, { stdio: "inherit", shell: true });
	process.exit(result.status ?? 1);
}

program.name("ifx").description("IFX CLI").version("0.1.0");

// register commands dynamically
for (const c of commands) {
	if (c.type === "workspace") {
		program
			.command(c.name)
			.description(c.description)
			.option("--integration <name>", "Target integration workspace")
			.option("--env <name>", "Target ArcXP environment", "sandbox")
			.action((opts) => runWorkspace(c.name, opts.integration, opts.env));
	} else if (c.type === "global") {
		program
			.command(c.name)
			.description(c.description)
			.option("--env <name>", "Target ArcXP environment", "sandbox")
			.action((opts) => runGlobal(c.name, opts.env));
	} else {
		throw new Error(`Unknown command type ${c.type}`);
	}
}

program.parse(process.argv);
