"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ImageUploadField from "@/components/ImageUploadField";
import type { Lecturer, LecturerSocialLinks } from "@/types";

interface Props {
  initialLecturer: Lecturer;
}

function achievementsToText(items: string[] | null | undefined): string {
  return (items ?? []).join("\n");
}

export default function LecturerSettingsForm({ initialLecturer }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [slug, setSlug] = useState(initialLecturer.slug);
  const [name, setName] = useState(initialLecturer.name);
  const [title, setTitle] = useState(initialLecturer.title ?? "");
  const [catchCopy, setCatchCopy] = useState(initialLecturer.catch_copy ?? "");
  const [bio, setBio] = useState(initialLecturer.bio ?? "");
  const [messageText, setMessageText] = useState(initialLecturer.message ?? "");
  const [achievements, setAchievements] = useState(
    achievementsToText(initialLecturer.achievements)
  );
  const [imageUrl, setImageUrl] = useState(initialLecturer.image_url ?? "");
  const [heroImageUrl, setHeroImageUrl] = useState(
    initialLecturer.hero_image_url ?? ""
  );
  const [receiptIssuerName, setReceiptIssuerName] = useState(
    initialLecturer.receipt_issuer_name ?? ""
  );
  const [isPublished, setIsPublished] = useState(initialLecturer.is_published);

  const social = initialLecturer.social_links ?? {};
  const [instagram, setInstagram] = useState(social.instagram ?? "");
  const [twitter, setTwitter] = useState(social.twitter ?? "");
  const [youtube, setYoutube] = useState(social.youtube ?? "");
  const [facebook, setFacebook] = useState(social.facebook ?? "");
  const [website, setWebsite] = useState(social.website ?? "");
  const [line, setLine] = useState(social.line ?? "");

  useEffect(() => {
    setSlug(initialLecturer.slug);
    setName(initialLecturer.name);
    setTitle(initialLecturer.title ?? "");
    setCatchCopy(initialLecturer.catch_copy ?? "");
    setBio(initialLecturer.bio ?? "");
    setMessageText(initialLecturer.message ?? "");
    setAchievements(achievementsToText(initialLecturer.achievements));
    setImageUrl(initialLecturer.image_url ?? "");
    setHeroImageUrl(initialLecturer.hero_image_url ?? "");
    setReceiptIssuerName(initialLecturer.receipt_issuer_name ?? "");
    setIsPublished(initialLecturer.is_published);
    const s = initialLecturer.social_links ?? {};
    setInstagram(s.instagram ?? "");
    setTwitter(s.twitter ?? "");
    setYoutube(s.youtube ?? "");
    setFacebook(s.facebook ?? "");
    setWebsite(s.website ?? "");
    setLine(s.line ?? "");
  }, [initialLecturer]);

  async function handleSave() {
    setSaving(true);
    setMessage(null);

    const social_links: LecturerSocialLinks = {
      instagram: instagram.trim() || undefined,
      twitter: twitter.trim() || undefined,
      youtube: youtube.trim() || undefined,
      facebook: facebook.trim() || undefined,
      website: website.trim() || undefined,
      line: line.trim() || undefined,
    };

    try {
      const res = await fetch(
        `/admin/lecturers/${initialLecturer.id}/settings/api`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: initialLecturer.id,
            slug,
            name,
            title,
            catch_copy: catchCopy,
            bio,
            message: messageText,
            achievements: achievements
              .split("\n")
              .map((l) => l.trim())
              .filter(Boolean),
            image_url: imageUrl,
            hero_image_url: heroImageUrl,
            social_links,
            receipt_issuer_name: receiptIssuerName,
            is_published: isPublished,
          }),
        }
      );

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
      <div className="flex flex-wrap gap-3">
        <Link
          href={`/lecturer/${slug}`}
          target="_blank"
          className="inline-flex items-center rounded-lg bg-brand px-4 py-2 text-sm font-bold text-white hover:bg-brand-dark"
        >
          講師紹介ページを確認
        </Link>
      </div>

      {/* 基本情報 */}
      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-bold text-slate-900">基本情報</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <TextField label="名前" value={name} onChange={setName} required />
          <TextField
            label="URL slug"
            value={slug}
            onChange={setSlug}
            required
            hint="/lecturer/[slug] のURLになります"
          />
          <TextField
            label="肩書"
            value={title}
            onChange={setTitle}
            placeholder="思考の学校 認定講師"
          />
          <ImageUploadField
            label="写真"
            value={imageUrl}
            onChange={setImageUrl}
            folder="lecturers"
            hint="JPEG / PNG / WebP / GIF（5MBまで）"
          />
          <div className="md:col-span-2">
            <ImageUploadField
              label="ヒーロー背景画像（任意）"
              value={heroImageUrl}
              onChange={setHeroImageUrl}
              folder="lecturers"
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
          公開する（チェックを外すと講師ページが404になります）
        </label>
      </section>

      {/* ヒーロー・紹介文 */}
      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-bold text-slate-900">
          講師紹介ページの文言
        </h2>
        <div className="space-y-4">
          <TextField
            label="キャッチコピー"
            value={catchCopy}
            onChange={setCatchCopy}
            placeholder="思考が変わると、毎日がやさしく変わっていく。"
          />
          <TextArea
            label="自己紹介・想い（About セクション）"
            value={bio}
            onChange={setBio}
            rows={8}
            placeholder="はじめまして、〇〇です。&#10;改行も反映されます。"
          />
          <TextArea
            label="経歴・実績（1行に1つ）"
            value={achievements}
            onChange={setAchievements}
            rows={5}
            placeholder={"思考の学校 認定講師\n受講生・相談者 累計1,200名以上"}
          />
          <TextArea
            label="受講生へのメッセージ（MESSAGE セクション）"
            value={messageText}
            onChange={setMessageText}
            rows={5}
          />
        </div>
      </section>

      {/* SNS */}
      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-bold text-slate-900">SNS・リンク</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <TextField label="公式サイト / note" value={website} onChange={setWebsite} placeholder="https://note.com/..." />
          <TextField
            label="Instagram"
            value={instagram}
            onChange={setInstagram}
          />
          <TextField label="X (Twitter)" value={twitter} onChange={setTwitter} />
          <TextField label="YouTube" value={youtube} onChange={setYoutube} />
          <TextField label="Facebook" value={facebook} onChange={setFacebook} />
          <TextField label="公式LINE" value={line} onChange={setLine} />
        </div>
      </section>

      {/* 領収書 */}
      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-2 text-lg font-bold text-slate-900">領収書設定</h2>
        <p className="mb-4 text-sm text-slate-500">
          入金完了時の領収書に記載される発行元名です。
        </p>
        <TextField
          label="領収書の発行元名"
          value={receiptIssuerName}
          onChange={setReceiptIssuerName}
          placeholder="My Stage　神谷京花"
        />
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
  required,
  hint,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  hint?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </span>
      {hint && <p className="mb-1 text-xs text-slate-400">{hint}</p>}
      <input
        type="text"
        required={required}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
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
  onChange: (v: string) => void;
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
