// ============================================================
// データベース型定義
// ============================================================

export type PaymentStatus = "pending" | "paid" | "cancelled";

export type MailType =
  | "confirm_pending"
  | "confirm_paid"
  | "receipt"
  | "dunning_1"
  | "dunning_2"
  | "reminder_1"
  | "reminder_2";

export interface BookingAnswers {
  enrollment_reason: string;
  past_courses: string[];
  medical_acknowledged: boolean;
  price_tier?: string;
  selected_price?: number;
  price_tier_label?: string;
}

// ----------------------------------------
// 講師（lecturers）
// ----------------------------------------
export interface Lecturer {
  id: string;
  slug: string;
  name: string;
  title: string | null;
  catch_copy: string | null;
  bio: string | null;
  achievements: string[];
  image_url: string | null;
  hero_image_url: string | null;
  message: string | null;
  social_links: LecturerSocialLinks;
  receipt_issuer_name: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface LecturerSocialLinks {
  instagram?: string;
  twitter?: string;
  youtube?: string;
  facebook?: string;
  website?: string;
  line?: string;
}

// ----------------------------------------
// イベント / 講座（events）
// ----------------------------------------
export interface Event {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  price: number;
  event_date: string;
  capacity: number | null;
  image_url: string | null;
  is_published: boolean;
  created_at: string;

  // --- LP拡張カラム ---
  lecturer_id: string | null;
  catch_copy: string | null;
  subtitle: string | null;
  location_text: string | null;
  duration_text: string | null;
  benefits: EventBenefit[];
  schedule: EventScheduleItem[];
  target_audience: string[];
  faqs: EventFaq[];
  notes: string | null;
  receipt_issuer_name: string | null;
}

export interface EventBenefit {
  title: string;
  description?: string;
}

export interface EventScheduleItem {
  time: string;
  title: string;
  description?: string;
}

export interface EventFaq {
  q: string;
  a: string;
}

// ----------------------------------------
// 開催日程（event_sessions）
// ----------------------------------------
export interface EventSession {
  id: string;
  event_id: string;
  starts_at: string;
  ends_at: string | null;
  capacity: number | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

// ----------------------------------------
// 予約（bookings）
// ----------------------------------------
export interface Booking {
  id: string;
  event_id: string;
  session_id: string | null;
  customer_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  payment_status: PaymentStatus;
  stripe_session_id: string | null;
  receipt_name: string | null;
  referrer: string | null;
  answers: BookingAnswers;
  receipt_issued_at: string | null;
  created_at: string;
}

// ----------------------------------------
// 顧客（customers）
// ----------------------------------------
export interface Customer {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  total_spent: number;
  total_events: number;
  last_purchase_at: string | null;
  note: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

// ----------------------------------------
// メール設定 / ログ
// ----------------------------------------
export interface EmailSettings {
  id: string;
  event_id: string;
  dunning_enabled: boolean;
  dunning_1st_days: number;
  dunning_2nd_days: number;
  reminder_1_enabled: boolean;
  reminder_1_timing: number | null;
  reminder_2_enabled: boolean;
  reminder_2_timing: number | null;
}

export interface EmailLog {
  id: string;
  booking_id: string;
  mail_type: MailType;
  sent_at: string;
}

// ----------------------------------------
// お問い合わせ（contacts）
// ----------------------------------------
export type ContactStatus = "new" | "in_progress" | "done";

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: ContactStatus;
  admin_note: string | null;
  user_agent: string | null;
  ip_address: string | null;
  created_at: string;
  updated_at: string;
}
