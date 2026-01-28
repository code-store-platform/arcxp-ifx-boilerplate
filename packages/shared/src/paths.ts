import fs from "node:fs";
import path from "node:path";

const cwd = process.cwd();
const definition = path.join(cwd, "ifx-definition.yaml");
const root = path.resolve(__dirname, "../../../");
const tmp = path.join(root, ".ifx-boiler-tmp");
const is_project_root = fs.existsSync(path.join(cwd, "integrations"));

if (!fs.existsSync(tmp) && is_project_root) {
	fs.mkdirSync(tmp);
}

export const paths = {
	root,
	tmp,
	cwd,
	definition,
};
