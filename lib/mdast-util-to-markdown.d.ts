import 'mdast-util-to-markdown';
declare module 'mdast-util-to-markdown' {
	interface ConstructNameMap {
		heading: 'heading';
		delete: 'delete';
		code: 'code';
		text: 'text';
	}
}
