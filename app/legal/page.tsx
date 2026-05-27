import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";

export const metadata = {
  title: "特定商取引法に基づく表記｜My Stage 神谷京花",
};

interface Row {
  label: string;
  value: React.ReactNode;
}

const rows: Row[] = [
  {
    label: "販売事業者名（屋号）",
    value: "My Stage　神谷京花",
  },
  {
    label: "事業責任者",
    value: "神谷 京花",
  },
  {
    label: "所在地",
    value: (
      <span className="text-ink-soft">
        ※請求があった場合は遅滞なく開示いたします。
        <br />
        下記お問い合わせ窓口までご連絡ください。
      </span>
    ),
  },
  {
    label: "電話番号",
    value: (
      <span className="text-ink-soft">
        ※請求があった場合は遅滞なく開示いたします。
        <br />
        下記お問い合わせ窓口までご連絡ください。
      </span>
    ),
  },
  {
    label: "メールアドレス",
    value: (
      <Link href="/contact" className="text-brand-deep underline underline-offset-2">
        お問い合わせフォーム
      </Link>
    ),
  },
  {
    label: "販売価格",
    value: "各講座ページに記載の金額（税込）",
  },
  {
    label: "商品代金以外の必要料金",
    value: (
      <>
        通信料金はお客様のご負担となります。
        <br />
        銀行振込の場合の振込手数料はお客様のご負担となります。
      </>
    ),
  },
  {
    label: "お支払い方法",
    value: (
      <>
        クレジットカード決済（Stripe 経由）／ 銀行振込
      </>
    ),
  },
  {
    label: "代金の支払い時期",
    value: (
      <>
        クレジットカード決済：お申し込み時に即時決済
        <br />
        銀行振込：お申し込み後、2日以内にお振り込みください。
      </>
    ),
  },
  {
    label: "商品の引渡時期",
    value: (
      <>
        本講座は役務（オンライン講座）の提供です。
        <br />
        お申し込み完了後、当日までにメールにてZoomリンク等の参加情報をお送りいたします。
      </>
    ),
  },
  {
    label: "返金・返品に関わる条件（キャンセルポリシー）",
    value: (
      <>
        受講料ご入金後のキャンセルは、開催日の2営業日前までにご連絡ください。10%の手数料を差し引いて返金させていただきます。
        <br />
        それ以降のキャンセルにつきましては、受講料の全額をキャンセル料として申し受けます。
        <br />
        <br />
        受講生さんのご都合による途中退出での返金は一切お受けできませんので予めご了承ください。
      </>
    ),
  },
  {
    label: "動作環境",
    value: (
      <>
        本講座はオンライン会議ツール（Zoom 等）を使用します。
        <br />
        インターネット接続環境、カメラ・マイクをご用意ください。
      </>
    ),
  },
];

export default function LegalPage() {
  return (
    <main className="min-h-screen bg-brand-bg px-5 py-12 text-ink md:py-16">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/lecturer/kamiya-kyoka"
          className="mb-6 inline-flex items-center gap-1 text-sm text-ink-soft transition hover:text-brand-deep"
        >
          <span aria-hidden>←</span> 講師ページに戻る
        </Link>

        <header className="mb-10 text-center">
          <p className="mb-2 text-xs font-bold tracking-[0.3em] text-brand-deep">
            SPECIFIED COMMERCIAL TRANSACTION LAW
          </p>
          <h1 className="font-serif text-2xl font-bold text-brand-deep md:text-3xl">
            特定商取引法に基づく表記
          </h1>
          <div className="mx-auto mt-4 flex items-center justify-center gap-1.5">
            <span className="h-0.5 w-8 rounded-full bg-brand" />
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            <span className="h-0.5 w-8 rounded-full bg-brand" />
          </div>
        </header>

        <div className="overflow-hidden rounded-3xl bg-white shadow-card">
          <dl className="divide-y divide-brand-light/60">
            {rows.map((row) => (
              <div
                key={row.label}
                className="grid grid-cols-1 gap-3 px-5 py-5 md:grid-cols-[200px,1fr] md:gap-6 md:px-8 md:py-6"
              >
                <dt className="text-sm font-bold text-ink md:text-base">
                  {row.label}
                </dt>
                <dd className="text-sm leading-relaxed text-ink md:text-base">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <p className="mt-8 text-center text-xs text-ink-soft">
          本表記の内容に関するお問い合わせは
          <Link href="/contact" className="text-brand-deep underline underline-offset-2">
            お問い合わせフォーム
          </Link>
          までご連絡ください。
        </p>
      </div>

      <SiteFooter />
    </main>
  );
}
