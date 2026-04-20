import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';

import { CaptionImage } from '@/components/caption-image';
import { Tooltip } from '@/components/tooltip';
import { ZoomImage } from '@/components/zoom-image';
import { YouTube } from '@/components/youtube';

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    img: CaptionImage,
    CaptionImage,
    ZoomImage,
    Tooltip,
    YouTube,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
