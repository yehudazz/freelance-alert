import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rate-limit'
import type { NextRequest } from 'next/server'

const VALID_STATUSES = ['new', 'viewed', 'sent', 'dismissed'] as const
type LeadStatus = typeof VALID_STATUSES[number]

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const { data: lead, error } = await supabase
    .from('leads')
    .select('*')
    .eq('id', id)
    .eq('user_id', session.user.id)
    .single()

  if (error || !lead) {
    return Response.json({ error: 'Lead not found' }, { status: 404 })
  }

  return Response.json(lead)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { success } = rateLimit(session.user.id)
  if (!success) {
    return Response.json({ error: 'Too many requests' }, { status: 429 })
  }

  let body: { status?: string; drafted_message?: string }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { status, drafted_message } = body

  if (status !== undefined) {
    if (!VALID_STATUSES.includes(status as LeadStatus)) {
      return Response.json(
        { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      )
    }
  }

  if (drafted_message !== undefined) {
    if (typeof drafted_message !== 'string' || drafted_message.length > 2000) {
      return Response.json(
        { error: 'drafted_message must be a string of at most 2000 characters' },
        { status: 400 }
      )
    }
  }

  if (status === undefined && drafted_message === undefined) {
    return Response.json({ error: 'No fields to update' }, { status: 400 })
  }

  const { id } = await params

  const updates: { status?: LeadStatus; drafted_message?: string } = {}
  if (status !== undefined) updates.status = status as LeadStatus
  if (drafted_message !== undefined) updates.drafted_message = drafted_message

  const { data: lead, error } = await supabase
    .from('leads')
    .update(updates)
    .eq('id', id)
    .eq('user_id', session.user.id)
    .select()
    .single()

  if (error || !lead) {
    return Response.json({ error: 'Lead not found' }, { status: 404 })
  }

  return Response.json(lead)
}
