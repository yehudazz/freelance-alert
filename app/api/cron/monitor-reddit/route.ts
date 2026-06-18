import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// ── Inline types ──────────────────────────────────────────────────────────────

interface RedditTokenCache {
  token: string
  expiresAt: number
}

interface RedditPost {
  id: string
  title: string
  selftext: string
  author: string
  subreddit: string
  permalink: string
  created_utc: number
  url: string
}

interface RedditApiResponse {
  data: {
    children: Array<{
      data: RedditPost
    }>
  }
}

interface ActiveUser {
  id: string
  reddit_username: string | null
  keywords: string[]
  subreddits: string[]
}

// ── Reddit OAuth token cache (module-level, lives for the duration of the cold start) ──

let tokenCache: RedditTokenCache | null = null

async function getRedditAccessToken(): Promise<string> {
  const now = Date.now()
  if (tokenCache && tokenCache.expiresAt > now + 60_000) {
    return tokenCache.token
  }

  const clientId = process.env.REDDIT_CLIENT_ID!
  const clientSecret = process.env.REDDIT_CLIENT_SECRET!
  const username = process.env.REDDIT_USERNAME!
  const password = process.env.REDDIT_PASSWORD!

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

  const response = await fetch('https://www.reddit.com/api/v1/access_token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'FreelanceAlert/1.0',
    },
    body: `grant_type=password&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`,
  })

  if (!response.ok) {
    throw new Error(`Reddit OAuth failed: ${response.status}`)
  }

  const data = (await response.json()) as { access_token: string; expires_in: number }
  tokenCache = {
    token: data.access_token,
    expiresAt: now + data.expires_in * 1000,
  }
  return tokenCache.token
}

// ── Exponential backoff fetch ─────────────────────────────────────────────────

async function fetchWithBackoff(url: string, options: RequestInit, maxRetries = 3): Promise<Response> {
  let attempt = 0
  while (true) {
    const response = await fetch(url, options)
    if (response.status !== 429 || attempt >= maxRetries) {
      return response
    }
    const delay = Math.pow(2, attempt) * 1000
    await new Promise((resolve) => setTimeout(resolve, delay))
    attempt++
  }
}

// ── Fetch posts for a single subreddit ────────────────────────────────────────

async function fetchSubredditPosts(subreddit: string, token: string): Promise<RedditPost[]> {
  const url = `https://oauth.reddit.com/r/${subreddit}/new.json?limit=25`
  const response = await fetchWithBackoff(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      'User-Agent': 'FreelanceAlert/1.0',
    },
  })

  if (!response.ok) {
    // If token expired mid-run, bust the cache so next call re-authenticates
    if (response.status === 401) {
      tokenCache = null
    }
    console.error(`Failed to fetch r/${subreddit}: ${response.status}`)
    return []
  }

  const json = (await response.json()) as RedditApiResponse
  return json.data.children.map((c) => c.data)
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function GET(request: NextRequest): Promise<NextResponse> {
  // 1. Verify cron secret
  if (request.headers.get('authorization') !== 'Bearer ' + process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  let processedLeads = 0

  // 2. Fetch active users with their active keywords and subreddits
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, reddit_username')
    .eq('subscription_status', 'active')

  if (profilesError || !profiles || profiles.length === 0) {
    return NextResponse.json({ success: true, processed: 0 })
  }

  const userIds = profiles.map((p) => p.id)

  const [{ data: keywordsRows }, { data: subredditsRows }] = await Promise.all([
    supabase.from('keywords').select('user_id, keyword').eq('is_active', true).in('user_id', userIds),
    supabase
      .from('monitored_subreddits')
      .select('user_id, subreddit_name')
      .eq('is_active', true)
      .in('user_id', userIds),
  ])

  // Build per-user maps
  const userKeywordsMap: Record<string, string[]> = {}
  const userSubredditsMap: Record<string, string[]> = {}

  for (const row of keywordsRows ?? []) {
    if (!userKeywordsMap[row.user_id]) userKeywordsMap[row.user_id] = []
    userKeywordsMap[row.user_id].push(row.keyword.toLowerCase())
  }

  for (const row of subredditsRows ?? []) {
    if (!userSubredditsMap[row.user_id]) userSubredditsMap[row.user_id] = []
    userSubredditsMap[row.user_id].push(row.subreddit_name.toLowerCase())
  }

  // Build active user list (skip users with no keywords or no subreddits)
  const activeUsers: ActiveUser[] = profiles
    .map((p) => ({
      id: p.id,
      reddit_username: p.reddit_username,
      keywords: userKeywordsMap[p.id] ?? [],
      subreddits: userSubredditsMap[p.id] ?? [],
    }))
    .filter((u) => u.keywords.length > 0 && u.subreddits.length > 0)

  if (activeUsers.length === 0) {
    return NextResponse.json({ success: true, processed: 0 })
  }

  // 3. Get unique subreddits across all users
  const allSubreddits = [...new Set(activeUsers.flatMap((u) => u.subreddits))]

  // 4. Get Reddit access token
  let token: string
  try {
    token = await getRedditAccessToken()
  } catch (err) {
    console.error('Failed to obtain Reddit access token:', err instanceof Error ? err.message : 'unknown error')
    return NextResponse.json({ error: 'Reddit auth failed' }, { status: 502 })
  }

  // 5. Fetch posts per subreddit and process matches
  const twentyFourHoursAgo = Math.floor(Date.now() / 1000) - 86_400

  for (const subreddit of allSubreddits) {
    let posts: RedditPost[]
    try {
      // Refresh token lazily if it was busted during iteration
      if (!tokenCache || tokenCache.expiresAt <= Date.now() + 60_000) {
        token = await getRedditAccessToken()
      }
      posts = await fetchSubredditPosts(subreddit, token)
    } catch {
      continue
    }

    // Users who monitor this subreddit
    const interestedUsers = activeUsers.filter((u) => u.subreddits.includes(subreddit))

    for (const post of posts) {
      // Skip posts older than 24 hours
      if (post.created_utc < twentyFourHoursAgo) continue

      const postText = `${post.title} ${post.selftext}`.toLowerCase()
      const postUrl = `https://www.reddit.com${post.permalink}`

      for (const user of interestedUsers) {
        // Skip if the post author is the user themselves
        if (
          user.reddit_username &&
          post.author.toLowerCase() === user.reddit_username.toLowerCase()
        ) {
          continue
        }

        // Check keyword match
        const matchedKeyword = user.keywords.find((kw) => postText.includes(kw))
        if (!matchedKeyword) continue

        // Check if lead already exists for this user + post
        const { data: existingLead } = await supabase
          .from('leads')
          .select('id')
          .eq('user_id', user.id)
          .eq('post_id', post.id)
          .maybeSingle()

        if (existingLead) continue

        // Insert new lead with minimal required fields; score/message filled by downstream APIs
        const { data: newLead, error: insertError } = await supabase
          .from('leads')
          .insert({
            user_id: user.id,
            platform: 'reddit',
            post_id: post.id,
            post_title: post.title,
            post_body: post.selftext ?? '',
            post_url: postUrl,
            author_username: post.author,
            subreddit: post.subreddit,
            lead_score: 0,
            urgency_level: 'low',
            status: 'new',
            found_at: new Date(post.created_utc * 1000).toISOString(),
          })
          .select('id')
          .single()

        if (insertError || !newLead) {
          console.error(`Failed to insert lead for post ${post.id}:`, insertError?.message)
          continue
        }

        processedLeads++

        // Call score-lead and draft-message in parallel; failures are non-fatal
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
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
  }

  return NextResponse.json({ success: true, processed: processedLeads })
}
