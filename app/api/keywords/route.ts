import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rate-limit'
import { NextRequest, NextResponse } from 'next/server'

const MAX_KEYWORDS = 50

export async function GET() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: keywords, error } = await supabase
    .from('keywords')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch keywords' }, { status: 500 })
  }

  return NextResponse.json({ keywords })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { success } = rateLimit(`keywords:${user.id}`, 20)
  if (!success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { keyword } = body as { keyword?: unknown }

  if (typeof keyword !== 'string' || keyword.trim().length === 0) {
    return NextResponse.json({ error: 'keyword must be a non-empty string' }, { status: 400 })
  }

  const trimmed = keyword.trim()

  if (trimmed.length > 100) {
    return NextResponse.json({ error: 'keyword must be 100 characters or fewer' }, { status: 400 })
  }

  const { count, error: countError } = await supabase
    .from('keywords')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  if (countError) {
    return NextResponse.json({ error: 'Failed to check keyword count' }, { status: 500 })
  }

  if ((count ?? 0) >= MAX_KEYWORDS) {
    return NextResponse.json(
      { error: `You have reached the maximum of ${MAX_KEYWORDS} keywords` },
      { status: 422 }
    )
  }

  const { data: inserted, error: insertError } = await supabase
    .from('keywords')
    .insert({ user_id: user.id, keyword: trimmed })
    .select()
    .single()

  if (insertError) {
    return NextResponse.json({ error: 'Failed to create keyword' }, { status: 500 })
  }

  return NextResponse.json({ keyword: inserted }, { status: 201 })
}
