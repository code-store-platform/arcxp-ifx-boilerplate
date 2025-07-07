import { execute as deleteCmd } from "./delete";
import { execute as promoteCmd } from "./promote";

export const commands = {
	delete: deleteCmd,
	promote: promoteCmd,
};
