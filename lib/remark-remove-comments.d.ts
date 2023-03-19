declare module 'remark-remove-comments' {
	import type {Transformer} from 'unified';
	export const transformer: Transformer;
	export default function attacher(): Transformer;
}
