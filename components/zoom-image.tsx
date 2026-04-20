'use client';

import { ImageZoom as FumadocsImageZoom } from 'fumadocs-ui/components/image-zoom';
import type { ComponentProps } from 'react';

export function ZoomImage(props: ComponentProps<'img'>) {
  return <FumadocsImageZoom {...(props as any)} />;
}
