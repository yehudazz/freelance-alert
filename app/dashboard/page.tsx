export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Lead, Profile } from '@/types/database'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function relativeTime(dateString: string): string {
  const now = Date.now()
  const then = new Date(dateString).getTime()
  const diffMs = now - then
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSecs < 60) return 'just now'
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
  if (diffDays < 30) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
  return new Date(dateString).toLocaleDateString()
}

function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str
  return str.slice(0, maxLen - 1) + '…'
}

function scoreBadgeClass(score: number | null): string {
  if (score === null) return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
  if (score >= 8) return 'bg-green-500/20 text-green-400 border-green-500/30'
  if (score >= 5) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
  return 'bg-red-500/20 text-red-400 border-red-500/30'
}

function urgencyBadgeClass(level: Lead['urgency_level']): string {
  if (level === 'high') return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
  if (level === 'medium') return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
  return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function DashboardPage() {
  const supabase = await createClient()

  // Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch total lead count
  const { count: totalLeadCount } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  // Fetch leads found today
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const { count: todayCount } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('found_at', todayStart.toISOString())

  // Fetch sent count
  const { count: sentCount } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'sent')

  // Fetch active keyword count
  const { count: activeKeywordCount } = await supabase
    .from('keywords')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_active', true)

  // Fetch last 10 leads, newest first
  const { data: leads } = await supabase
    .from('leads')
    .select('*')
    .eq('user_id', user.id)
    .order('found_at', { ascending: false })
    .limit(10)

  const stats = [
    { label: 'Total Leads Found', value: totalLeadCount ?? 0 },
    { label: 'New Today', value: todayCount ?? 0 },
    { label: 'Leads Sent', value: sentCount ?? 0 },
    { label: 'Active Keywords', value: activeKeywordCount ?? 0 },
  ]

  const isFreeTierFull =
    (profile as Profile | null)?.subscription_tier === 'free' &&
    (totalLeadCount ?? 0) >= 5

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      {/* Top nav */}
      <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <span className="text-green-500 font-semibold tracking-wide text-sm uppercase">
          FreelanceAlert
        </span>
        <nav className="flex items-center gap-4 text-sm text-slate-400">
          <Link href="/settings" className="hover:text-white transition-colors">
            Settings
          </Link>
        </nav>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        {/* Upgrade banner */}
        {isFreeTierFull && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-5 py-4">
            <div className="flex-1">
              <p className="font-semibold text-yellow-300 text-sm">
                You&apos;ve reached the free plan limit
              </p>
              <p className="text-yellow-200/70 text-sm mt-0.5">
                Upgrade to keep receiving new leads. Free plan caps at 5 leads.
              </p>
            </div>
            <Link href="/pricing">
              <Button className="bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-semibold border-0 shrink-0">
                Upgrade Now
              </Button>
            </Link>
          </div>
        )}

        {/* Page title */}
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">
            Welcome back{profile?.full_name ? `, ${profile.full_name}` : ''}. Here&apos;s what we found for you.
          </p>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card
              key={stat.label}
              className="bg-slate-800/60 border-slate-700 ring-0"
            >
              <CardHeader className="pb-1">
                <CardTitle className="text-slate-400 text-xs font-medium uppercase tracking-wider">
                  {stat.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent leads */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Recent Leads</h2>

          {!leads || leads.length === 0 ? (
            /* Empty state */
            <div className="rounded-xl border border-slate-700 bg-slate-800/40 px-8 py-16 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-700">
                <svg
                  className="h-7 w-7 text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
                  />
                </svg>
              </div>
              <p className="text-slate-300 font-medium">No leads yet</p>
              <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
                We&apos;re monitoring Reddit right now. Check back soon or add more keywords.
              </p>
              <Link href="/settings/keywords" className="mt-6 inline-block">
                <Button
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:text-white hover:border-slate-400"
                >
                  Add Keywords
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {leads.map((lead) => (
                <div
                  key={lead.id}
                  className="group flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-4 hover:border-slate-600 hover:bg-slate-800/80 transition-colors"
                >
                  {/* Score badge */}
                  <span
                    className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${scoreBadgeClass(lead.lead_score)}`}
                    title={`Score: ${lead.lead_score}/10`}
                  >
                    {lead.lead_score}
                  </span>

                  {/* Main info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium leading-snug truncate">
                      {truncate(lead.post_title, 80)}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
                      <span className="text-slate-400 text-xs">
                        {lead.platform}
                        {lead.subreddit ? ` · r/${lead.subreddit}` : ''}
                      </span>
                      <span className="text-slate-600 text-xs">&middot;</span>
                      <span className="text-slate-500 text-xs">{relativeTime(lead.found_at)}</span>

                      {lead.has_budget_mentioned && (
                        <span className="inline-flex items-center rounded-full border border-green-500/30 bg-green-500/10 px-2 py-0.5 text-xs text-green-400 font-medium">
                          Budget
                        </span>
                      )}

                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${urgencyBadgeClass(lead.urgency_level)}`}
                      >
                        {lead.urgency_level}
                      </span>
                    </div>
                  </div>

                  {/* Action */}
                  <Link href={`/leads/${lead.id}`} className="shrink-0">
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-500 text-white border-0 w-full sm:w-auto"
                    >
                      View &amp; Send
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
