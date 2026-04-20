'use client';

import { ImageZoom } from 'fumadocs-ui/components/image-zoom';
import type { ComponentProps } from 'react';

import { cn } from '@/lib/cn';

type CaptionImageProps = ComponentProps<'img'>;

export function CaptionImage({ alt, title, className, ...props }: CaptionImageProps) {
  const caption = title ?? alt;

  return (
    <span className="my-4 block text-center">
      <ImageZoom
        {...(props as any)}
        alt={alt}
        title={title}
        className={cn('max-w-full rounded-xl border bg-fd-background', className)}
      />
      {caption ? (
        <span className="mt-2 block max-w-2xl text-sm leading-tight text-fd-muted-foreground">
          {caption}
        </span>
      ) : null}
    </span>
  );
}
