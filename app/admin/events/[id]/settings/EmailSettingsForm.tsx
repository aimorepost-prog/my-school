"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { EmailSettings } from "@/types";

interface Props {
  eventId: string;
  initialSettings: EmailSettings | null;
}

// 分単位の timing を「日 or 時間」のフォーム値に分解
function minutesToInputs(minutes: number | null): {
  unit: "day" | "hour";
  value: number;
} {
  if (minutes === null) return { unit: "day", value: 1 };
  if (minutes >= 1440 && minutes % 1440 === 0) {
    return { unit: "day", value: minutes / 1440 };
  }
  return { unit: "hour", value: Math.max(1, Math.floor(minutes / 60)) };
}

function inputsToMinutes(unit: "day" | "hour", value: number): number {
  return unit === "day" ? value * 1440 : value * 60;
}

export default function EmailSettingsForm({ eventId, initialSettings }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  // 督促
  const [dunningEnabled, setDunningEnabled] = useState(
    initialSettings?.dunning_enabled ?? false
  );
  const [dunning1stDays, setDunning1stDays] = useState(
    initialSettings?.dunning_1st_days ?? 3
  );
  const [dunning2ndDays, setDunning2ndDays] = useState(
    initialSettings?.dunning_2nd_days ?? 7
  );

  // リマインダー1
  const r1 = minutesToInputs(initialSettings?.reminder_1_timing ?? null);
  const [reminder1Enabled, setReminder1Enabled] = useState(
    initialSettings?.reminder_1_enabled ?? false
  );
  const [reminder1Unit, setReminder1Unit] = useState<"day" | "hour">(r1.unit);
  const [reminder1Value, setReminder1Value] = useState<number>(r1.value);

  // リマインダー2
  const r2 = minutesToInputs(initialSettings?.reminder_2_timing ?? null);
  const [reminder2Enabled, setReminder2Enabled] = useState(
    initialSettings?.reminder_2_enabled ?? false
  );
  const [reminder2Unit, setReminder2Unit] = useState<"day" | "hour">(r2.unit);
  const [reminder2Value, setReminder2Value] = useState<number>(r2.value);

  async function handleSave() {
    setSaving(true);
    setSavedMsg(null);
    try {
      const payload = {
        event_id: eventId,
        dunning_enabled: dunningEnabled,
        dunning_1st_days: dunning1stDays,
        dunning_2nd_days: dunning2ndDays,
        reminder_1_enabled: reminder1Enabled,
        reminder_1_timing: inputsToMinutes(reminder1Unit, reminder1Value),
        reminder_2_enabled: reminder2Enabled,
        reminder_2_timing: inputsToMinutes(reminder2Unit, reminder2Value),
      };

      const res = await fetch(`/admin/events/${eventId}/settings/api`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: "unknown" }));
        throw new Error(error || "保存に失敗しました");
      }

      setSavedMsg("保存しました");
      router.refresh();
      setTimeout(() => setSavedMsg(null), 3000);
    } catch (err: any) {
      setSavedMsg(`エラー: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* ============== 督促 ============== */}
      <section className="bg-white rounded-xl shadow-sm p-6">
        <Toggle
          label="未入金督促"
          checked={dunningEnabled}
          onChange={setDunningEnabled}
        />
        <div className={`mt-4 space-y-3 ${dunningEnabled ? "" : "opacity-40 pointer-events-none"}`}>
          <NumberRow
            label="1回目"
            prefix="申込から"
            suffix="日後"
            value={dunning1stDays}
            onChange={setDunning1stDays}
          />
          <NumberRow
            label="2回目"
            prefix="申込から"
            suffix="日後"
            value={dunning2ndDays}
            onChange={setDunning2ndDays}
          />
        </div>
      </section>

      {/* ============== リマインダー1 ============== */}
      <section className="bg-white rounded-xl shadow-sm p-6">
        <Toggle
          label="直前リマインダー①"
          checked={reminder1Enabled}
          onChange={setReminder1Enabled}
        />
        <div className={`mt-4 ${reminder1Enabled ? "" : "opacity-40 pointer-events-none"}`}>
          <TimingRow
            unit={reminder1Unit}
            setUnit={setReminder1Unit}
            value={reminder1Value}
            setValue={setReminder1Value}
          />
        </div>
      </section>

      {/* ============== リマインダー2 ============== */}
      <section className="bg-white rounded-xl shadow-sm p-6">
        <Toggle
          label="直前リマインダー②"
          checked={reminder2Enabled}
          onChange={setReminder2Enabled}
        />
        <div className={`mt-4 ${reminder2Enabled ? "" : "opacity-40 pointer-events-none"}`}>
          <TimingRow
            unit={reminder2Unit}
            setUnit={setReminder2Unit}
            value={reminder2Value}
            setValue={setReminder2Value}
          />
        </div>
      </section>

      {/* 保存 */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-brand hover:bg-brand-dark disabled:bg-slate-400 text-white font-bold px-8 py-3 rounded-lg transition"
        >
          {saving ? "保存中…" : "保存する"}
        </button>
        {savedMsg && (
          <span
            className={`text-sm ${
              savedMsg.startsWith("エラー") ? "text-red-600" : "text-emerald-600"
            }`}
          >
            {savedMsg}
          </span>
        )}
      </div>
    </div>
  );
}

// ============================================================
// パーツコンポーネント
// ============================================================

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-lg font-bold text-slate-900">{label}</span>
      <label className="inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="relative w-12 h-7 bg-slate-300 peer-checked:bg-brand rounded-full transition">
          <div
            className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition ${
              checked ? "translate-x-5" : ""
            }`}
          />
        </div>
        <span className="ml-2 text-sm text-slate-700">
          {checked ? "使う" : "使わない"}
        </span>
      </label>
    </div>
  );
}

function NumberRow({
  label,
  prefix,
  suffix,
  value,
  onChange,
}: {
  label: string;
  prefix: string;
  suffix: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex items-center gap-2 text-slate-700">
      <span className="w-12 text-sm">{label}:</span>
      <span className="text-sm">{prefix}</span>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-20 border border-slate-300 rounded px-2 py-1 text-center"
      />
      <span className="text-sm">{suffix}</span>
    </div>
  );
}

function TimingRow({
  unit,
  setUnit,
  value,
  setValue,
}: {
  unit: "day" | "hour";
  setUnit: (u: "day" | "hour") => void;
  value: number;
  setValue: (n: number) => void;
}) {
  return (
    <div className="flex items-center gap-2 text-slate-700 flex-wrap">
      <span className="text-sm">イベントの</span>
      <input
        type="number"
        min={1}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        className="w-20 border border-slate-300 rounded px-2 py-1 text-center"
      />
      <select
        value={unit}
        onChange={(e) => setUnit(e.target.value as "day" | "hour")}
        className="border border-slate-300 rounded px-2 py-1"
      >
        <option value="day">日前</option>
        <option value="hour">時間前</option>
      </select>
      <span className="text-sm">に送信</span>
    </div>
  );
}
