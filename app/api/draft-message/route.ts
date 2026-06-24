import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  const openai = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY || 'placeholder',
  })

  // Accept cron secret OR user session
  const cronSecret = request.headers.get('x-cron-secret')
  const isCron =
    cronSecret != null &&
    process.env.CRON_SECRET != null &&
    cronSecret === process.env.CRON_SECRET

  if (!isCron) {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      request.headers.get('x-real-ip') ??
      'unknown'
    const { success } = rateLimit(ip, 30)
    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }
  }

  // Parse request body
  let body: { leadId?: string; userId?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { leadId, userId: bodyUserId } = body
  if (!leadId || typeof leadId !== 'string') {
    return NextResponse.json({ error: 'leadId is required' }, { status: 400 })
  }

  let lead: Record<string, unknown>
  let profile: { service_description?: string | null; skills?: string[] | null; bio?: string | null }
  let resolvedUserId: string

  if (isCron) {
    if (!bodyUserId || typeof bodyUserId !== 'string') {
      return NextResponse.json({ error: 'userId required for cron requests' }, { status: 400 })
    }
    resolvedUserId = bodyUserId
    const admin = createAdminClient()

    const { data: leadData, error: leadError } = await admin
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .eq('user_id', resolvedUserId)
      .single()
    if (leadError || !leadData) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }
    lead = leadData

    const { data: profileData, error: profileError } = await admin
      .from('profiles')
      .select('service_description, skills, bio')
      .eq('id', resolvedUserId)
      .single()
    if (profileError || !profileData) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }
    profile = profileData
  } else {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    resolvedUserId = user.id

    const { data: leadData, error: leadError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .eq('user_id', resolvedUserId)
      .single()
    if (leadError || !leadData) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }
    lead = leadData

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('service_description, skills, bio')
      .eq('id', resolvedUserId)
      .single()
    if (profileError || !profileData) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }
    profile = profileData
  }

  // Only draft for leads with lead_score >= 6
  if (((lead.lead_score as number) ?? 0) < 6) {
    return NextResponse.json(
      { error: 'Lead score too low to draft a message (minimum score: 6)' },
      { status: 422 }
    )
  }

  const { service_description, skills, bio } = profile
  const platform = (lead.platform as string) === 'hackernews' ? 'Hacker News' : 'Reddit'

  // Call AI via OpenRouter
  let draftedMessage: string
  try {
    const response = await openai.chat.completions.create({
      model: 'anthropic/claude-haiku-4-5',
      max_tokens: 300,
      messages: [
        {
          role: 'user',
          content: `Write a short outreach reply to this ${platform} post from someone looking to hire.
Post title: ${lead.post_title as string}
Post body: ${lead.post_body as string}
About me: ${service_description ?? ''}. Skills: ${(skills ?? []).join(', ')}. Bio: ${bio ?? ''}

Requirements:
- Acknowledge specifically what the poster said
- Briefly explain who I am
- Mention 1-2 relevant matching skills
- End with a simple offer to chat
- Sound human, not like a template
- Under 150 words
- No subject line needed`,
        },
      ],
    })

    draftedMessage = response.choices[0]?.message?.content ?? ''
    if (!draftedMessage) {
      throw new Error('Empty response from AI')
    }
  } catch (err) {
    console.error('Anthropic API error:', err)
    return NextResponse.json(
      { error: 'Failed to generate draft message' },
      { status: 502 }
    )
  }

  const postTitle = lead.post_title as string
  const truncatedTitle = postTitle.length > 50 ? postTitle.slice(0, 50) : postTitle
  const draftedEmailSubject = `Re: ${truncatedTitle}`

  // Update lead with drafted_message and drafted_email_subject
  const db = isCron ? createAdminClient() : await createClient()
  const { error: updateError } = await db
    .from('leads')
    .update({
      drafted_message: draftedMessage,
      drafted_email_subject: draftedEmailSubject,
    })
    .eq('id', leadId)
    .eq('user_id', resolvedUserId)

  if (updateError) {
    console.error('Failed to update lead:', updateError)
    return NextResponse.json(
      { error: 'Failed to save drafted message' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    drafted_message: draftedMessage,
    drafted_email_subject: draftedEmailSubject,
  })
}
