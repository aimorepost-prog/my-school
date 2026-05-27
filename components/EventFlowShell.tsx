import Link from "next/link";
import {
  HydrangeaCluster,
  Leaf,
  Droplet,
  SoftBlob,
} from "@/components/decor";

interface Props {
  eventSlug: string;
  backHref?: string;
  backLabel?: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  eventTitle?: string;
  children: React.ReactNode;
}

export default function EventFlowShell({
  eventSlug,
  backHref,
  backLabel = "講座ページに戻る",
  eyebrow,
  title,
  subtitle,
  eventTitle,
  children,
}: Props) {
  return (
    <main className="min-h-screen overflow-x-hidden bg-brand-bg text-ink">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-hero-fade" />
        <SoftBlob
          color="#D6EBF5"
          className="pointer-events-none absolute -left-24 -top-24 h-[420px] w-[420px]"
        />
        <SoftBlob
          color="#FCD7CE"
          className="pointer-events-none absolute -bottom-32 -right-20 h-[360px] w-[360px]"
        />
        <HydrangeaCluster className="pointer-events-none absolute -left-2 top-8 h-24 w-24 rotate-12 opacity-80 md:h-32 md:w-32" />
        <HydrangeaCluster className="pointer-events-none absolute right-4 top-16 h-20 w-20 -rotate-6 opacity-70 md:h-28 md:w-28" />
        <Leaf className="pointer-events-none absolute right-0 bottom-24 h-28 w-16 rotate-12 opacity-70" />
        <Droplet className="pointer-events-none absolute left-1/4 top-1/3 h-5 w-5 opacity-70" />

        <div className="relative mx-auto max-w-2xl px-5 py-10 md:py-14">
          <Link
            href={backHref ?? `/${eventSlug}`}
            className="mb-8 inline-flex items-center gap-1 text-sm text-ink-soft transition hover:text-brand-deep"
          >
            <span aria-hidden>←</span>
            {backLabel}
          </Link>

          <header className="mb-8 text-center">
            {eyebrow && (
              <p className="mb-2 text-xs font-bold tracking-[0.25em] text-brand-deep">
                {eyebrow}
              </p>
            )}
            <h1 className="font-serif text-2xl font-bold leading-snug text-brand-deep md:text-3xl">
              {title}
            </h1>
            {eventTitle && (
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                {eventTitle}
              </p>
            )}
            {subtitle && (
              <p className="mt-2 text-sm leading-relaxed text-ink-mute">
                {subtitle}
              </p>
            )}
            <div className="mx-auto mt-4 flex items-center justify-center gap-1.5">
              <span className="h-0.5 w-8 rounded-full bg-brand" />
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              <span className="h-0.5 w-8 rounded-full bg-brand" />
            </div>
          </header>

          {children}
        </div>
      </div>
    </main>
  );
}
