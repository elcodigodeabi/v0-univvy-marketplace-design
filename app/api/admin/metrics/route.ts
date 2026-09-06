import { NextResponse } from "next/server"
import { getAdminUser } from "@/lib/auth/require-admin"
import { createServiceClient } from "@/lib/supabase/service"

interface MonthlyBucket {
  key: string
  label: string
  classes: number
}

function monthLabel(date: Date) {
  return date.toLocaleDateString("es-ES", { month: "short" }).replace(".", "")
}

export async function GET() {
  const admin = await getAdminUser()
  if (!admin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }

  const db = createServiceClient()

  const now = new Date()
  const startOfYear = new Date(now.getFullYear(), 0, 1).toISOString()

  const [
    { data: profiles, error: profilesError },
    { data: bookings, error: bookingsError },
    { data: payments, error: paymentsError },
    { data: reviews, error: reviewsError },
  ] = await Promise.all([
    db.from("profiles").select("id, full_name, email, role, rating, total_reviews, sesiones_completadas, avatar_url"),
    db
      .from("bookings")
      .select("id, advisor_id, status, session_date, created_at")
      .gte("created_at", startOfYear),
    db
      .from("payments")
      .select("id, advisor_id, amount_cents, platform_fee_cents, advisor_amount_cents, status, created_at, escrow_released_at"),
    db.from("reviews").select("reviewed_id, rating"),
  ])

  if (profilesError || bookingsError || paymentsError || reviewsError) {
    return NextResponse.json(
      { error: profilesError?.message || bookingsError?.message || paymentsError?.message || reviewsError?.message },
      { status: 500 }
    )
  }

  const students = (profiles || []).filter((p) => p.role === "alumno")
  const advisors = (profiles || []).filter((p) => p.role === "asesor")
  const admins = (profiles || []).filter((p) => p.role === "administrador")

  const completedBookings = (bookings || []).filter((b) => b.status === "completed")

  const thisYear = now.getFullYear()
  const thisMonth = now.getMonth()
  const classesThisMonth = completedBookings.filter((b) => {
    const d = new Date(b.session_date)
    return d.getFullYear() === thisYear && d.getMonth() === thisMonth
  }).length
  const classesThisYear = completedBookings.filter((b) => new Date(b.session_date).getFullYear() === thisYear).length

  // Monthly breakdown (last 12 months) for the simple bar chart
  const buckets: MonthlyBucket[] = []
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    buckets.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: monthLabel(d), classes: 0 })
  }
  const bucketIndex = new Map(buckets.map((b, idx) => [b.key, idx]))
  for (const booking of completedBookings) {
    const d = new Date(booking.session_date)
    const key = `${d.getFullYear()}-${d.getMonth()}`
    const idx = bucketIndex.get(key)
    if (idx !== undefined) buckets[idx].classes += 1
  }

  // Revenue: platform_fee_cents is Univvy's cut; advisor_amount_cents is what got paid to advisors.
  const releasedPayments = (payments || []).filter((p) => p.status === "released")
  const platformRevenueCents = releasedPayments.reduce((sum, p) => sum + (p.platform_fee_cents || 0), 0)
  const advisorPaidCents = releasedPayments.reduce((sum, p) => sum + (p.advisor_amount_cents || 0), 0)
  const grossVolumeCents = releasedPayments.reduce((sum, p) => sum + (p.amount_cents || 0), 0)

  const platformRevenueThisMonthCents = releasedPayments
    .filter((p) => {
      const d = new Date(p.escrow_released_at || p.created_at)
      return d.getFullYear() === thisYear && d.getMonth() === thisMonth
    })
    .reduce((sum, p) => sum + (p.platform_fee_cents || 0), 0)

  // Advisor popularity: completed classes + average rating
  const reviewsByAdvisor = new Map<string, { total: number; count: number }>()
  for (const r of reviews || []) {
    const entry = reviewsByAdvisor.get(r.reviewed_id) || { total: 0, count: 0 }
    entry.total += r.rating
    entry.count += 1
    reviewsByAdvisor.set(r.reviewed_id, entry)
  }

  const classesByAdvisor = new Map<string, number>()
  for (const b of completedBookings) {
    classesByAdvisor.set(b.advisor_id, (classesByAdvisor.get(b.advisor_id) || 0) + 1)
  }

  const topAdvisors = advisors
    .map((advisor) => {
      const ratingEntry = reviewsByAdvisor.get(advisor.id)
      const avgRating = ratingEntry ? ratingEntry.total / ratingEntry.count : advisor.rating || 0
      const completedClasses = classesByAdvisor.get(advisor.id) || advisor.sesiones_completadas || 0
      // Popularity score: weight completed classes higher, rating as a multiplier (0.6–1.0 scale)
      const score = completedClasses * (0.6 + Math.min(avgRating, 5) / 12.5)
      return {
        id: advisor.id,
        full_name: advisor.full_name,
        avatar_url: advisor.avatar_url,
        rating: Number(avgRating.toFixed(2)),
        totalReviews: ratingEntry?.count || advisor.total_reviews || 0,
        completedClasses,
        score,
      }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)

  return NextResponse.json({
    totals: {
      students: students.length,
      advisors: advisors.length,
      admins: admins.length,
      totalUsers: profiles?.length || 0,
    },
    classes: {
      thisMonth: classesThisMonth,
      thisYear: classesThisYear,
      total: completedBookings.length,
      monthly: buckets,
    },
    revenue: {
      platformRevenueCents,
      platformRevenueThisMonthCents,
      advisorPaidCents,
      grossVolumeCents,
    },
    topAdvisors,
  })
}
