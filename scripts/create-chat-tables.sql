-- ─────────────────────────────────────────────────────────────────────────────
-- CHAT TABLES for Univvy
-- One chat per confirmed booking, auto-closes when session ends
-- ─────────────────────────────────────────────────────────────────────────────

-- Table: chats
CREATE TABLE IF NOT EXISTS public.chats (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id      uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  student_id      uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  advisor_id      uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_active       boolean NOT NULL DEFAULT true,
  opens_at        timestamptz NOT NULL,
  closes_at       timestamptz NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE(booking_id)
);

-- Table: chat_messages
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id         uuid NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
  sender_id       uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content         text,
  message_type    text NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'pdf', 'document', 'system', 'censored')),
  file_url        text,
  file_name       text,
  file_size       integer,
  is_censored     boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_chats_booking_id  ON public.chats(booking_id);
CREATE INDEX IF NOT EXISTS idx_chats_student_id  ON public.chats(student_id);
CREATE INDEX IF NOT EXISTS idx_chats_advisor_id  ON public.chats(advisor_id);
CREATE INDEX IF NOT EXISTS idx_chats_is_active   ON public.chats(is_active);
CREATE INDEX IF NOT EXISTS idx_chat_messages_chat_id    ON public.chat_messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(created_at);

-- ─── RLS ─────────────────────────────────────────────────────────────────────
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- chats: participants only
CREATE POLICY "chats_select_participants"
  ON public.chats FOR SELECT
  USING (auth.uid() = student_id OR auth.uid() = advisor_id);

CREATE POLICY "chats_insert_system"
  ON public.chats FOR INSERT
  WITH CHECK (auth.uid() = student_id OR auth.uid() = advisor_id);

CREATE POLICY "chats_update_participants"
  ON public.chats FOR UPDATE
  USING (auth.uid() = student_id OR auth.uid() = advisor_id);

-- chat_messages: only participants of that chat can read/write
CREATE POLICY "chat_messages_select"
  ON public.chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.chats c
      WHERE c.id = chat_id
        AND (c.student_id = auth.uid() OR c.advisor_id = auth.uid())
    )
  );

CREATE POLICY "chat_messages_insert"
  ON public.chat_messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.chats c
      WHERE c.id = chat_id
        AND c.is_active = true
        AND (c.student_id = auth.uid() OR c.advisor_id = auth.uid())
    )
  );

-- Enable Realtime for chat_messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chats;
