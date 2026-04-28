'use server'

import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { put } from '@vercel/blob'
import { revalidatePath } from 'next/cache'

// Phone number censorship regex — matches common formats
const PHONE_REGEX = /(\+?[\d\s\-().]{7,}(?:\d[\s\-.]?){6,}\d)/g

function censorPhoneNumbers(text: string): { censored: boolean; text: string } {
  const matches = text.match(PHONE_REGEX)
  if (!matches) return { censored: false, text }
  const cleaned = text.replace(
    PHONE_REGEX,
    '[Univvy no permite compartir números de teléfono. Usa el chat de la plataforma para comunicarte.]'
  )
  return { censored: true, text: cleaned }
}

/** Create a chat room for a confirmed booking (called after payment confirmed) */
export async function createChatForBooking(bookingId: string) {
  const supabase = createServiceClient()

  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .select('id, student_id, advisor_id, scheduled_at, duration_minutes, status')
    .eq('id', bookingId)
    .single()

  if (bookingError || !booking) {
    return { error: 'Booking not found' }
  }

  if (booking.status !== 'confirmed') {
    return { error: 'Chat only available for confirmed bookings' }
  }

  const opensAt = new Date(booking.scheduled_at)
  const closesAt = new Date(opensAt.getTime() + booking.duration_minutes * 60 * 1000)

  const { data: chat, error } = await supabase
    .from('chats')
    .upsert(
      {
        booking_id: bookingId,
        student_id: booking.student_id,
        advisor_id: booking.advisor_id,
        is_active: true,
        opens_at: opensAt.toISOString(),
        closes_at: closesAt.toISOString(),
      },
      { onConflict: 'booking_id' }
    )
    .select()
    .single()

  if (error) return { error: error.message }
  return { chat }
}

/** Get all active/recent chats for the current user */
export async function getUserChats() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated', chats: [] }

  const { data: chats, error } = await supabase
    .from('chats')
    .select(`
      id, booking_id, is_active, opens_at, closes_at, created_at,
      student:profiles!chats_student_id_fkey(id, full_name, avatar_url),
      advisor:profiles!chats_advisor_id_fkey(id, full_name, avatar_url),
      bookings(id, subject, scheduled_at, duration_minutes)
    `)
    .or(`student_id.eq.${user.id},advisor_id.eq.${user.id}`)
    .order('created_at', { ascending: false })

  if (error) return { error: error.message, chats: [] }
  return { chats: chats ?? [] }
}

/** Get a single chat with its messages */
export async function getChatWithMessages(chatId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: chat, error: chatError } = await supabase
    .from('chats')
    .select(`
      id, booking_id, is_active, opens_at, closes_at,
      student_id, advisor_id,
      student:profiles!chats_student_id_fkey(id, full_name, avatar_url),
      advisor:profiles!chats_advisor_id_fkey(id, full_name, avatar_url),
      bookings(id, subject, scheduled_at, duration_minutes)
    `)
    .eq('id', chatId)
    .single()

  if (chatError || !chat) return { error: 'Chat not found' }

  // Check if chat should be auto-closed
  const now = new Date()
  if (chat.is_active && new Date(chat.closes_at) <= now) {
    await supabase
      .from('chats')
      .update({ is_active: false, updated_at: now.toISOString() })
      .eq('id', chatId)
    chat.is_active = false
  }

  const { data: messages, error: messagesError } = await supabase
    .from('chat_messages')
    .select(`
      id, chat_id, sender_id, content, message_type,
      file_url, file_name, file_size, is_censored, created_at,
      sender:profiles!chat_messages_sender_id_fkey(id, full_name, avatar_url)
    `)
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true })

  if (messagesError) return { error: messagesError.message }
  return { chat, messages: messages ?? [], currentUserId: user.id }
}

/** Send a text message */
export async function sendMessage(chatId: string, content: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Check chat is active
  const { data: chat } = await supabase
    .from('chats')
    .select('is_active, closes_at, student_id, advisor_id')
    .eq('id', chatId)
    .single()

  if (!chat) return { error: 'Chat not found' }
  if (!chat.is_active || new Date(chat.closes_at) <= new Date()) {
    return { error: 'Este chat ha finalizado' }
  }
  if (chat.student_id !== user.id && chat.advisor_id !== user.id) {
    return { error: 'No tienes acceso a este chat' }
  }

  // Censor phone numbers
  const { censored, text: processedContent } = censorPhoneNumbers(content.trim())

  const { data: message, error } = await supabase
    .from('chat_messages')
    .insert({
      chat_id: chatId,
      sender_id: user.id,
      content: processedContent,
      message_type: censored ? 'censored' : 'text',
      is_censored: censored,
    })
    .select(`
      id, chat_id, sender_id, content, message_type, is_censored, created_at,
      sender:profiles!chat_messages_sender_id_fkey(id, full_name, avatar_url)
    `)
    .single()

  if (error) return { error: error.message }
  revalidatePath(`/mensajes/${chatId}`)
  return { message }
}

/** Upload a file and send as message */
export async function sendFileMessage(chatId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const file = formData.get('file') as File
  if (!file) return { error: 'No file provided' }

  // 10MB limit
  if (file.size > 10 * 1024 * 1024) {
    return { error: 'El archivo no puede superar 10MB' }
  }

  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
  ]
  if (!allowedTypes.includes(file.type)) {
    return { error: 'Tipo de archivo no permitido' }
  }

  // Check chat is active
  const { data: chat } = await supabase
    .from('chats')
    .select('is_active, closes_at, student_id, advisor_id')
    .eq('id', chatId)
    .single()

  if (!chat?.is_active || new Date(chat.closes_at) <= new Date()) {
    return { error: 'Este chat ha finalizado' }
  }

  const ext = file.name.split('.').pop()
  const path = `chats/${chatId}/${user.id}/${Date.now()}.${ext}`

  const blob = await put(path, file, { access: 'public' })

  const messageType = file.type.startsWith('image/')
    ? 'image'
    : file.type === 'application/pdf'
    ? 'pdf'
    : 'document'

  const { data: message, error } = await supabase
    .from('chat_messages')
    .insert({
      chat_id: chatId,
      sender_id: user.id,
      content: file.name,
      message_type: messageType,
      file_url: blob.url,
      file_name: file.name,
      file_size: file.size,
    })
    .select(`
      id, chat_id, sender_id, content, message_type,
      file_url, file_name, file_size, is_censored, created_at,
      sender:profiles!chat_messages_sender_id_fkey(id, full_name, avatar_url)
    `)
    .single()

  if (error) return { error: error.message }
  revalidatePath(`/mensajes/${chatId}`)
  return { message }
}

/** Get or create the chat for a booking */
export async function getOrCreateChatByBooking(bookingId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: existing } = await supabase
    .from('chats')
    .select('id')
    .eq('booking_id', bookingId)
    .single()

  if (existing) return { chatId: existing.id }

  const result = await createChatForBooking(bookingId)
  if (result.error) return { error: result.error }
  return { chatId: result.chat?.id }
}
