-- Reseñas y reportes de seguridad de sesiones completadas
ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE UNIQUE INDEX IF NOT EXISTS reviews_one_per_booking_reviewer
  ON public.reviews (booking_id, reviewer_id);

CREATE TABLE IF NOT EXISTS public.advisor_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reported_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL CHECK (reason IN ('estafa', 'acoso', 'falta_respeto', 'incumplimiento', 'otro')),
  details TEXT NOT NULL CHECK (char_length(trim(details)) >= 10),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'under_review', 'resolved', 'dismissed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (booking_id, reporter_id)
);

ALTER TABLE public.advisor_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "reports_select_own" ON public.advisor_reports;
CREATE POLICY "reports_select_own" ON public.advisor_reports FOR SELECT
  TO authenticated USING (auth.uid() = reporter_id);
DROP POLICY IF EXISTS "reports_insert_own" ON public.advisor_reports;
CREATE POLICY "reports_insert_own" ON public.advisor_reports FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = reporter_id);

CREATE INDEX IF NOT EXISTS idx_advisor_reports_reported ON public.advisor_reports(reported_id);
CREATE INDEX IF NOT EXISTS idx_advisor_reports_status ON public.advisor_reports(status);

CREATE OR REPLACE FUNCTION public.refresh_advisor_rating()
RETURNS TRIGGER AS $$
DECLARE target_advisor UUID;
BEGIN
  target_advisor := COALESCE(NEW.reviewed_id, OLD.reviewed_id);
  UPDATE public.profiles
  SET rating = COALESCE((SELECT ROUND(AVG(r.rating)::numeric, 2) FROM public.reviews r WHERE r.reviewed_id = target_advisor), 0),
      total_reviews = (SELECT COUNT(*) FROM public.reviews r WHERE r.reviewed_id = target_advisor),
      updated_at = NOW()
  WHERE id = target_advisor;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_review_changed ON public.reviews;
CREATE TRIGGER on_review_changed
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.refresh_advisor_rating();

DROP POLICY IF EXISTS "reviews_insert_completed_booking" ON public.reviews;
CREATE POLICY "reviews_insert_completed_booking" ON public.reviews FOR INSERT
  TO authenticated WITH CHECK (
    auth.uid() = reviewer_id
    AND reviewer_id <> reviewed_id
    AND EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.id = booking_id
        AND b.status = 'completed'
        AND b.student_id = reviewer_id
        AND b.advisor_id = reviewed_id
    )
  );

DROP POLICY IF EXISTS "reviews_update_own" ON public.reviews;
CREATE POLICY "reviews_update_own" ON public.reviews FOR UPDATE
  TO authenticated USING (auth.uid() = reviewer_id) WITH CHECK (auth.uid() = reviewer_id);

GRANT SELECT, INSERT, UPDATE ON public.advisor_reports TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.reviews TO authenticated;

SELECT 'reviews_reports_ready' AS status;

