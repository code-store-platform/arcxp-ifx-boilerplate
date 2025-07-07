import { execute as destroyCmd } from "./destroy";
import { execute as initCmd } from "./init";
import { execute as promoteCmd } from "./promote";

export const commands = {
	destroy: destroyCmd,
	promote: promoteCmd,
	init: initCmd,
};
