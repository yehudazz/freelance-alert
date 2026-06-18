import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rate-limit'
import { NextRequest, NextResponse } from 'next/server'
import type { ProfileUpdate } from '@/types/database'

const ALLOWED_PATCH_FIELDS = [
  'full_name',
  'service_description',
  'skills',
  'bio',
  'notification_email',
  'notification_phone',
  'notify_via_email',
  'notify_via_sms',
] as const

type AllowedField = (typeof ALLOWED_PATCH_FIELDS)[number]

const STRING_MAX_LENGTHS: Partial<Record<AllowedField, number>> = {
  full_name: 100,
  service_description: 500,
  bio: 500,
}

export async function GET() {
  const supabase = await createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }

  return NextResponse.json({ profile })
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const identifier = `profile-patch:${session.user.id}`
  const { success, remaining } = rateLimit(identifier, 10)

  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: { 'X-RateLimit-Remaining': '0' },
      }
    )
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const updates: Partial<Record<AllowedField, string | string[] | boolean | null>> = {}
  const validationErrors: string[] = []

  for (const field of ALLOWED_PATCH_FIELDS) {
    if (!(field in body)) continue

    const value = body[field]

    // Boolean fields
    if (field === 'notify_via_email' || field === 'notify_via_sms') {
      if (typeof value !== 'boolean') {
        validationErrors.push(`${field} must be a boolean`)
        continue
      }
      updates[field] = value
      continue
    }

    // Array field
    if (field === 'skills') {
      if (
        !Array.isArray(value) ||
        !value.every((item) => typeof item === 'string')
      ) {
        validationErrors.push('skills must be an array of strings')
        continue
      }
      updates[field] = value
      continue
    }

    // Nullable string fields
    if (value === null) {
      updates[field] = null
      continue
    }

    if (typeof value !== 'string') {
      validationErrors.push(`${field} must be a string or null`)
      continue
    }

    const maxLength = STRING_MAX_LENGTHS[field]
    if (maxLength !== undefined && value.length > maxLength) {
      validationErrors.push(`${field} must be at most ${maxLength} characters`)
      continue
    }

    updates[field] = value
  }

  if (validationErrors.length > 0) {
    return NextResponse.json({ error: 'Validation failed', details: validationErrors }, { status: 422 })
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields provided' }, { status: 400 })
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .update(updates as ProfileUpdate)
    .eq('id', session.user.id)
    .select('*')
    .single()

  if (error) {
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }

  return NextResponse.json(
    { profile },
    { headers: { 'X-RateLimit-Remaining': String(remaining) } }
  )
}
