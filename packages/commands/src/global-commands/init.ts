import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import {
	DEFAULT_IFX_EMAIL,
	type IFXIntegrationDefinition,
	IFX_EVENTS_GROUPED,
	arc,
	logger,
	parseYaml,
	paths,
	stringifyYaml,
} from "@ifx/shared";
import inquirer from "inquirer";

export async function execute() {
	const helloIntegrationExists = fs.existsSync(path.join(paths.root, "./integrations/hello"));
	if (!helloIntegrationExists) {
		logger.warn("Hello integration dosn't exist");
		return;
	}
	const allIntegrations = await arc.IFX.getIntegrations();

	const { integrationName } = await inquirer.prompt([
		{
			name: "integrationName",
			type: "input",
			message: "Enter integration name to create: ",
			validate: (input) => {
				if (!input) {
					return "Integration name is required";
				}
				if (input.trim().length < 3) {
					return "Integration name is too short";
				}
				if (fs.existsSync(path.join(paths.root, `./integrations/${input}`))) {
					return "Integration already exists in the integrations folder";
				}
				if (allIntegrations.find((integration) => integration.IntegrationName === input)) {
					return "Integration already created in ArcXP";
				}

				return true;
			},
		},
	]);

	const { description } = await inquirer.prompt([
		{
			name: "description",
			type: "input",
			message: "Enter integration description: ",
			default: "Integration created by CLI",
		},
	]);

	const { ownerEmail } = await inquirer.prompt([
		{
			name: "ownerEmail",
			type: "input",
			message: "Enter owner email: ",
			default: DEFAULT_IFX_EMAIL,
		},
	]);

	// select events to subscribe to
	const entitiesChoices = Object.keys(IFX_EVENTS_GROUPED);
	const { entities } = await inquirer.prompt([
		{
			type: "checkbox",
			name: "entities",
			message: "Which entities do you want to configure subscriptions for?",
			choices: entitiesChoices,
			theme: {
				helpMode: "always",
			},
			validate(choices) {
				if (!choices.length) {
					return "You must select at least one entity";
				}
				return true;
			},
		},
	]);
	const subscriptions: Record<string, string[]> = {};

	for (const entity of entities) {
		const { events } = await inquirer.prompt([
			{
				type: "checkbox",
				name: "events",
				message: `Which events for "${entity}"?`,
				choices: IFX_EVENTS_GROUPED[entity],
				theme: {
					helpMode: "always",
				},
				validate(choices) {
					if (!choices.length) {
						return "You must select at least one event";
					}
					return true;
				},
			},
		]);

		subscriptions[entity] = events;
	}

	const allEvents = Object.values(subscriptions).flat();
	if (!allEvents.length) {
		logger.warn("No events selected");
		return;
	}

	const { enabled } = await inquirer.prompt([
		{
			type: "confirm",
			name: "enabled",
			message: "✅ Enable integration?",
			default: true,
		},
	]);

	console.log("📄 Subscription Configuration:\n");
	console.log(`Name: ${integrationName}`);
	console.log(`Description: ${description}`);
	console.log(`Email: ${ownerEmail}`);
	console.log(`Status: ${enabled ? "Enabled 🟢" : "Disabled 🔴"}`);
	console.log("Events:");

	for (const [entity, events] of Object.entries(subscriptions)) {
		console.log(`${entity}:`);
		for (const event of events) {
			console.log(`  - ${event}`);
		}
	}

	const { confirm } = await inquirer.prompt([
		{
			type: "confirm",
			name: "confirm",
			message: "\n✅ Proceed?",
			default: true,
		},
	]);

	if (!confirm) {
		return;
	}

	logger.info("💾 Saving integration files");

	const integrationDir = path.join(paths.root, `./integrations/${integrationName}`);

	fs.mkdirSync(integrationDir);
	fs.cpSync(path.join(paths.root, "./integrations/hello"), integrationDir, {
		recursive: true,
	});

	// replace package.json name
	const packageJsonPath = path.join(paths.root, `./integrations/${integrationName}/package.json`);
	const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
	packageJson.name = `@ifx/${integrationName}`;
	fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

	// replace ifx-definition.yml
	const ifxDefinitionPath = path.join(integrationDir, "./ifx-definition.yaml");
	const ifxDefinition = parseYaml(fs.readFileSync(ifxDefinitionPath, "utf-8")) as IFXIntegrationDefinition;
	ifxDefinition.integrationName = integrationName;
	ifxDefinition.email = ownerEmail;
	ifxDefinition.events = allEvents;
	ifxDefinition.description = description;
	fs.writeFileSync(ifxDefinitionPath, stringifyYaml(ifxDefinition));

	logger.info("✅ Integration files are ready!");
	logger.info("⏳ Provisioning...");

	setImmediate(() => {
		execSync("pnpm install", {
			cwd: integrationDir,
			stdio: "inherit",
		});

		execSync("pnpm run ifx provision", {
			cwd: integrationDir,
			stdio: "inherit",
		});

		logger.info("✨ Provisioning done!");
	});
}
