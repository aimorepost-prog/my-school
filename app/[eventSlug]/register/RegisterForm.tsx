"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SectionHeading from "@/components/SectionHeading";
import type { EventPriceOption } from "@/lib/event-pricing";
import {
  ENROLLMENT_REASON_OPTIONS,
  PAST_COURSE_OPTIONS,
} from "@/lib/registration";

interface Props {
  eventSlug: string;
  priceOptions?: EventPriceOption[] | null;
  sessionId?: string | null;
  sessionLabel?: string | null;
}

export default function RegisterForm({
  eventSlug,
  priceOptions,
  sessionId,
  sessionLabel,
}: Props) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [receiptName, setReceiptName] = useState("");
  const [receiptNameMode, setReceiptNameMode] = useState<"same" | "custom">(
    "same"
  );
  const [referrer, setReferrer] = useState("");
  const [enrollmentReason, setEnrollmentReason] = useState("");
  const [pastCourses, setPastCourses] = useState<string[]>([]);
  const [medicalAcknowledged, setMedicalAcknowledged] = useState(false);
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [priceTier, setPriceTier] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function togglePastCourse(option: string) {
    setPastCourses((prev) =>
      prev.includes(option)
        ? prev.filter((v) => v !== option)
        : [...prev, option]
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg(null);

    if (priceOptions?.length && !priceTier) {
      setErrorMsg("参加費の区分を選択してください");
      return;
    }
    if (!enrollmentReason) {
      setErrorMsg("受講のきっかけを選択してください");
      return;
    }
    if (pastCourses.length === 0) {
      setErrorMsg("思考の学校の講座受講歴を1つ以上選択してください");
      return;
    }
    if (!medicalAcknowledged) {
      setErrorMsg("心療内科通院・服薬に関する注意事項への同意が必要です");
      return;
    }
    if (!privacyConsent) {
      setErrorMsg("プライバシーポリシー・特定商取引法に基づく表記への同意が必要です");
      return;
    }
    if (receiptNameMode === "custom" && !receiptName.trim()) {
      setErrorMsg("領収書の宛名を入力してください");
      return;
    }

    const finalReceiptName =
      receiptNameMode === "custom" ? receiptName.trim() : name.trim();

    setSubmitting(true);

    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventSlug,
          sessionId: sessionId || null,
          name,
          email,
          phone: phone || null,
          receiptName: finalReceiptName,
          referrer: referrer || null,
          priceTier: priceTier || null,
          answers: {
            enrollment_reason: enrollmentReason,
            past_courses: pastCourses,
            medical_acknowledged: medicalAcknowledged,
          },
        }),
      });

      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: "unknown" }));
        throw new Error(error || "予約処理に失敗しました");
      }

      const { checkoutUrl } = await res.json();
      if (!checkoutUrl) {
        router.push(`/${eventSlug}/thanks`);
        return;
      }
      window.location.href = checkoutUrl;
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "エラーが発生しました"
      );
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8 rounded-2xl border border-brand-light/60 bg-white/95 p-6 shadow-card backdrop-blur md:p-8"
    >
      {sessionLabel && (
        <div className="rounded-xl border border-brand-light bg-brand-pale/40 px-4 py-3 text-sm text-ink">
          <span className="font-bold text-brand-deep">選択中の日程：</span>
          {sessionLabel}
        </div>
      )}

      {priceOptions && priceOptions.length > 0 && (
        <section>
          <SectionHeading small="Step 1" main="参加費の区分" />
          <p className="mb-4 text-xs leading-relaxed text-ink-mute">
            神谷京花の講座の受講歴に応じて、参加費が異なります。該当する区分を選択してください。
          </p>
          <div className="space-y-3">
            {priceOptions.map((option) => (
              <label
                key={option.id}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-4 transition ${
                  priceTier === option.id
                    ? "border-brand-dark bg-brand-pale/70"
                    : "border-brand-light/70 bg-white hover:border-brand hover:bg-brand-pale/40"
                }`}
              >
                <input
                  type="radio"
                  name="price_tier"
                  value={option.id}
                  checked={priceTier === option.id}
                  onChange={() => setPriceTier(option.id)}
                  className="mt-1 h-4 w-4 accent-brand-deep"
                />
                <span className="flex-1 text-sm text-ink">
                  <span className="font-semibold">{option.label}</span>
                  <span className="mt-1 block text-lg font-bold text-brand-deep">
                    ¥{option.price.toLocaleString()}
                    <span className="ml-1 text-xs font-normal text-ink-mute">
                      （税込）
                    </span>
                  </span>
                  <span className="mt-0.5 block text-xs text-ink-mute">
                    {option.description}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </section>
      )}

      <section className={priceOptions?.length ? "border-t border-brand-pale pt-8" : ""}>
        <SectionHeading
          small={priceOptions?.length ? "Step 2" : "Step 1"}
          main="基本情報"
        />
        <div className="space-y-4">
          <Field label="お名前" required>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
              placeholder="山田 太郎"
            />
          </Field>

          <Field label="メールアドレス" required>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder="example@example.com"
            />
          </Field>

          <Field label="電話番号">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={inputClass}
              placeholder="090-1234-5678"
            />
          </Field>

          <Field label="ご紹介者（複数可）">
            <input
              type="text"
              value={referrer}
              onChange={(e) => setReferrer(e.target.value)}
              className={inputClass}
              placeholder="例：田中 さくら、佐藤 花子"
            />
          </Field>
        </div>
      </section>

      <section className="border-t border-brand-pale pt-8">
        <SectionHeading
          small={priceOptions?.length ? "Step 3" : "Step 2"}
          main="領収書について"
        />
        <p className="mb-4 text-xs leading-relaxed text-ink-mute">
          入金完了後、領収書をメールで自動送付します。宛名はお一人おひとり設定できます。
        </p>

        <div className="space-y-3">
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-brand-light/70 bg-brand-pale/30 px-4 py-3 transition hover:border-brand hover:bg-brand-pale/60">
            <input
              type="radio"
              name="receipt_name_mode"
              checked={receiptNameMode === "same"}
              onChange={() => setReceiptNameMode("same")}
              className="mt-0.5 h-4 w-4 accent-brand-deep"
            />
            <span className="text-sm text-ink">
              <span className="font-semibold">申込者名と同じ</span>
              <span className="mt-0.5 block text-xs text-ink-mute">
                お名前をそのまま領収書の宛名に使います
              </span>
            </span>
          </label>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-brand-light/70 bg-brand-pale/30 px-4 py-3 transition hover:border-brand hover:bg-brand-pale/60">
            <input
              type="radio"
              name="receipt_name_mode"
              checked={receiptNameMode === "custom"}
              onChange={() => setReceiptNameMode("custom")}
              className="mt-0.5 h-4 w-4 accent-brand-deep"
            />
            <span className="text-sm text-ink">
              <span className="font-semibold">別の宛名を指定する</span>
              <span className="mt-0.5 block text-xs text-ink-mute">
                法人名・屋号・別名義など、個別の宛名を設定できます
              </span>
            </span>
          </label>
        </div>

        {receiptNameMode === "custom" && (
          <div className="mt-4">
            <Field label="領収書の宛名" required>
              <input
                type="text"
                required
                value={receiptName}
                onChange={(e) => setReceiptName(e.target.value)}
                className={inputClass}
                placeholder="例：株式会社〇〇 / 山田 花子 / ○○事務所"
              />
            </Field>
          </div>
        )}

        <div className="mt-4 rounded-xl border border-brand-light bg-gradient-to-br from-brand-pale to-white px-4 py-3">
          <div className="text-xs font-bold text-brand-deep">領収書プレビュー</div>
          <p className="mt-1 text-sm text-ink">
            <strong>
              {receiptNameMode === "custom" && receiptName.trim()
                ? receiptName.trim()
                : name.trim() || "（お名前）"}
            </strong>
            <span className="text-ink-soft"> 様</span>
          </p>
          <p className="mt-1 text-xs text-ink-mute">
            入金完了時に、この宛名で領収書を発行します
          </p>
        </div>
      </section>

      <section className="border-t border-brand-pale pt-8">
        <SectionHeading
          small={priceOptions?.length ? "Step 4" : "Step 3"}
          main="アンケート"
        />
        <div className="space-y-6">
          <Field label="受講のきっかけ" required>
            <div className="space-y-2">
              {ENROLLMENT_REASON_OPTIONS.map((option) => (
                <label
                  key={option}
                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-brand-light/70 bg-white px-4 py-3 transition hover:border-brand hover:bg-brand-pale/40"
                >
                  <input
                    type="radio"
                    name="enrollment_reason"
                    value={option}
                    checked={enrollmentReason === option}
                    onChange={() => setEnrollmentReason(option)}
                    className="h-4 w-4 accent-brand-deep"
                  />
                  <span className="text-sm text-ink">{option}</span>
                </label>
              ))}
            </div>
          </Field>

          <Field
            label="思考の学校の講座等を受講されたことはございますか？"
            required
          >
            <div className="space-y-2">
              {PAST_COURSE_OPTIONS.map((option) => (
                <label
                  key={option}
                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-brand-light/70 bg-white px-4 py-3 transition hover:border-brand hover:bg-brand-pale/40"
                >
                  <input
                    type="checkbox"
                    checked={pastCourses.includes(option)}
                    onChange={() => togglePastCourse(option)}
                    className="h-4 w-4 accent-brand-deep"
                  />
                  <span className="text-sm text-ink">{option}</span>
                </label>
              ))}
            </div>
          </Field>

          <Field
            label="心療内科通院中または薬を服用中の方は主治医の先生にご相談の上ご受講ください"
            required
          >
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-accent/30 bg-accent-peach/20 px-4 py-3">
              <input
                type="checkbox"
                checked={medicalAcknowledged}
                onChange={(e) => setMedicalAcknowledged(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-brand-deep"
              />
              <span className="text-sm text-ink">理解した</span>
            </label>
          </Field>
        </div>
      </section>

      {errorMsg && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMsg}
        </div>
      )}

      <label className="flex items-start gap-3 rounded-xl border border-brand-light bg-brand-pale/30 px-4 py-4 text-sm leading-relaxed text-ink">
        <input
          type="checkbox"
          checked={privacyConsent}
          onChange={(e) => setPrivacyConsent(e.target.checked)}
          className="mt-1 h-4 w-4 shrink-0 accent-brand-deep"
        />
        <span>
          <a
            href="/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-deep underline underline-offset-2"
          >
            プライバシーポリシー
          </a>
          および
          <a
            href="/legal"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-deep underline underline-offset-2"
          >
            特定商取引法に基づく表記
          </a>
          に同意します
        </span>
      </label>

      <div className="border-t border-brand-pale pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-cta-gradient py-4 font-bold text-white shadow-cta transition hover:bg-cta-gradient-hover hover:shadow-cta-hover disabled:bg-slate-400 disabled:shadow-none"
        >
          {submitting ? "処理中…" : "決済画面へ進む"}
        </button>
        <p className="mt-3 text-center text-xs text-ink-mute">
          ボタンを押すと、Stripeの安全な決済画面に移動します
        </p>
      </div>
    </form>
  );
}

const inputClass =
  "w-full rounded-xl border border-brand-light bg-white px-4 py-3 text-ink outline-none transition focus:border-brand-dark focus:ring-2 focus:ring-brand-pale";

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-ink">
        {label}
        {required && <span className="ml-1 text-accent">*</span>}
      </label>
      {hint && (
        <p className="mb-2 text-xs leading-relaxed text-ink-mute">{hint}</p>
      )}
      {children}
    </div>
  );
}
