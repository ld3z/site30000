import { cn } from '@/lib/cn';

type YouTubeProps = {
  videoId?: string;
  url?: string;
  title: string;
  start?: number;
  className?: string;
};

function getVideoId(videoId?: string, url?: string) {
  if (videoId) return videoId;
  if (!url) return null;

  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('youtu.be')) {
      return parsed.pathname.split('/').filter(Boolean)[0] ?? null;
    }

    const embedMatch = parsed.pathname.match(/\/embed\/([^/]+)/);
    if (embedMatch?.[1]) return embedMatch[1];

    return parsed.searchParams.get('v');
  } catch {
    return url;
  }
}

export function YouTube({ videoId, url, title, start, className }: YouTubeProps) {
  const id = getVideoId(videoId, url);

  if (!id) return null;

  const embedUrl = new URL(`https://www.youtube-nocookie.com/embed/${id}`);
  if (start && start > 0) embedUrl.searchParams.set('start', String(start));

  return (
    <div className={cn('my-6 overflow-hidden rounded-xl border bg-black shadow-sm', className)}>
      <div className="aspect-video w-full">
        <iframe
          className="h-full w-full"
          src={embedUrl.toString()}
          title={title}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    </div>
  );
}
