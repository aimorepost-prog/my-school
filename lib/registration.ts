// ============================================================
// 申込フォーム：質問項目の定義
// ============================================================

export const ENROLLMENT_REASON_OPTIONS = [
  "タイミングがあった",
  "メルマガ",
  "ブログ（note）",
  "その他",
] as const;

export const PAST_COURSE_OPTIONS = [
  "ない　初めて",
  "ある　体験講座",
  "ある　基礎講座",
  "ある　3か月実践講座",
  "ある　思考の学校オンライン",
  "ある　複数の種類",
  "その他",
] as const;

export type EnrollmentReason = (typeof ENROLLMENT_REASON_OPTIONS)[number];

export interface BookingAnswers {
  enrollment_reason: string;
  past_courses: string[];
  medical_acknowledged: boolean;
}

export function validateBookingAnswers(answers: unknown):
  | { ok: true; data: BookingAnswers }
  | { ok: false; error: string } {
  if (!answers || typeof answers !== "object") {
    return { ok: false, error: "質問への回答が不足しています" };
  }

  const a = answers as Record<string, unknown>;
  const enrollmentReason =
    typeof a.enrollment_reason === "string" ? a.enrollment_reason.trim() : "";

  if (!enrollmentReason) {
    return { ok: false, error: "受講のきっかけを選択してください" };
  }

  const pastCourses = Array.isArray(a.past_courses)
    ? a.past_courses.filter(
        (v): v is string => typeof v === "string" && v.trim().length > 0
      )
    : [];

  if (pastCourses.length === 0) {
    return {
      ok: false,
      error: "思考の学校の講座受講歴を1つ以上選択してください",
    };
  }

  if (a.medical_acknowledged !== true) {
    return {
      ok: false,
      error: "心療内科通院・服薬に関する注意事項への同意が必要です",
    };
  }

  return {
    ok: true,
    data: {
      enrollment_reason: enrollmentReason,
      past_courses: pastCourses,
      medical_acknowledged: true,
    },
  };
}

export function resolveReceiptName(
  applicantName: string,
  receiptNameInput?: string | null
): string {
  const trimmed = receiptNameInput?.trim();
  return trimmed || applicantName.trim();
}
