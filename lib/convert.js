import gfm from 'remark-gfm';
import parse from 'remark-parse';
import removeComments from 'remark-remove-comments';
import stringify from 'remark-stringify';
import {unified} from 'unified';

import {collectDefinitions, removeDefinitions} from './definitions';
import createTelegramifyOptions from './telegramify';

export default (markdown, unsupportedTagsStrategy) => {
	const definitions = {};

	const telegramifyOptions = createTelegramifyOptions(definitions, unsupportedTagsStrategy);

	return unified()
		.use(parse)
		.use(gfm)
		.use(removeComments)
		.use(collectDefinitions, definitions)
		.use(removeDefinitions)
		.use(stringify, telegramifyOptions)
		.processSync(markdown)
		.toString()
		.replaceAll(/<!---->\n/g, '');
};
