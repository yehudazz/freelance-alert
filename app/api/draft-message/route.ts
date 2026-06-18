import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  const openai = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY || 'placeholder',
  })
  // Rate limit: 30 per minute per IP
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

  // Verify auth session
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Parse request body
  let body: { leadId?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { leadId } = body
  if (!leadId || typeof leadId !== 'string') {
    return NextResponse.json(
      { error: 'leadId is required' },
      { status: 400 }
    )
  }

  // Fetch lead from DB, verify it belongs to the user
  const { data: lead, error: leadError } = await supabase
    .from('leads')
    .select('*')
    .eq('id', leadId)
    .eq('user_id', user.id)
    .single()

  if (leadError || !lead) {
    return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
  }

  // Only draft for leads with lead_score >= 6
  if ((lead.lead_score ?? 0) < 6) {
    return NextResponse.json(
      { error: 'Lead score too low to draft a message (minimum score: 6)' },
      { status: 422 }
    )
  }

  // Fetch user's profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('service_description, skills, bio')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    return NextResponse.json(
      { error: 'User profile not found' },
      { status: 404 }
    )
  }

  const { service_description, skills, bio } = profile

  // Call AI via OpenRouter
  let draftedMessage: string
  try {
    const response = await openai.chat.completions.create({
      model: 'anthropic/claude-haiku-4-5',
      max_tokens: 300,
      messages: [
        {
          role: 'user',
          content: `Write a short conversational Reddit DM reply to this post.
Post title: ${lead.post_title}
Post body: ${lead.post_body}
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

  // Generate subject line: "Re: {title truncated to 50 chars}"
  const truncatedTitle =
    lead.post_title.length > 50
      ? lead.post_title.slice(0, 50)
      : lead.post_title
  const draftedEmailSubject = `Re: ${truncatedTitle}`

  // Update lead with drafted_message and drafted_email_subject
  const { error: updateError } = await supabase
    .from('leads')
    .update({
      drafted_message: draftedMessage,
      drafted_email_subject: draftedEmailSubject,
    })
    .eq('id', leadId)
    .eq('user_id', user.id)

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
