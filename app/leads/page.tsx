'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Lead } from '@/types/database'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

type FilterTab = 'all' | 'new' | 'high_score' | 'sent' | 'dismissed'
type SortOption = 'newest' | 'highest_score' | 'budget_mentioned'

const PAGE_SIZE = 20

// â”€â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function scoreColor(score: number | null): string {
  if (score === null) return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
  if (score >= 8) return 'bg-green-500/20 text-green-400 border-green-500/30'
  if (score >= 5) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
  return 'bg-red-500/20 text-red-400 border-red-500/30'
}

function urgencyColor(level: Lead['urgency_level']): string {
  if (level === 'high') return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
  if (level === 'medium') return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
  return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

function formatBudget(amount: string | number | null): string {
  if (amount === null) return ''
  if (typeof amount === 'string') return amount
  if (amount >= 1000) return `$${(amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1)}k`
  return `$${amount}`
}

// â”€â”€â”€ Skeleton Card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function LeadCardSkeleton() {
  return (
    <Card className="border-slate-700/50 bg-slate-800/60">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <Skeleton className="h-5 w-12 rounded-full bg-slate-700" />
          <Skeleton className="h-4 w-20 bg-slate-700" />
        </div>
        <Skeleton className="mt-2 h-5 w-3/4 bg-slate-700" />
        <Skeleton className="h-4 w-1/2 bg-slate-700" />
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-5 w-16 rounded-full bg-slate-700" />
          <Skeleton className="h-5 w-20 rounded-full bg-slate-700" />
        </div>
      </CardContent>
      <CardFooter className="border-slate-700/50 bg-slate-800/30">
        <Skeleton className="h-8 w-24 bg-slate-700" />
      </CardFooter>
    </Card>
  )
}

// â”€â”€â”€ Lead Card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function LeadCard({ lead }: { lead: Lead }) {
  return (
    <Card className="border-slate-700/50 bg-slate-800/60 transition-all duration-200 hover:border-slate-600/70 hover:bg-slate-800/80">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <span
            className={`inline-flex h-5 items-center rounded-full border px-2 text-xs font-semibold ${scoreColor(lead.lead_score)}`}
          >
            {lead.lead_score}/10
          </span>
          <span className="shrink-0 text-xs text-slate-500">{timeAgo(lead.found_at)}</span>
        </div>
        <CardTitle className="mt-1 line-clamp-2 text-sm font-medium text-slate-100">
          {lead.post_title}
        </CardTitle>
        <CardDescription className="text-xs text-slate-400">
          {lead.platform.charAt(0).toUpperCase() + lead.platform.slice(1)}
          {lead.subreddit ? ` Â· r/${lead.subreddit}` : ''}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="flex flex-wrap items-center gap-2">
          {lead.has_budget_mentioned && lead.budget_amount !== null && (
            <span className="inline-flex h-5 items-center rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2 text-xs font-medium text-emerald-400">
              {formatBudget(lead.budget_amount)}
            </span>
          )}
          <span
            className={`inline-flex h-5 items-center rounded-full border px-2 text-xs font-medium capitalize ${urgencyColor(lead.urgency_level)}`}
          >
            {lead.urgency_level} urgency
          </span>
          {lead.status === 'new' && (
            <span className="inline-flex h-5 items-center rounded-full border border-indigo-500/30 bg-indigo-500/15 px-2 text-xs font-medium text-indigo-400">
              New
            </span>
          )}
        </div>
      </CardContent>

      <CardFooter className="border-slate-700/50 bg-slate-800/30">
        <Link href={`/leads/${lead.id}`} className={buttonVariants({ size: 'sm', variant: 'outline' }) + ' border-slate-600 bg-slate-700/50 text-slate-200 hover:bg-slate-700 hover:text-white'}>View Lead</Link>
      </CardFooter>
    </Card>
  )
}

// â”€â”€â”€ Empty State â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const EMPTY_MESSAGES: Record<FilterTab, string> = {
  all: 'No leads found yet. The scanner will surface opportunities as they appear.',
  new: 'No new leads right now. Check back soon.',
  high_score: 'No high-scoring leads at the moment.',
  sent: 'You have not marked any leads as sent yet.',
  dismissed: 'No dismissed leads.',
}

function EmptyState({ filter }: { filter: FilterTab }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-800/30 px-6 py-16 text-center">
      <div className="mb-3 text-4xl">
        {filter === 'high_score' ? 'ðŸ†' : filter === 'sent' ? 'ðŸ“¬' : filter === 'dismissed' ? 'ðŸ—‘ï¸' : 'ðŸ”'}
      </div>
      <p className="max-w-xs text-sm text-slate-400">{EMPTY_MESSAGES[filter]}</p>
    </div>
  )
}

