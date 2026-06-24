import { NextRequest } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { description } = await request.json()
  if (!description?.trim()) return Response.json({ error: 'Description required' }, { status: 400 })

  const client = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY ?? 'placeholder',
  })

  const prompt = `You are helping a freelancer find clients on Hacker News and job forums.

The freelancer describes their service as: "${description}"

Generate exactly 10 short search queries that potential clients would use when posting on Hacker News or job boards when they need this service. Think about what someone would type in a "Who is hiring?" or "Seeking freelancer" post.

Rules:
- Each query should be 2-5 words
- Focus on what the CLIENT needs, not what the freelancer does
- Use natural language people actually type
- Mix different angles: job titles, technologies, tasks

Return ONLY a JSON array of strings, nothing else. Example format:
["need react developer", "hire frontend engineer", "looking for web developer"]`

  try {
    const message = await client.chat.completions.create({
      model: 'anthropic/claude-haiku-4-5',
      max_tokens: 256,
      messages: [{ role: 'user', content: prompt }],
    })

    const raw = message.choices[0]?.message?.content ?? '[]'
    const match = raw.match(/\[[\s\S]*\]/)
    const keywords: string[] = match ? JSON.parse(match[0]) : []

    return Response.json({ keywords: keywords.slice(0, 10) })
  } catch (err) {
    console.error('Failed to generate keywords:', err)
    return Response.json({ error: 'Failed to generate keywords' }, { status: 500 })
  }
}
