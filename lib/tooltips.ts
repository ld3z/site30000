export const tooltips = {
  api: 'Application Programming Interface. A set of rules that lets one app talk to another.',
  mdx: 'MDX is a mix of **Markdown** and JSX, so you can write content and embed components.',
  fumadocs: 'A documentation framework for Next.js with a strong focus on content-driven sites.',
} as const;

export type TooltipId = keyof typeof tooltips;
