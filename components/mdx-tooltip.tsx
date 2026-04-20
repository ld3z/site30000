'use client';

import { createMarkdownRenderer } from 'fumadocs-core/content/md';
import { ExternalLink, Info } from 'lucide-react';
import { createPortal } from 'react-dom';
import type { ComponentProps, ReactNode } from 'react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import { cn } from '@/lib/cn';
import { tooltips, type TooltipId } from '@/lib/tooltips';

const mdx = createMarkdownRenderer();
const OFFSET = 8;
const VIEWPORT_GUTTER = 8;

type Placement = 'top' | 'bottom';

interface TooltipProps extends Omit<ComponentProps<'span'>, 'content'> {
  id: TooltipId;
  content?: ReactNode;
  children: ReactNode;
}

export function Tooltip({ id, content, children, className, ...props }: TooltipProps) {
  const tooltip = content ?? tooltips[id];
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState<Placement>('top');
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const rootRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!rootRef.current?.contains(target) && !tooltipRef.current?.contains(target)) {
        setOpen(false);
      }
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

  useLayoutEffect(() => {
    if (!open) return;

    const update = () => {
      const root = rootRef.current;
      const tooltipEl = tooltipRef.current;
      if (!root || !tooltipEl) return;

      const rootRect = root.getBoundingClientRect();
      const tooltipRect = tooltipEl.getBoundingClientRect();
      const spaceAbove = rootRect.top - VIEWPORT_GUTTER;
      const spaceBelow = window.innerHeight - rootRect.bottom - VIEWPORT_GUTTER;
      const nextPlacement: Placement =
        spaceAbove >= tooltipRect.height + OFFSET || spaceAbove >= spaceBelow ? 'top' : 'bottom';

      const idealTop = nextPlacement === 'top' ? rootRect.top - OFFSET : rootRect.bottom + OFFSET;
      const clampedTop =
        nextPlacement === 'top'
          ? Math.min(Math.max(idealTop, tooltipRect.height + VIEWPORT_GUTTER), window.innerHeight - VIEWPORT_GUTTER)
          : Math.min(
              Math.max(idealTop, VIEWPORT_GUTTER),
              window.innerHeight - tooltipRect.height - VIEWPORT_GUTTER,
            );

      const idealLeft = rootRect.left + rootRect.width / 2;
      const halfWidth = tooltipRect.width / 2;
      const clampedLeft = Math.min(
        Math.max(idealLeft, VIEWPORT_GUTTER + halfWidth),
        window.innerWidth - VIEWPORT_GUTTER - halfWidth,
      );

      setPlacement(nextPlacement);
      setCoords({ top: clampedTop, left: clampedLeft });
    };

    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);

    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [open]);

  return (
    <span ref={rootRef} className={cn('relative inline-flex items-center align-middle', className)} {...props}>
      <span>{children}</span>
      <button
        type="button"
        aria-label={typeof tooltip === 'string' ? tooltip : 'Tooltip'}
        aria-expanded={open}
        aria-controls={`tooltip-${id}`}
        onClick={() => setOpen((value) => !value)}
        className="relative ml-0.5 inline-flex size-[1.2em] shrink-0 translate-y-[0.08em] items-center justify-center rounded-full border border-fd-muted-foreground/25 bg-fd-muted text-[0.95em] leading-none text-fd-muted-foreground transition-colors hover:bg-fd-primary hover:text-fd-primary-foreground focus-visible:bg-fd-primary focus-visible:text-fd-primary-foreground"
      >
        <Info className="size-[0.85em]" aria-hidden="true" />
      </button>
      {open && typeof document !== 'undefined'
        ? createPortal(
            <span
              id={`tooltip-${id}`}
              ref={tooltipRef}
              role="tooltip"
              className="pointer-events-auto z-50 w-max max-w-[min(20rem,calc(100vw-1rem))] whitespace-normal rounded-md border bg-fd-popover px-2 py-1 text-left text-xs leading-relaxed text-fd-popover-foreground shadow-md"
              style={{
                position: 'fixed',
                left: coords?.left ?? -9999,
                top: coords?.top ?? -9999,
                transform:
                  coords != null
                    ? placement === 'top'
                      ? 'translate(-50%, -100%)'
                      : 'translate(-50%, 0)'
                    : 'translate(-50%, -50%)',
                visibility: coords ? 'visible' : 'hidden',
              }}
            >
              {typeof tooltip === 'string' ? (
                <mdx.Markdown
                  components={{
                    p: (props) => <span {...props} />,
                    a: (props) => (
                      <a
                        {...props}
                        target="_blank"
                        rel="noreferrer noopener"
                        className={cn(
                          'inline-flex items-center gap-1 text-fd-primary underline underline-offset-2 hover:text-fd-primary hover:underline',
                          props.className,
                        )}
                      >
                        <span>{props.children}</span>
                        <ExternalLink className="size-3 shrink-0" aria-hidden="true" />
                      </a>
                    ),
                  }}
                >
                  {tooltip}
                </mdx.Markdown>
              ) : (
                tooltip
              )}
            </span>,
            document.body,
          )
        : null}
    </span>
  );
}
