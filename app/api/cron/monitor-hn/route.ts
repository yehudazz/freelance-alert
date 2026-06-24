import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

interface HNHit {
  objectID: string
  title: string
  story_text: string | null
  author: string
  created_at_i: number
  url: string | null
  points: number
  num_comments: number
}

interface AlgoliaResponse {
  hits: HNHit[]
}

async function searchHN(query: string, since: number): Promise<HNHit[]> {
  const url = `https://hn.algolia.com/api/v1/search_by_date?query=${encodeURIComponent(query)}&tags=story&numericFilters=created_at_i>${since}&hitsPerPage=20`
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'FreelanceAlert/1.0' } })
    if (!res.ok) return []
    const data = (await res.json()) as AlgoliaResponse
    return data.hits ?? []
  } catch {
    return []
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  if (request.headers.get('authorization') !== 'Bearer ' + process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  let processedLeads = 0

  // Fetch active users
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id')
    .eq('subscription_status', 'active')

  if (profilesError || !profiles?.length) {
    return NextResponse.json({ success: true, processed: 0 })
  }

  const userIds = profiles.map((p) => p.id)

  const { data: keywordsRows } = await supabase
    .from('keywords')
    .select('user_id, keyword')
    .eq('is_active', true)
    .in('user_id', userIds)

  if (!keywordsRows?.length) {
    return NextResponse.json({ success: true, processed: 0 })
  }

  // Build per-user keyword map
  const userKeywordsMap: Record<string, string[]> = {}
  for (const row of keywordsRows) {
    if (!userKeywordsMap[row.user_id]) userKeywordsMap[row.user_id] = []
    userKeywordsMap[row.user_id].push(row.keyword)
  }

  const since = Math.floor(Date.now() / 1000) - 86_400 // last 24h
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  for (const userId of Object.keys(userKeywordsMap)) {
    const keywords = userKeywordsMap[userId]

    // Search HN for each keyword, dedupe by objectID
    const seen = new Set<string>()
    const allHits: HNHit[] = []

    for (const kw of keywords) {
      const hits = await searchHN(kw, since)
      for (const hit of hits) {
        if (!seen.has(hit.objectID)) {
          seen.add(hit.objectID)
          allHits.push(hit)
        }
      }
    }

    for (const hit of allHits) {
      // Skip if lead already exists for this user + post
      const { data: existing } = await supabase
        .from('leads')
        .select('id')
        .eq('user_id', userId)
        .eq('post_id', hit.objectID)
        .maybeSingle()

      if (existing) continue

      const postUrl = hit.url ?? `https://news.ycombinator.com/item?id=${hit.objectID}`

      const { data: newLead, error: insertError } = await supabase
        .from('leads')
        .insert({
          user_id: userId,
          platform: 'hackernews',
          post_id: hit.objectID,
          post_title: hit.title,
          post_body: hit.story_text ?? '',
          post_url: postUrl,
          author_username: hit.author,
          subreddit: null,
          lead_score: 0,
          urgency_level: 'low',
          status: 'new',
          found_at: new Date(hit.created_at_i * 1000).toISOString(),
        })
        .select('id')
        .single()

      if (insertError || !newLead) continue

      processedLeads++

      await Promise.allSettled([
        fetch(`${baseUrl}/api/score-lead`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ leadId: newLead.id }),
        }),
        fetch(`${baseUrl}/api/draft-message`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ leadId: newLead.id }),
        }),
      ])
    }
  }

  return NextResponse.json({ success: true, processed: processedLeads })
}
