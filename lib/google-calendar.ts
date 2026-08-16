import "server-only"

/**
 * Google Calendar + Meet integration (no SDK, direct REST calls).
 *
 * Required env vars (set manually, like Stripe):
 * - GOOGLE_CLIENT_ID
 * - GOOGLE_CLIENT_SECRET
 *
 * The redirect URI is derived from the request origin at runtime:
 * {origin}/api/google/callback — add it to the OAuth client's authorized
 * redirect URIs in Google Cloud Console.
 */

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
const CALENDAR_EVENTS_URL =
  "https://www.googleapis.com/calendar/v3/calendars/primary/events"

const SCOPE = "https://www.googleapis.com/auth/calendar.events"

function getClientCredentials() {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    throw new Error(
      "GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET no configuradas. Agrégalas en las variables de entorno."
    )
  }
  return { clientId, clientSecret }
}

/** Build the OAuth consent URL for an advisor */
export function getGoogleAuthUrl(redirectUri: string, state: string): string {
  const { clientId } = getClientCredentials()
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: SCOPE,
    access_type: "offline", // required to get a refresh_token
    prompt: "consent", // force refresh_token even on re-auth
    state,
  })
  return `${GOOGLE_AUTH_URL}?${params.toString()}`
}

/** Exchange the authorization code for tokens */
export async function exchangeCodeForTokens(
  code: string,
  redirectUri: string
): Promise<{ refresh_token?: string; access_token: string }> {
  const { clientId, clientSecret } = getClientCredentials()
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Error intercambiando código de Google: ${err}`)
  }
  return res.json()
}

/** Get a fresh access token from a stored refresh token */
export async function getAccessToken(refreshToken: string): Promise<string> {
  const { clientId, clientSecret } = getClientCredentials()
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Error refrescando token de Google: ${err}`)
  }
  const data = await res.json()
  return data.access_token
}

export interface CreateMeetEventParams {
  refreshToken: string
  summary: string
  description?: string
  /** ISO datetime */
  startDateTime: string
  /** ISO datetime */
  endDateTime: string
  /** Attendee emails (student + advisor) */
  attendees: string[]
  timeZone?: string
}

export interface MeetEventResult {
  eventId: string
  meetLink: string | null
  htmlLink: string
}

/**
 * Create a Google Calendar event with an auto-generated Meet link.
 * The event lands on the advisor's primary calendar; attendees get an
 * email invitation from Google automatically.
 */
export async function createMeetEvent(
  params: CreateMeetEventParams
): Promise<MeetEventResult> {
  const accessToken = await getAccessToken(params.refreshToken)

  const res = await fetch(
    `${CALENDAR_EVENTS_URL}?conferenceDataVersion=1&sendUpdates=all`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        summary: params.summary,
        description: params.description || "",
        start: {
          dateTime: params.startDateTime,
          timeZone: params.timeZone || "Europe/Madrid",
        },
        end: {
          dateTime: params.endDateTime,
          timeZone: params.timeZone || "Europe/Madrid",
        },
        attendees: params.attendees.map((email) => ({ email })),
        conferenceData: {
          createRequest: {
            requestId: `univvy-${Date.now()}`,
            conferenceSolutionKey: { type: "hangoutsMeet" },
          },
        },
        reminders: { useDefault: true },
      }),
    }
  )

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Error creando evento en Google Calendar: ${err}`)
  }

  const event = await res.json()
  const meetLink: string | null =
    event.hangoutLink ||
    event.conferenceData?.entryPoints?.find(
      (e: { entryPointType: string }) => e.entryPointType === "video"
    )?.uri ||
    null

  return { eventId: event.id, meetLink, htmlLink: event.htmlLink }
}

/** Delete a calendar event (e.g. when a booking is cancelled) */
export async function deleteCalendarEvent(
  refreshToken: string,
  eventId: string
): Promise<void> {
  const accessToken = await getAccessToken(refreshToken)
  await fetch(`${CALENDAR_EVENTS_URL}/${eventId}?sendUpdates=all`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
  })
}
