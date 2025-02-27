import gfm from 'remark-gfm';
import parse from 'remark-parse';
import removeComments from 'remark-remove-comments';
import stringify from 'remark-stringify';
import stringWidth from 'string-width';
import {unified} from 'unified';

import {collectDefinitions, removeDefinitions} from './definitions.js';
import createTelegramifyOptions from './telegramify.js';
import {UnsupportedTagsStrategy} from './types.js';

export default (markdown: string, unsupportedTagsStrategy?: UnsupportedTagsStrategy) => {
	const definitions = {};

	const telegramifyOptions = createTelegramifyOptions(definitions, unsupportedTagsStrategy);

	return unified()
		.use(parse)
		.use(gfm, {stringLength: stringWidth})
		.use(removeComments)
		.use(collectDefinitions, definitions)
		.use(removeDefinitions)
		.use(stringify, telegramifyOptions)
		.processSync(markdown)
		.toString()
		.replaceAll(/<!---->\n/g, '');
};
