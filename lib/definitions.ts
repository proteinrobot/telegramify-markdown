import type {Plugin, Transformer} from 'unified';
import {remove} from 'unist-util-remove';
import {visit} from 'unist-util-visit';

import type {Root} from 'mdast';
import type {Definitions} from './types.js';

/**
 * Fills the provided record with `Definition`s contained in the mdast.
 * They are keyed by identifier for subsequent `Reference` lookups.
 *
 * @param {Definitions} definitions
 */
export const collectDefinitions: Plugin<[Definitions], Root, Root> =
	(definitions: Definitions): Transformer<Root, Root> =>
	tree => {
		visit(tree, 'definition', node => {
			definitions[node.identifier] = {
				title: node.title,
				url: node.url,
			};
		});
	};

/**
 * Removes `Definition`s and their parent `Paragraph`s from the mdast.
 * This avoids unwanted negative space in stringified output.
 */
export const removeDefinitions: Plugin<[], Root, Root> = () => tree => {
	remove(tree, {cascade: true}, 'definition');
};
