const unsupportedTagsStrategies = ['escape', 'remove', 'keep'] as const;

export type UnsupportedTagsStrategy = (typeof unsupportedTagsStrategies)[number];

export type Definition = {title: null | string | undefined; url: string};

export type Definitions = Record<string, Definition>;
