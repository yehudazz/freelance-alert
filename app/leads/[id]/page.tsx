'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface Lead {
  id: string
  post_title: string
  post_body: string
  author_username: string
  subreddit: string
  post_url: string
  lead_score: number
  score_reason: string | null
  has_budget_mentioned: boolean
  budget_text: string | null
  urgency: 'low' | 'medium' | 'high' | null
  drafted_message: string | null
  status: 'new' | 'viewed' | 'sent' | 'dismissed'
  found_at: string
}

function wordCount(text: string): number {
  return text.trim() === '' ? 0 : text.trim().split(/\s+/).length
}

function ScoreBadge({ score }: { score: number }) {
  let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'outline'
  if (score >= 8) variant = 'default'
  else if (score >= 6) variant = 'secondary'
  else variant = 'destructive'

  return (
    <Badge variant={variant} className="text-sm px-2 py-0.5">
      Score: {score}/10
    </Badge>
  )
}

function UrgencyBadge({ urgency }: { urgency: 'low' | 'medium' | 'high' | null }) {
  if (!urgency) return null

  const styles: Record<string, string> = {
    high: 'bg-red-500/15 text-red-400 border-red-500/30',
    medium: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
    low: 'bg-green-500/15 text-green-400 border-green-500/30',
  }

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${styles[urgency] ?? ''}`}
    >
      {urgency} urgency
    </span>
  )
}

export default function LeadDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string

  const [lead, setLead] = useState<Lead | null>(null)
  const [loading, setLoading] = useState(true)
  const [draftedMessage, setDraftedMessage] = useState('')
  const [regenerating, setRegenerating] = useState(false)
  const [actionLoading, setActionLoading] = useState<'sent' | 'dismissed' | null>(null)

  useEffect(() => {
    if (!id) return

    async function fetchLead() {
      try {
        const res = await fetch(`/api/leads/${id}`)
        if (!res.ok) {
          router.replace('/leads')
          return
        }
        const data: Lead = await res.json()
        setLead(data)
        setDraftedMessage(data.drafted_message ?? '')
      } catch {
        router.replace('/leads')
      } finally {
        setLoading(false)
      }
    }

    fetchLead()
  }, [id, router])

  const handleRegenerate = useCallback(async () => {
    if (!lead) return
    setRegenerating(true)
    try {
      const res = await fetch('/api/draft-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId: lead.id }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        toast.error(body?.error ?? 'Failed to regenerate message')
        return
      }
      const data = await res.json()
      setDraftedMessage(data.drafted_message ?? '')
      toast.success('Message regenerated')
    } catch {
      toast.error('Failed to regenerate message')
    } finally {
      setRegenerating(false)
    }
  }, [lead])

  const handleStatusUpdate = useCallback(
    async (status: 'sent' | 'dismissed') => {
      if (!lead) return
      setActionLoading(status)
      try {
        const res = await fetch(`/api/leads/${lead.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        })
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          toast.error(body?.error ?? `Failed to mark as ${status}`)
          return
        }
        const updated: Lead = await res.json()
        setLead(updated)
        toast.success(status === 'sent' ? 'Marked as sent' : 'Lead dismissed')
      } catch {
        toast.error(`Failed to mark as ${status}`)
      } finally {
        setActionLoading(null)
      }
    },
    [lead]
  )

  const handleOpenRedditDM = useCallback(() => {
    if (!lead) return
    const url = `https://reddit.com/message/compose?to=${encodeURIComponent(lead.author_username)}&subject=Re:${encodeURIComponent(lead.post_title)}&message=${encodeURIComponent(draftedMessage)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }, [lead, draftedMessage])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading lead...</p>
      </div>
    )
  }

  if (!lead) {
    return null
  }

  const words = wordCount(draftedMessage)
  const foundAt = new Date(lead.found_at)

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Back button */}
        <div>
          <Link href="/leads" className={buttonVariants({ variant: 'ghost' }) + ' gap-1.5 text-muted-foreground -ml-2'}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="size-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to leads
          </Link>
        </div>

        {/* Title + meta */}
        <div className="space-y-3">
          <h1 className="text-2xl font-bold leading-snug">{lead.post_title}</h1>
          <div className="flex flex-wrap items-center gap-2">
            <ScoreBadge score={lead.lead_score} />
            <UrgencyBadge urgency={lead.urgency} />
            <a
              href={`https://reddit.com/r/${lead.subreddit}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary underline underline-offset-4 hover:opacity-80"
            >
              r/{lead.subreddit}
            </a>
            <span className="text-xs text-muted-foreground">
              Found {foundAt.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}{' '}
              at {foundAt.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          {lead.score_reason && (
            <p className="text-sm text-muted-foreground">{lead.score_reason}</p>
          )}
        </div>

        {/* Full post body */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Post</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{lead.post_body}</p>
            <a
              href={lead.post_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-xs text-primary underline underline-offset-4 hover:opacity-80"
            >
              View on Reddit
            </a>
          </CardContent>
        </Card>

        {/* Budget card */}
        {lead.has_budget_mentioned && lead.budget_text && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Budget Mentioned</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{lead.budget_text}</p>
            </CardContent>
          </Card>
        )}

        {/* AI Drafted Message */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">AI Drafted Message</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              value={draftedMessage}
              onChange={e => setDraftedMessage(e.target.value)}
              placeholder="No drafted message yet. Click Regenerate Message to generate one."
              rows={7}
              className="resize-none text-sm"
            />
            <div className="flex items-center justify-between">
              <span className={`text-xs ${words > 150 ? 'text-destructive' : 'text-muted-foreground'}`}>
                {words} / 150 words
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRegenerate}
                disabled={regenerating}
              >
                {regenerating ? 'Regenerating...' : 'Regenerate Message'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={handleOpenRedditDM}
            disabled={!draftedMessage.trim()}
            className="gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="size-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Open Reddit DM
          </Button>

          <Button
            variant="secondary"
            onClick={() => handleStatusUpdate('sent')}
            disabled={actionLoading !== null || lead.status === 'sent'}
          >
            {actionLoading === 'sent' ? 'Saving...' : 'Mark as Sent'}
          </Button>

          <Button
            variant="outline"
            onClick={() => handleStatusUpdate('dismissed')}
            disabled={actionLoading !== null || lead.status === 'dismissed'}
            className="text-muted-foreground"
          >
            {actionLoading === 'dismissed' ? 'Saving...' : 'Dismiss'}
          </Button>
        </div>
      </div>
    </div>
  )
}
