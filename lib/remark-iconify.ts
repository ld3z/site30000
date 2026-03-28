import type { Root, Text, PhrasingContent } from 'mdast';
import type { Plugin } from 'unified';
import { visit } from 'unist-util-visit';

/**
 * Remark plugin that transforms :prefix-name: syntax into Iconify icon spans.
 *
 * Example: `:mdi-home:` → `<span class="icon-[mdi--home]" role="img" aria-label="mdi home"></span>`
 *
 * The first hyphen separates the icon set prefix from the icon name.
 * Multi-part names use hyphens: `:twemoji-glowing-star:` → `icon-[twemoji--glowing-star]`
 */
const remarkIconify: Plugin<[], Root> = () => {
    const iconPattern = /:([a-z0-9]+(?:-[a-z0-9]+)+):/g;

    return (tree: Root) => {
        visit(tree, 'text', (node: Text, index, parent) => {
            if (!parent || index === undefined) return;

            const value = node.value;
            const matches = [...value.matchAll(iconPattern)];
            if (matches.length === 0) return;

            const children: PhrasingContent[] = [];
            let lastIndex = 0;

            for (const match of matches) {
                const fullMatch = match[0];
                const iconName = match[1];
                const matchStart = match.index!;

                // Add text before the icon
                if (matchStart > lastIndex) {
                    children.push({ type: 'text', value: value.slice(lastIndex, matchStart) });
                }

                // Split prefix from name at the first hyphen
                const hyphenIdx = iconName.indexOf('-');
                const prefix = iconName.slice(0, hyphenIdx);
                const name = iconName.slice(hyphenIdx + 1);
                const className = `icon-[${prefix}--${name}]`;

                // Create the icon element as an MDX JSX inline element
                children.push({
                    type: 'mdxJsxTextElement',
                    name: 'span',
                    attributes: [
                        { type: 'mdxJsxAttribute', name: 'className', value: className },
                        { type: 'mdxJsxAttribute', name: 'role', value: 'img' },
                        { type: 'mdxJsxAttribute', name: 'aria-label', value: `${prefix} ${name.replace(/-/g, ' ')}` },
                    ],
                    children: [],
                } as any);

                lastIndex = matchStart + fullMatch.length;
            }

            // Add remaining text after last match
            if (lastIndex < value.length) {
                children.push({ type: 'text', value: value.slice(lastIndex) });
            }

            // Replace the text node with our new children
            parent.children.splice(index, 1, ...children);
        });
    };
};

export default remarkIconify;
