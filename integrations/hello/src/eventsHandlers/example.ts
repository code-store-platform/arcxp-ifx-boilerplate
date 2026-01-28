import type { ArcTypes } from "@code.store/arcxp-sdk-ts";
import { arc, handler, logger } from "@ifx/shared";

export const example = handler<ArcTypes.ANS.AStory>(
	async (event) => {
		const storyId = event.body._id;
		if (!storyId) {
			logger.warn("No story ID found in event");
			return;
		}

		const story = await arc.Draft.getPublishedRevision(storyId);

		logger.info(`Story Display Date Is "${story.ans.display_date}"`);
	},
	{
		handlerName: "example",
	},
);
