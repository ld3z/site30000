'use client';

import { createMarkdownRenderer } from 'fumadocs-core/content/md';
import { Info } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/cn';
import { tooltips, type TooltipId } from '@/lib/tooltips';

const mdx = createMarkdownRenderer();

interface TooltipProps extends Omit<ComponentProps<'span'>, 'content'> {
  id: TooltipId;
  content?: ReactNode;
  children: ReactNode;
}

export function Tooltip({ id, content, children, className, ...props }: TooltipProps) {
  const tooltip = content ?? tooltips[id];
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  return (
    <span ref={rootRef} className={cn('relative inline-flex items-center gap-1 align-middle', className)} {...props}>
      <span>{children}</span>
      <button
        type="button"
        aria-label={typeof tooltip === 'string' ? tooltip : 'Tooltip'}
        aria-expanded={open}
        aria-controls={`tooltip-${id}`}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex size-[1.2em] shrink-0 items-center justify-center rounded-full border border-fd-muted-foreground/25 bg-fd-muted align-[0.08em] text-[0.95em] leading-none text-fd-muted-foreground transition-colors hover:bg-fd-primary hover:text-fd-primary-foreground focus-visible:bg-fd-primary focus-visible:text-fd-primary-foreground"
      >
        <Info className="size-[0.85em]" aria-hidden="true" />
      </button>
      {open ? (
        <span
          id={`tooltip-${id}`}
          role="tooltip"
          className="pointer-events-auto absolute bottom-full left-1/2 z-50 mb-2 w-max max-w-[min(20rem,calc(100vw-1rem))] -translate-x-1/2 whitespace-normal rounded-md border bg-fd-popover px-2 py-1 text-left text-xs leading-relaxed text-fd-popover-foreground shadow-md"
        >
          {typeof tooltip === 'string' ? (
            <mdx.Markdown
              components={{
                p: (props) => <span {...props} />,
              }}
            >
              {tooltip}
            </mdx.Markdown>
          ) : (
            tooltip
          )}
        </span>
      ) : null}
    </span>
  );
}
