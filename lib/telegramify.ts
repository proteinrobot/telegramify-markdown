import {gfmTableToMarkdown, ToMarkdownExtension} from 'mdast-util-gfm-table/lib/index.js';
import {handle as defaultHandlers} from 'mdast-util-to-markdown/lib/handle/index.js';
import {containerPhrasing as phrasing} from 'mdast-util-to-markdown/lib/util/container-phrasing.js';
import type {Options as RemarkStringifyOptions} from 'remark-stringify';

import type {Handle, Handlers} from 'mdast-util-to-markdown';
import stringWidth from 'string-width';
import {escapeSymbols, isURL, processUnsupportedTags, wrap} from './utils.js';

import type {Definitions, UnsupportedTagsStrategy} from './types.js';

const {
	handlers: {table: gfmTableHandler},
} = gfmTableToMarkdown({stringLength: stringWidth}) as ToMarkdownExtension & {handlers: {table: Handle}};

/**
 * Creates custom `mdast-util-to-markdown` handlers that tailor the output for
 * Telegram Markdown.
 *
 * @param {Readonly<Record<string, { title: null | string, url: string }>>} definitions
 * Record of `Definition`s in the Markdown document, keyed by identifier.
 *
 * @returns {import('mdast-util-to-markdown').Handlers}
 */
const createHandlers = (
	definitions: Definitions,
	unsupportedTagsStrategy?: UnsupportedTagsStrategy,
): Partial<Handlers> => ({
	heading: (node, _parent, context, info) => {
		// make headers to be just *strong*
		const marker = '*';
		const tracker = context.createTracker(info);

		const exit = context.enter('heading');
		const value = phrasing(node, context, {...tracker.current(), before: marker, after: marker});
		exit();

		return wrap(value, marker);
	},

	strong: (node, _parent, context, info) => {
		const marker = '*';
		const tracker = context.createTracker(info);

		const exit = context.enter('strong');
		const value = phrasing(node, context, {...tracker.current(), before: marker, after: marker});
		exit();

		return wrap(value, marker);
	},

	delete(node, _parent, context, info) {
		const marker = '~';
		const tracker = context.createTracker(info);

		const exit = context.enter('delete');
		const value = phrasing(node, context, {...tracker.current(), before: marker, after: marker});
		exit();

		return wrap(value, marker);
	},

	emphasis: (node, _parent, context, info) => {
		const marker = '_';
		const tracker = context.createTracker(info);

		const exit = context.enter('emphasis');
		const value = phrasing(node, context, {...tracker.current(), before: marker, after: marker});
		exit();

		return wrap(value, marker);
	},

	list: (...args) => defaultHandlers.list(...args).replace(/^(\d+)./gm, '$1\\.'),

	listItem: (...args) => defaultHandlers.listItem(...args).replace(/^\*/, '•'),

	code(node, _parent, context) {
		const exit = context.enter('code');
		// delete language prefix for deprecated markdown formatters (old Bitbucket Editor)
		const content = node.value.replace(/^#![a-z]+\n/, ''); // ```\n#!javascript\ncode block\n```
		exit();

		return wrap(escapeSymbols(content, 'code'), '```', '\n');
	},

	link: (node, _parent, context, info) => {
		const tracker = context.createTracker(info);
		const exit = context.enter('link');
		const text =
			phrasing(node, context, {...tracker.current(), before: '|', after: '>'}) || escapeSymbols(node.title);
		const url = encodeURI(node.url);
		exit();

		if (!isURL(url)) return escapeSymbols(text) || escapeSymbols(url);

		return text
			? `[${text}](${escapeSymbols(url, 'link')})`
			: `[${escapeSymbols(url)}](${escapeSymbols(url, 'link')})`;
	},

	linkReference: (node, _parent, context, info) => {
		const tracker = context.createTracker(info);
		const exit = context.enter('linkReference');
		const definition = definitions[node.identifier];
		const text =
			phrasing(node, context, {...tracker.current(), before: '|', after: '>'}) ||
			(definition ? definition.title : null);
		exit();

		if (!definition || !isURL(definition.url)) return escapeSymbols(text);

		return text
			? `[${text}](${escapeSymbols(definition.url, 'link')})`
			: `[${escapeSymbols(definition.url)}](${escapeSymbols(definition.url, 'link')})`;
	},

	image: (node, _parent, context) => {
		const exit = context.enter('image');
		const text = node.alt || node.title;
		const url = encodeURI(node.url);
		exit();

		if (!isURL(url)) return escapeSymbols(text) || escapeSymbols(url);

		return text
			? `[${escapeSymbols(text)}](${escapeSymbols(url, 'link')})`
			: `[${escapeSymbols(url)}](${escapeSymbols(url, 'link')})`;
	},

	imageReference: (node, _parent, context) => {
		const exit = context.enter('imageReference');
		const definition = definitions[node.identifier];
		const text = node.alt || (definition ? definition.title : null);
		exit();

		if (!definition || !isURL(definition.url)) return escapeSymbols(text);

		return text
			? `[${escapeSymbols(text)}](${escapeSymbols(definition.url, 'link')})`
			: `[${escapeSymbols(definition.url)}](${escapeSymbols(definition.url, 'link')})`;
	},

	text: (node, _parent, context) => {
		const exit = context.enter('text');
		const text = node.value;
		exit();

		return escapeSymbols(text, ['tableCell', 'code'].includes(_parent?.type || '') ? 'code' : 'text');
	},

	blockquote: (...args) => processUnsupportedTags(defaultHandlers.blockquote(...args), unsupportedTagsStrategy),
	html: node => processUnsupportedTags(defaultHandlers.html(node), unsupportedTagsStrategy),
	table: (...args) => wrap(escapeSymbols(gfmTableHandler(...args), 'code'), '```', '\n'),
});

/**
 * Creates options to be passed into a `remark-stringify` processor that tailor
 * the output for Telegram Markdown.
 *
 * @param {Readonly<Record<string, { title: null | string, url: string }>>} definitions
 * Record of `Definition`s in the Markdown document, keyed by identifier.
 *
 * @returns {import('remark-stringify').RemarkStringifyOptions}
 */
export default (
	definitions: Definitions,
	unsupportedTagsStrategy?: UnsupportedTagsStrategy,
): RemarkStringifyOptions => ({
	bullet: '*',
	tightDefinitions: true,
	handlers: createHandlers(definitions, unsupportedTagsStrategy),
});
