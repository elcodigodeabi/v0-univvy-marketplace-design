import "server-only"
import { createServiceClient } from "@/lib/supabase/service"

export type NotificationType =
  | "booking_confirmed"
  | "booking_cancelled"
  | "payment_received"
  | "payment_released"
  | "new_message"
  | "new_review"
  | "dispute_opened"
  | "dispute_resolved"
  | "system"

interface CreateNotificationParams {
  userId: string
  type: NotificationType
  title: string
  body: string
  data?: Record<string, unknown>
}

/**
 * Inserts a notification row using the service-role client.
 * The `notifications` table only has SELECT/UPDATE RLS policies for the
 * owning user, so writes (which often target a *different* user, e.g.
 * notifying the advisor about the student's payment) must go through the
 * service role. Never expose this helper to client components.
 */
export async function createNotification(params: CreateNotificationParams) {
  const admin = createServiceClient()
  const { error } = await admin.from("notifications").insert({
    user_id: params.userId,
    type: params.type,
    title: params.title,
    body: params.body,
    data: params.data ?? {},
  })

  if (error) {
    console.error("[v0] Error creating notification:", error)
  }
}

export async function createNotifications(items: CreateNotificationParams[]) {
  await Promise.all(items.map((item) => createNotification(item)))
}
