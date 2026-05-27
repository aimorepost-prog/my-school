"use client";

import { useState } from "react";

interface FormState {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  consent: boolean;
}

const initialState: FormState = {
  name: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
  consent: false,
};

export default function ContactForm() {
  const [form, setForm] = useState<FormState>(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setError(null);

    if (!form.consent) {
      setError("プライバシーポリシーへの同意が必要です");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; error?: string }
        | null;
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "送信に失敗しました");
      }
      setDone(true);
      setForm(initialState);
    } catch (err) {
      setError(err instanceof Error ? err.message : "送信に失敗しました");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="rounded-3xl bg-white p-8 shadow-card md:p-10">
        <h2 className="mb-3 text-center font-serif text-xl font-bold text-brand-deep md:text-2xl">
          お問い合わせありがとうございます
        </h2>
        <p className="text-center text-sm leading-relaxed text-ink md:text-base">
          内容を確認のうえ、2〜3営業日以内にご連絡いたします。
          <br />
          ご入力のメールアドレスに受付完了メールをお送りしましたので、ご確認ください。
        </p>
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setDone(false)}
            className="text-sm text-brand-deep underline-offset-4 hover:underline"
          >
            続けてお問い合わせする
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-6 rounded-3xl bg-white p-6 shadow-card md:p-10"
    >
      <FieldText
        label="お名前"
        required
        value={form.name}
        onChange={(v) => update("name", v)}
        maxLength={100}
      />
      <FieldText
        label="メールアドレス"
        required
        type="email"
        value={form.email}
        onChange={(v) => update("email", v)}
      />
      <FieldText
        label="電話番号"
        hint="任意（お急ぎの場合はご記入ください）"
        type="tel"
        value={form.phone}
        onChange={(v) => update("phone", v)}
      />
      <FieldText
        label="件名"
        required
        value={form.subject}
        onChange={(v) => update("subject", v)}
        maxLength={200}
        placeholder="例：講座について質問があります"
      />
      <FieldTextarea
        label="お問い合わせ内容"
        required
        value={form.message}
        onChange={(v) => update("message", v)}
        maxLength={4000}
        rows={8}
      />

      <label className="flex items-start gap-3 rounded-2xl border border-brand-light bg-brand-pale/40 p-4 text-sm leading-relaxed text-ink">
        <input
          type="checkbox"
          checked={form.consent}
          onChange={(e) => update("consent", e.target.checked)}
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
          に同意のうえ送信します
        </span>
      </label>

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-full bg-brand-deep py-4 text-base font-bold text-white shadow-soft transition hover:bg-brand-dark disabled:opacity-60 md:text-lg"
      >
        {submitting ? "送信中..." : "送信する"}
      </button>
    </form>
  );
}

interface FieldTextProps {
  label: string;
  required?: boolean;
  hint?: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  maxLength?: number;
  placeholder?: string;
}

function FieldText({
  label,
  required,
  hint,
  type = "text",
  value,
  onChange,
  maxLength,
  placeholder,
}: FieldTextProps) {
  return (
    <div>
      <label className="mb-2 flex items-center gap-2 text-sm font-bold text-ink">
        {label}
        {required && (
          <span className="rounded-md bg-accent/15 px-2 py-0.5 text-xs font-bold text-accent">
            必須
          </span>
        )}
        {hint && <span className="text-xs font-normal text-ink-soft">{hint}</span>}
      </label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={maxLength}
        placeholder={placeholder}
        className="w-full rounded-xl border border-brand-light bg-white px-4 py-3 text-base text-ink shadow-inner outline-none transition focus:border-brand-deep focus:ring-2 focus:ring-brand-light"
      />
    </div>
  );
}

interface FieldTextareaProps {
  label: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  maxLength?: number;
  rows?: number;
}

function FieldTextarea({
  label,
  required,
  value,
  onChange,
  maxLength,
  rows = 6,
}: FieldTextareaProps) {
  return (
    <div>
      <label className="mb-2 flex items-center gap-2 text-sm font-bold text-ink">
        {label}
        {required && (
          <span className="rounded-md bg-accent/15 px-2 py-0.5 text-xs font-bold text-accent">
            必須
          </span>
        )}
      </label>
      <textarea
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={maxLength}
        rows={rows}
        className="w-full resize-y rounded-xl border border-brand-light bg-white px-4 py-3 text-base leading-relaxed text-ink shadow-inner outline-none transition focus:border-brand-deep focus:ring-2 focus:ring-brand-light"
      />
      {maxLength && (
        <p className="mt-1 text-right text-xs text-ink-soft">
          {value.length} / {maxLength}
        </p>
      )}
    </div>
  );
}