// â”€â”€â”€ Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const FILTER_TABS: { id: FilterTab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'new', label: 'New' },
  { id: 'high_score', label: 'High Score' },
  { id: 'sent', label: 'Sent' },
  { id: 'dismissed', label: 'Dismissed' },
]

const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: 'newest', label: 'Newest' },
  { id: 'highest_score', label: 'Highest Score' },
  { id: 'budget_mentioned', label: 'Budget Mentioned' },
]

export default function LeadsPage() {
  const supabase = createClient()

  const [filter, setFilter] = useState<FilterTab>('all')
  const [sort, setSort] = useState<SortOption>('newest')
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [page, setPage] = useState(0)

  const buildQuery = useCallback(
    (pageIndex: number) => {
      let q = supabase
        .from('leads')
        .select('*')
        .range(pageIndex * PAGE_SIZE, pageIndex * PAGE_SIZE + PAGE_SIZE - 1)

      // Filter
      if (filter === 'new') {
        q = q.eq('status', 'new')
      } else if (filter === 'high_score') {
        q = q.gte('lead_score', 8)
      } else if (filter === 'sent') {
        q = q.eq('status', 'sent')
      } else if (filter === 'dismissed') {
        q = q.eq('status', 'dismissed')
      }

      // Sort
      if (sort === 'newest') {
        q = q.order('found_at', { ascending: false })
      } else if (sort === 'highest_score') {
        q = q.order('lead_score', { ascending: false }).order('found_at', { ascending: false })
      } else if (sort === 'budget_mentioned') {
        q = q
          .eq('has_budget_mentioned', true)
          .order('budget_amount', { ascending: false })
          .order('found_at', { ascending: false })
      }

      return q
    },
    [supabase, filter, sort]
  )

  // Initial / filter+sort change fetch
  useEffect(() => {
    let cancelled = false

    async function fetchLeads() {
      setLoading(true)
      setPage(0)

      const { data, error } = await buildQuery(0)

      if (cancelled) return
      if (error) {
        console.error('Failed to fetch leads:', error)
        setLeads([])
        setHasMore(false)
      } else {
        setLeads(data ?? [])
        setHasMore((data?.length ?? 0) === PAGE_SIZE)
      }
      setLoading(false)
    }

    fetchLeads()
    return () => { cancelled = true }
  }, [filter, sort, buildQuery])

  // Load more
  async function loadMore() {
    const nextPage = page + 1
    setLoadingMore(true)

    const { data, error } = await buildQuery(nextPage)

    if (!error && data) {
      setLeads((prev) => [...prev, ...data])
      setPage(nextPage)
      setHasMore(data.length === PAGE_SIZE)
    }
    setLoadingMore(false)
  }

  return (
    <div className="min-h-screen bg-slate-900 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-slate-100">Leads</h1>
          <p className="mt-1 text-sm text-slate-400">
            Potential clients found across monitored platforms
          </p>
        </div>

        {/* Controls */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-1.5">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-all ${
                  filter === tab.id
                    ? 'border-indigo-500/50 bg-indigo-500/20 text-indigo-300'
                    : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600 hover:text-slate-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Sort Select */}
          <div className="flex items-center gap-2">
            <span className="shrink-0 text-xs text-slate-500">Sort by</span>
            <div className="flex gap-1">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setSort(opt.id)}
                  className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all ${
                    sort === opt.id
                      ? 'border-slate-500 bg-slate-700 text-slate-200'
                      : 'border-slate-700/50 bg-transparent text-slate-500 hover:border-slate-600 hover:text-slate-400'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <LeadCardSkeleton key={i} />
            ))}
          </div>
        ) : leads.length === 0 ? (
          <EmptyState filter={filter} />
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {leads.map((lead) => (
                <LeadCard key={lead.id} lead={lead} />
              ))}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="mt-8 flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="border-slate-600 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-slate-100"
                >
                  {loadingMore ? (
                    <span className="flex items-center gap-2">
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-500 border-t-slate-200" />
                      Loading...
                    </span>
                  ) : (
                    'Load more'
                  )}
                </Button>
              </div>
            )}

            {/* Footer count */}
            {!hasMore && leads.length > 0 && (
              <p className="mt-6 text-center text-xs text-slate-600">
                Showing all {leads.length} lead{leads.length !== 1 ? 's' : ''}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
