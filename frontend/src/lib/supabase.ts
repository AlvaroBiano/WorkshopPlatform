import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables')
}

export const supabase = createClient(
  supabaseUrl || 'http://localhost:54321',
  supabaseAnonKey || 'placeholder-key'
)

// Auth helpers
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Database helpers
export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()
  return { data, error }
}

export async function getUserProducts(userId: string) {
  const { data, error } = await supabase
    .from('product_access')
    .select(`
      *,
      products (
        id,
        title,
        slug,
        description,
        cover_url,
        price_cents,
        type
      )
    `)
    .eq('user_id', userId)
  return { data, error }
}

export async function getProductProgress(userId: string, productId: string) {
  const { data, error } = await supabase
    .from('progress')
    .select(`
      *,
      lessons (
        id,
        module_id,
        title,
        duration_sec
      )
    `)
    .eq('user_id', userId)
    .eq('lessons.module_id', productId)
  return { data, error }
}

export async function updateLessonProgress(
  userId: string,
  lessonId: string,
  watchedSec: number,
  completed: boolean
) {
  const { data, error } = await supabase
    .from('progress')
    .upsert({
      user_id: userId,
      lesson_id: lessonId,
      watched_sec: watchedSec,
      completed,
      last_seen_at: new Date().toISOString(),
    })
  return { data, error }
}

export async function getNotifications(userId: string, unreadOnly = false) {
  let query = supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20)

  if (unreadOnly) {
    query = query.eq('read', false)
  }

  const { data, error } = await query
  return { data, error }
}

export async function markNotificationRead(notificationId: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId)
  return { error }
}

// Device helpers
export async function getUserDevices(userId: string) {
  const { data, error } = await supabase
    .from('devices')
    .select('*')
    .eq('user_id', userId)
    .order('registered_at', { ascending: false })
  return { data, error }
}

// Admin helpers
export async function getAllUsers(role?: string) {
  let query = supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })

  if (role) {
    query = query.eq('role', role)
  }

  const { data, error } = await query
  return { data, error }
}

export async function getPendingOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      users (full_name, email, whatsapp),
      products (title, price_cents)
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
  return { data, error }
}

export async function approveOrder(orderId: string, approvedBy: string) {
  const { data: order } = await supabase
    .from('orders')
    .select('user_id, product_id')
    .eq('id', orderId)
    .single()

  if (!order) return { error: 'Order not found' }

  // Update order status
  const { error: orderError } = await supabase
    .from('orders')
    .update({
      status: 'approved',
      approved_at: new Date().toISOString(),
      approved_by: approvedBy,
    })
    .eq('id', orderId)

  if (orderError) return { error: orderError }

  // Grant product access
  const { error: accessError } = await supabase
    .from('product_access')
    .upsert({
      user_id: order.user_id,
      product_id: order.product_id,
      granted_by: approvedBy,
    }, {
      onConflict: 'user_id,product_id',
    })

  if (accessError) return { error: accessError }

  // Create welcome notification
  const { error: notifError } = await supabase
    .from('notifications')
    .insert({
      user_id: order.user_id,
      title: '🎉 Acesso Liberado!',
      body: 'Seu acesso ao workshop foi liberado! Bem-vindo(a).',
      type: 'access_granted',
      link_url: '/dashboard',
    })

  return { error: notifError }
}

export async function getAffiliateStats(affiliateId: string) {
  // Total de cliques
  const { count: totalClicks } = await supabase
    .from('affiliate_clicks')
    .select('*', { count: 'exact' })
    .eq('affiliate_id', affiliateId)

  // Total de conversoes
  const { data: conversions } = await supabase
    .from('affiliate_conversions')
    .select('commission_cents, status')
    .eq('affiliate_id', affiliateId)

  const totalEarned = conversions?.reduce((acc, c) => c.status === 'paid' ? acc + c.commission_cents : acc, 0) || 0
  const pendingCommission = conversions?.reduce((acc, c) => c.status === 'pending' ? acc + c.commission_cents : acc, 0) || 0

  return {
    total_clicks: totalClicks || 0,
    total_conversions: conversions?.length || 0,
    total_earned_cents: totalEarned,
    pending_commission_cents: pendingCommission,
  }
}

// Helper to calculate course progress percentage
export function calculateProgress(lessons: any[], completedLessons: any[]): number {
  if (lessons.length === 0) return 0
  const completed = completedLessons.filter(cl => cl.completed).length
  return Math.round((completed / lessons.length) * 100)
}