import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";

export const metadata = {
  title: "プライバシーポリシー｜My Stage 神谷京花",
};

export default function PrivacyPage() {
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
            PRIVACY POLICY
          </p>
          <h1 className="font-serif text-2xl font-bold text-brand-deep md:text-3xl">
            プライバシーポリシー
          </h1>
        </header>

        <div className="space-y-8 rounded-3xl bg-white px-6 py-10 shadow-card md:px-10 md:py-12">
          <p className="leading-relaxed">
            My Stage 神谷京花（以下「当方」といいます）は、本ウェブサイト上で提供する講座・コーチング等のサービス（以下「本サービス」）における、ユーザーの個人情報の取扱いについて、以下のとおりプライバシーポリシー（以下「本ポリシー」）を定めます。
          </p>

          <Section title="第1条 個人情報">
            「個人情報」とは、個人情報保護法にいう「個人情報」を指すものとし、生存する個人に関する情報であって、当該情報に含まれる氏名、生年月日、住所、電話番号、連絡先その他の記述等により特定の個人を識別できる情報を指します。
          </Section>

          <Section title="第2条 取得する個人情報">
            当方は、本サービスにおいて以下の個人情報を取得します。
            <ul className="mt-3 list-disc space-y-1 pl-6">
              <li>お名前</li>
              <li>メールアドレス</li>
              <li>電話番号（任意）</li>
              <li>お申込時にご記入いただく回答内容</li>
              <li>決済に関する情報（カード情報自体は Stripe 社のシステム内のみで取り扱われ、当方では保有しません）</li>
            </ul>
          </Section>

          <Section title="第3条 利用目的">
            当方は、取得した個人情報を以下の目的で利用します。
            <ul className="mt-3 list-disc space-y-1 pl-6">
              <li>本サービス（思考の学校認定講師としての講座等）の提供・運営のため</li>
              <li>お申込の確認、ご連絡、当日のご案内のため</li>
              <li>お問い合わせ・ご質問への回答のため</li>
              <li>料金請求、領収書発行のため</li>
              <li>本サービスに関する重要なお知らせ等のご案内のため</li>
              <li>利用規約に違反した利用者の特定および対応のため</li>
            </ul>
          </Section>

          <Section title="第4条 第三者提供">
            当方は、次に掲げる場合を除き、ユーザーの同意を得ることなく、個人情報を第三者に提供しません。
            <ul className="mt-3 list-disc space-y-1 pl-6">
              <li>法令に基づく場合</li>
              <li>人の生命、身体または財産の保護のために必要がある場合</li>
              <li>本サービスの提供に必要な業務委託先（決済代行・メール送信・データ管理・ホスティング等）に対し、業務遂行に必要な範囲で開示する場合</li>
            </ul>
            <p className="mt-3 text-sm text-ink-soft">
              主な業務委託先：Stripe（決済代行）、Resend（メール送信）、Supabase（データ管理）、Vercel（ホスティング）。
            </p>
          </Section>

          <Section title="第5条 個人情報の保管期間">
            取得した個人情報は、利用目的の達成に必要な期間のみ保管します。法令で定められた期間を除き、目的達成後は速やかに削除いたします。
          </Section>

          <Section title="第6条 個人情報の開示・訂正・削除">
            ユーザーから自己の個人情報の開示、訂正、利用停止または削除のご要望があった場合、本人確認のうえ、合理的な範囲ですみやかに対応します。お問い合わせは下記窓口までご連絡ください。
          </Section>

          <Section title="第7条 Cookie 等の取り扱い">
            本サービスでは、サービスの提供および利用状況の把握のために Cookie 等の技術を使用することがあります。ユーザーはブラウザの設定により Cookie の受け入れを拒否することができますが、その場合は本サービスの一部機能がご利用いただけなくなる可能性があります。
          </Section>

          <Section title="第8条 改定">
            本ポリシーの内容は、法令その他本ポリシーに別段の定めのある事項を除いて、ユーザーに通知することなく、変更することができるものとします。変更後のプライバシーポリシーは、本ウェブサイトに掲載したときから効力を生じるものとします。
          </Section>

          <Section title="第9条 お問い合わせ窓口">
            <p className="mb-3">
              本ポリシーおよび個人情報の取り扱いに関するお問い合わせは、下記までお願いいたします。
            </p>
            <div className="rounded-2xl bg-brand-pale/40 px-5 py-4 text-sm">
              <p className="mb-1 font-bold">事業者：My Stage　神谷京花</p>
              <p>
                お問い合わせ：
                <Link
                  href="/contact"
                  className="text-brand-deep underline underline-offset-2"
                >
                  お問い合わせフォーム
                </Link>
              </p>
            </div>
          </Section>

          <p className="mt-8 text-right text-sm text-ink-soft">
            制定日：2026年6月1日
          </p>
        </div>
      </div>

      <SiteFooter />
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-3 border-l-4 border-brand pl-3 font-bold text-ink">
        {title}
      </h2>
      <div className="leading-relaxed text-ink">{children}</div>
    </section>
  );
}
