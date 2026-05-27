import Link from "next/link";

export default function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-brand-light bg-white">
      <div className="mx-auto max-w-5xl px-5 py-10 md:py-12">
        <div className="flex flex-col items-center gap-6 text-center md:flex-row md:justify-between md:text-left">
          <div>
            <p className="font-serif text-base font-bold text-brand-deep">
              My Stage　神谷京花
            </p>
            <p className="mt-1 text-xs text-ink-soft">
              思考の学校 認定講師
            </p>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm">
            <Link
              href="/lecturer/kamiya-kyoka"
              className="text-ink-soft transition hover:text-brand-deep"
            >
              講師紹介
            </Link>
            <Link
              href="/contact"
              className="text-ink-soft transition hover:text-brand-deep"
            >
              お問い合わせ
            </Link>
            <Link
              href="/privacy"
              className="text-ink-soft transition hover:text-brand-deep"
            >
              プライバシーポリシー
            </Link>
            <Link
              href="/legal"
              className="text-ink-soft transition hover:text-brand-deep"
            >
              特定商取引法に基づく表記
            </Link>
          </nav>
        </div>

        <p className="mt-8 text-center text-xs text-ink-soft">
          © {year} My Stage　神谷京花. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
