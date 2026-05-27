import Link from "next/link";
import {
  HydrangeaCluster,
  Leaf,
  Droplet,
  SoftBlob,
} from "@/components/decor";
import SiteFooter from "@/components/SiteFooter";
import ContactForm from "./ContactForm";

export const metadata = {
  title: "お問い合わせ｜思考の学校 神谷京花",
  description: "講座に関するご質問・ご相談はこちらからお気軽にお問い合わせください。",
};

export default function ContactPage() {
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
            href="/lecturer/kamiya-kyoka"
            className="mb-8 inline-flex items-center gap-1 text-sm text-ink-soft transition hover:text-brand-deep"
          >
            <span aria-hidden>←</span>
            講師ページに戻る
          </Link>

          <header className="mb-8 text-center">
            <p className="mb-2 text-xs font-bold tracking-[0.3em] text-brand-deep">
              CONTACT
            </p>
            <h1 className="font-serif text-2xl font-bold leading-snug text-brand-deep md:text-3xl">
              お問い合わせ
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-ink md:text-base">
              講座に関するご質問・ご相談など、お気軽にお問い合わせください。
              <br className="hidden md:block" />
              2〜3営業日以内にご返信いたします。
            </p>
            <div className="mx-auto mt-4 flex items-center justify-center gap-1.5">
              <span className="h-0.5 w-8 rounded-full bg-brand" />
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              <span className="h-0.5 w-8 rounded-full bg-brand" />
            </div>
          </header>

          <ContactForm />

          <p className="mt-8 text-center text-xs leading-relaxed text-ink-soft">
            お申し込みをご希望の方は、
            <Link
              href="/lecturer/kamiya-kyoka"
              className="text-brand-deep underline underline-offset-2"
            >
              講座一覧
            </Link>
            から各講座ページの「お申し込み」ボタンをご利用ください。
          </p>
        </div>
      </div>

      <SiteFooter />
    </main>
  );
}
