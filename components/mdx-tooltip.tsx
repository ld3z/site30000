'use client';

import { Info } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';

import { cn } from '@/lib/cn';

interface TooltipProps extends Omit<ComponentProps<'span'>, 'content'> {
  content: ReactNode;
  children: ReactNode;
}

export function Tooltip({ content, children, className, ...props }: TooltipProps) {
  return (
    <span className={cn('inline-flex items-center gap-1 align-middle', className)} {...props}>
      <span>{children}</span>
      <span
        tabIndex={0}
        role="button"
        aria-label={typeof content === 'string' ? content : 'Tooltip'}
        title={typeof content === 'string' ? content : undefined}
        className="group relative inline-flex size-[1.2em] shrink-0 items-center justify-center rounded-full border border-fd-muted-foreground/25 bg-fd-muted align-[0.08em] text-[0.95em] leading-none text-fd-muted-foreground transition-colors hover:bg-fd-primary hover:text-fd-primary-foreground focus-visible:bg-fd-primary focus-visible:text-fd-primary-foreground"
      >
        <Info className="size-[0.85em]" aria-hidden="true" />
        <span className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 hidden max-w-xs -translate-x-1/2 whitespace-normal rounded-md border bg-fd-popover px-2 py-1 text-left text-xs leading-relaxed text-fd-popover-foreground shadow-md group-hover:block group-focus-visible:block">
          {content}
        </span>
      </span>
    </span>
  );
}
