-- ============================================================
-- 講座の複数開催日程（event_sessions）
-- ============================================================

CREATE TABLE IF NOT EXISTS event_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ,
  capacity INTEGER,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_sessions_event_id ON event_sessions (event_id);
CREATE INDEX IF NOT EXISTS idx_event_sessions_starts_at ON event_sessions (starts_at);

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS session_id UUID REFERENCES event_sessions(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_bookings_session_id ON bookings (session_id);

-- ============================================================
-- RLS
-- ============================================================

ALTER TABLE event_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "event_sessions_select_anon_published" ON event_sessions;
CREATE POLICY "event_sessions_select_anon_published"
  ON event_sessions FOR SELECT
  TO anon
  USING (is_published = true);

DROP POLICY IF EXISTS "event_sessions_insert_anon" ON event_sessions;
DROP POLICY IF EXISTS "event_sessions_update_anon" ON event_sessions;
DROP POLICY IF EXISTS "event_sessions_delete_anon" ON event_sessions;
