"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUploadField from "@/components/ImageUploadField";
import type { Event, EventBenefit, EventFaq, EventScheduleItem } from "@/types";

interface Props {
  initialEvent: Event;
}

function toDatetimeLocal(iso: string): string {
  const d = new Date(iso);
  const offsetMs = d.getTimezoneOffset() * 60 * 1000;
  return new Date(d.getTime() - offsetMs).toISOString().slice(0, 16);
}

function benefitsToText(items: EventBenefit[] | null | undefined): string {
  return (items ?? [])
    .map((item) => [item.title, item.description ?? ""].join("｜"))
    .join("\n");
}

function scheduleToText(items: EventScheduleItem[] | null | undefined): string {
  return (items ?? [])
    .map((item) => [item.time, item.title, item.description ?? ""].join("｜"))
    .join("\n");
}

function faqsToText(items: EventFaq[] | null | undefined): string {
  return (items ?? []).map((item) => [item.q, item.a].join("｜")).join("\n");
}

function parseBenefits(text: string): EventBenefit[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [title, description] = line.split("｜");
      return {
        title: title?.trim() ?? "",
        description: description?.trim() || undefined,
      };
    })
    .filter((item) => item.title);
}

function parseSchedule(text: string): EventScheduleItem[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [time, title, description] = line.split("｜");
      return {
        time: time?.trim() ?? "",
        title: title?.trim() ?? "",
        description: description?.trim() || undefined,
      };
    })
    .filter((item) => item.time && item.title);
}

function parseLines(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function parseFaqs(text: string): EventFaq[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [q, a] = line.split("｜");
      return {
        q: q?.trim() ?? "",
        a: a?.trim() ?? "",
      };
    })
    .filter((item) => item.q && item.a);
}

