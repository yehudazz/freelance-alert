import OpenAI from 'openai'
import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { rateLimit } from '@/lib/rate-limit'

interface ScoreResult {
  score: number
  score_reason: string
  has_budget_mentioned: boolean
  budget_amount: string | null
  urgency_level: 'low' | 'medium' | 'high'
}

export async function POST(request: NextRequest) {
  const headersList = await headers()

  // Accept cron secret OR user session
  const cronSecret = headersList.get('x-cron-secret')
  const isCron =
    cronSecret != null &&
    process.env.CRON_SECRET != null &&
    cronSecret === process.env.CRON_SECRET

  if (!isCron) {
    // Rate limit non-cron requests by IP
    const ip =
      headersList.get('x-forwarded-for')?.split(',')[0].trim() ??
      headersList.get('x-real-ip') ??
      'unknown'
    const rateLimitResult = rateLimit(`score-lead:${ip}`, 30)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }
  }

  // Parse and validate request body
  let leadId: string
  let bodyUserId: string | undefined
  try {
    const body = await request.json()
    if (!body.leadId || typeof body.leadId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid request body: leadId is required' },
        { status: 400 }
      )
    }
    leadId = body.leadId
    bodyUserId = typeof body.userId === 'string' ? body.userId : undefined
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON in request body' },
      { status: 400 }
    )
  }

  let lead: Record<string, unknown>
  let profile: { service_description?: string | null; skills?: string[] | null }

  if (isCron) {
    if (!bodyUserId) {
      return NextResponse.json({ error: 'userId required for cron requests' }, { status: 400 })
    }
    const admin = createAdminClient()
    const { data: leadData, error: leadError } = await admin
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .eq('user_id', bodyUserId)
      .single()
    if (leadError || !leadData) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }
    lead = leadData

    const { data: profileData, error: profileError } = await admin
      .from('profiles')
      .select('service_description, skills')
      .eq('id', bodyUserId)
      .single()
    if (profileError || !profileData) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }
    profile = profileData
  } else {
    // Verify auth session
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: leadData, error: leadError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .eq('user_id', user.id)
      .single()
    if (leadError || !leadData) {
      return NextResponse.json({ error: 'Lead not found or access denied' }, { status: 404 })
    }
    lead = leadData

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('service_description, skills')
      .eq('id', user.id)
      .single()
    if (profileError || !profileData) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }
    profile = profileData
  }

  const serviceDescription = profile.service_description ?? 'Not specified'
  const skills =
    profile.skills && profile.skills.length > 0
      ? profile.skills.join(', ')
      : 'Not specified'

  const platform = (lead.platform as string) === 'hackernews' ? 'Hacker News' : 'Reddit'

  // Build the prompt for Claude
  const prompt = `You are evaluating a ${platform} post to determine if it represents a freelance hiring opportunity.

FREELANCER PROFILE:
Service Description: ${serviceDescription}
Skills: ${skills}

POST:
Title: ${lead.post_title as string}
Body: ${lead.post_body as string}

Analyze this post and return a JSON object with the following fields:
- score: integer from 1 to 10 (1 = very unlikely to be a hiring opportunity, 10 = very strong hiring signal)
- score_reason: brief explanation (1-2 sentences) of why you assigned this score
- has_budget_mentioned: boolean — true if any budget, price, rate, or payment amount is mentioned
- budget_amount: string or null — if a budget is mentioned, extract it as a string (e.g. "$500", "$50/hr", "€1000"); otherwise null
- urgency_level: one of "low", "medium", or "high" — how urgently the poster seems to need help

Scoring criteria:
1. Is the person actually looking to hire someone? (not just asking for free advice)
2. Do they mention a budget or willingness to pay?
3. Is there urgency (deadlines, ASAP language, time-sensitive context)?
4. Is the request specific enough to act on?
5. Does the request match the freelancer's service description and skills?

Respond with ONLY the raw JSON object — no markdown, no code fences, no explanation.`

  // Call AI via OpenRouter
  const client = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY || 'placeholder',
  })

  let scoreResult: ScoreResult
  try {
    const message = await client.chat.completions.create({
      model: 'anthropic/claude-haiku-4-5',
      max_tokens: 512,
      messages: [{ role: 'user', content: prompt }],
    })

    const rawText = message.choices[0]?.message?.content ?? ''

    scoreResult = JSON.parse(rawText) as ScoreResult

    // Validate required fields
    if (
      typeof scoreResult.score !== 'number' ||
      scoreResult.score < 1 ||
      scoreResult.score > 10 ||
      typeof scoreResult.score_reason !== 'string' ||
      typeof scoreResult.has_budget_mentioned !== 'boolean' ||
      !['low', 'medium', 'high'].includes(scoreResult.urgency_level)
    ) {
      throw new Error('Claude returned unexpected JSON shape')
    }
  } catch (err) {
    console.error('Claude scoring error:', err)
    return NextResponse.json(
      { error: 'Failed to score lead with AI' },
      { status: 500 }
    )
  }

  // Update the lead in the database
  const userId = isCron ? bodyUserId! : (lead as { user_id: string }).user_id
  const db = isCron ? createAdminClient() : await createClient()
  const { error: updateError } = await db
    .from('leads')
    .update({
      lead_score: scoreResult.score,
      score_reason: scoreResult.score_reason,
      has_budget_mentioned: scoreResult.has_budget_mentioned,
      budget_amount: scoreResult.budget_amount ?? null,
      urgency_level: scoreResult.urgency_level,
    })
    .eq('id', leadId)
    .eq('user_id', userId)

  if (updateError) {
    console.error('DB update error:', updateError)
    return NextResponse.json(
      { error: 'Failed to save scoring result' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    leadId,
    score: scoreResult.score,
    score_reason: scoreResult.score_reason,
    has_budget_mentioned: scoreResult.has_budget_mentioned,
    budget_amount: scoreResult.budget_amount,
    urgency_level: scoreResult.urgency_level,
  })
}
