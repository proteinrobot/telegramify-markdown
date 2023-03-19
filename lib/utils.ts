import {URL} from 'url';

export function wrap(string: string, ...wrappers: string[]) {
	return [...wrappers, string, ...wrappers.reverse()].join('');
}

export function isURL(string: string) {
	try {
		return Boolean(new URL(string));
	} catch (error) {
		return false;
	}
}

export function escapeSymbols(text: string | null | undefined, textType = 'text') {
	if (!text) {
		return '';
	}
	switch (textType) {
		case 'code':
			return text.replace(/`/g, '\\`').replace(/\\/g, '\\\\');
		case 'link':
			return text.replace(/\(/g, '\\(').replace(/\)/g, '\\)').replace(/\\/g, '\\\\');
		default:
			return text
				.replace(/_/g, '\\_')
				.replace(/\*/g, '\\*')
				.replace(/\[/g, '\\[')
				.replace(/]/g, '\\]')
				.replace(/\(/g, '\\(')
				.replace(/\)/g, '\\)')
				.replace(/~/g, '\\~')
				.replace(/`/g, '\\`')
				.replace(/>/g, '\\>')
				.replace(/#/g, '\\#')
				.replace(/\+/g, '\\+')
				.replace(/-/g, '\\-')
				.replace(/=/g, '\\=')
				.replace(/\|/g, '\\|')
				.replace(/{/g, '\\{')
				.replace(/}/g, '\\}')
				.replace(/\./g, '\\.')
				.replace(/!/g, '\\!');
	}
}

export function processUnsupportedTags(content: string, strategy?: string) {
	switch (strategy) {
		case 'escape':
			return escapeSymbols(content);
		case 'remove':
			return '';
		case 'keep':
		default:
			return content;
	}
}