export default function LpEditForm({ initialEvent }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [title, setTitle] = useState(initialEvent.title);
  const [slug, setSlug] = useState(initialEvent.slug);
  const [price, setPrice] = useState(initialEvent.price);
  const [eventDate, setEventDate] = useState(
    toDatetimeLocal(initialEvent.event_date)
  );
  const [capacity, setCapacity] = useState(initialEvent.capacity ?? "");
  const [isPublished, setIsPublished] = useState(initialEvent.is_published);

  const [catchCopy, setCatchCopy] = useState(initialEvent.catch_copy ?? "");
  const [subtitle, setSubtitle] = useState(initialEvent.subtitle ?? "");
  const [locationText, setLocationText] = useState(
    initialEvent.location_text ?? ""
  );
  const [durationText, setDurationText] = useState(
    initialEvent.duration_text ?? ""
  );
  const [description, setDescription] = useState(
    initialEvent.description ?? ""
  );
  const [imageUrl, setImageUrl] = useState(initialEvent.image_url ?? "");
  const [benefits, setBenefits] = useState(
    benefitsToText(initialEvent.benefits)
  );
  const [schedule, setSchedule] = useState(
    scheduleToText(initialEvent.schedule)
  );
  const [targetAudience, setTargetAudience] = useState(
    (initialEvent.target_audience ?? []).join("\n")
  );
  const [faqs, setFaqs] = useState(faqsToText(initialEvent.faqs));
  const [notes, setNotes] = useState(initialEvent.notes ?? "");
  const [receiptIssuerName, setReceiptIssuerName] = useState(
    initialEvent.receipt_issuer_name ?? ""
  );

  async function handleSave() {
    setSaving(true);
    setMessage(null);

    try {
      const payload = {
        id: initialEvent.id,
        title,
        slug,
        price,
        event_date: new Date(eventDate).toISOString(),
        capacity: capacity === "" ? null : Number(capacity),
        image_url: imageUrl.trim() || null,
        is_published: isPublished,
        catch_copy: catchCopy.trim() || null,
        subtitle: subtitle.trim() || null,
        location_text: locationText.trim() || null,
        duration_text: durationText.trim() || null,
        description: description.trim() || null,
        benefits: parseBenefits(benefits),
        schedule: parseSchedule(schedule),
        target_audience: parseLines(targetAudience),
        faqs: parseFaqs(faqs),
        notes: notes.trim() || null,
        receipt_issuer_name: receiptIssuerName.trim() || null,
      };

      const res = await fetch(`/admin/events/${initialEvent.id}/lp/api`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: "unknown" }));
        throw new Error(error || "保存に失敗しました");
      }

      setMessage("保存しました");
      router.refresh();
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage(
        `エラー: ${err instanceof Error ? err.message : "保存に失敗しました"}`
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-bold text-slate-900">基本情報</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <TextField label="講座タイトル" value={title} onChange={setTitle} />
          <TextField label="URL slug" value={slug} onChange={setSlug} />
          <NumberField label="価格" value={price} onChange={(v) => setPrice(typeof v === "number" ? v : Number(v) || 0)} />
          <TextField
            label="開催日時"
            type="datetime-local"
            value={eventDate}
            onChange={setEventDate}
          />
          <NumberField
            label="定員（空欄なら定員なし）"
            value={capacity}
            onChange={setCapacity}
          />
          <TextField
            label="開催形式"
            value={locationText}
            onChange={setLocationText}
            placeholder="オンライン開催（Zoom）"
          />
          <TextField
            label="所要時間"
            value={durationText}
            onChange={setDurationText}
            placeholder="120分（休憩込み）"
          />
          <div className="md:col-span-2">
            <ImageUploadField
              label="メイン画像（任意）"
              value={imageUrl}
              onChange={setImageUrl}
              folder="events"
              hint="講座LPのヒーロー右側に表示されます"
            />
          </div>
        </div>

        <label className="mt-4 flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
            className="h-4 w-4"
          />
          公開する
        </label>
      </section>

      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-bold text-slate-900">領収書設定</h2>
        <p className="mb-4 text-sm text-slate-500">
          空欄の場合は講師設定の発行元名を使います。講座ごとに上書きしたい場合のみ入力してください。
        </p>
        <TextField
          label="領収書の発行元名（任意・講座単位で上書き）"
          value={receiptIssuerName}
          onChange={setReceiptIssuerName}
          placeholder="My Stage　神谷京花"
        />
      </section>

      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-bold text-slate-900">ヒーロー文言</h2>
        <div className="space-y-4">
          <TextField
            label="キャッチコピー"
            value={catchCopy}
            onChange={setCatchCopy}
            placeholder="心が軽くなる、新しい思考のヒント"
          />
          <TextField
            label="サブタイトル"
            value={subtitle}
            onChange={setSubtitle}
            placeholder="はじめての方も安心して..."
          />
          <TextArea
            label="説明文"
            value={description}
            onChange={setDescription}
            rows={6}
          />
        </div>
      </section>

      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-bold text-slate-900">LPセクション</h2>
        <div className="space-y-5">
          <TextArea
            label="得られるもの（1行に「タイトル｜説明」）"
            value={benefits}
            onChange={setBenefits}
            rows={5}
            placeholder={"気づきが得られる｜思考のクセを発見できます\n心が軽くなる｜モヤモヤの正体に気づけます"}
          />
          <TextArea
            label="当日のスケジュール（1行に「時間｜タイトル｜説明」）"
            value={schedule}
            onChange={setSchedule}
            rows={7}
            placeholder={"10:00｜オープニング｜自己紹介\n10:15｜思考の学校とは？｜全体像をお話します"}
          />
          <TextArea
            label="こんな方におすすめ（1行に1つ）"
            value={targetAudience}
            onChange={setTargetAudience}
            rows={6}
          />
          <TextArea
            label="よくある質問（1行に「質問｜回答」）"
            value={faqs}
            onChange={setFaqs}
            rows={6}
            placeholder={"Zoomを使ったことがなくても大丈夫？｜はい、大丈夫です。"}
          />
          <TextArea
            label="注意事項"
            value={notes}
            onChange={setNotes}
            rows={5}
          />
        </div>
      </section>

      <div className="sticky bottom-4 flex items-center gap-4 rounded-xl bg-white/90 p-4 shadow-lg backdrop-blur">
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-brand px-8 py-3 font-bold text-white transition hover:bg-brand-dark disabled:bg-slate-400"
        >
          {saving ? "保存中…" : "保存する"}
        </button>
        {message && (
          <span
            className={`text-sm ${
              message.startsWith("エラー")
                ? "text-red-600"
                : "text-emerald-600"
            }`}
          >
            {message}
          </span>
        )}
      </div>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-brand"
      />
    </label>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | string;
  onChange: (value: number | string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </span>
      <input
        type="number"
        value={value}
        onChange={(e) =>
          onChange(e.target.value === "" ? "" : Number(e.target.value))
        }
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-brand"
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  rows,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows: number;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </span>
      <textarea
        value={value}
        rows={rows}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-brand"
      />
    </label>
  );
}
