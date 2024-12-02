import path from "node:path";

const cwd = process.cwd();
const definition = path.join(cwd, "ifx-definition.yaml");
const root = path.resolve(__dirname, "../../../");
const tmp = path.join(root, "tmp");

export const paths = {
	root,
	tmp,
	cwd,
	definition,
};
