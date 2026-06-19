'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, KeyboardEvent } from 'react'
import { AppShell } from '@/components/app-shell'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { toast } from 'sonner'
import type { Keyword, MonitoredSubreddit } from '@/types/database'
import { Trash2Icon } from 'lucide-react'

// ---------------------------------------------------------------------------
// Inline toggle switch â€“ no separate Switch UI component in this project
// ---------------------------------------------------------------------------
function ToggleSwitch({
  checked,
  onChange,
  disabled,
  label,
}: {
  checked: boolean
  onChange: () => void
  disabled?: boolean
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={onChange}
      className={[
        'relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f172a]',
        'disabled:cursor-not-allowed disabled:opacity-50',
        checked ? 'bg-green-500' : 'bg-slate-600',
      ].join(' ')}
    >
      <span
        className={[
          'pointer-events-none block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200',
          checked ? 'translate-x-4' : 'translate-x-0',
        ].join(' ')}
      />
    </button>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function KeywordsPage() {
  const supabase = createClient()

  const [keywords, setKeywords] = useState<Keyword[]>([])
  const [subreddits, setSubreddits] = useState<MonitoredSubreddit[]>([])
  const [loading, setLoading] = useState(true)

  // keyword add form
  const [newKeyword, setNewKeyword] = useState('')
  const [keywordError, setKeywordError] = useState<string | null>(null)
  const [addingKeyword, setAddingKeyword] = useState(false)

  // subreddit add form
  const [newSubreddit, setNewSubreddit] = useState('')
  const [subredditError, setSubredditError] = useState<string | null>(null)
  const [addingSubreddit, setAddingSubreddit] = useState(false)

  // toggling / deleting
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [togglingSubId, setTogglingSubId] = useState<string | null>(null)
  const [deletingSubId, setDeletingSubId] = useState<string | null>(null)

  // ---------------------------------------------------------------------------
  // Load data
  // ---------------------------------------------------------------------------
  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      const { data: sessionData } = await supabase.auth.getSession()
      const userId = sessionData.session?.user?.id
      if (!userId) {
        setLoading(false)
        return
      }

      const [kwRes, srRes] = await Promise.all([
        supabase
          .from('keywords')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false }),
        supabase
          .from('monitored_subreddits')
          .select('*')
          .eq('user_id', userId)
          .order('subreddit_name', { ascending: true }),
      ])

      if (cancelled) return

      if (kwRes.error) {
        toast.error('Failed to load keywords')
      } else {
        setKeywords(kwRes.data ?? [])
      }

      if (srRes.error) {
        toast.error('Failed to load subreddits')
      } else {
        setSubreddits(srRes.data ?? [])
      }

      setLoading(false)
    }

    load()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ---------------------------------------------------------------------------
  // Keywords â€“ add
  // ---------------------------------------------------------------------------
  function validateNewKeyword(value: string): string | null {
    if (value.trim().length === 0) return 'Keyword cannot be empty.'
    if (value.trim().length > 100) return 'Keyword must be 100 characters or fewer.'
    return null
  }

  async function handleAddKeyword() {
    const trimmed = newKeyword.trim()
    const err = validateNewKeyword(trimmed)
    if (err) {
      setKeywordError(err)
      return
    }
    setKeywordError(null)
    setAddingKeyword(true)

    try {
      const res = await fetch('/api/keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: trimmed }),
      })
      const json = await res.json()

      if (!res.ok) {
        toast.error(json.error ?? 'Failed to add keyword')
      } else {
        setKeywords(prev => [json.keyword, ...prev])
        setNewKeyword('')
        toast.success(`Keyword "${trimmed}" added`)
      }
    } catch {
      toast.error('Network error â€“ please try again')
    } finally {
      setAddingKeyword(false)
    }
  }

  function handleKeywordKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddKeyword()
    }
  }

  // ---------------------------------------------------------------------------
  // Keywords â€“ toggle
  // ---------------------------------------------------------------------------
  async function handleToggleKeyword(id: string) {
    setTogglingId(id)
    try {
      const res = await fetch(`/api/keywords/${id}`, { method: 'PATCH' })
      const json = await res.json()

      if (!res.ok) {
        toast.error(json.error ?? 'Failed to update keyword')
      } else {
        setKeywords(prev =>
          prev.map(k => (k.id === id ? { ...k, is_active: json.keyword.is_active } : k))
        )
        toast.success(json.keyword.is_active ? 'Keyword enabled' : 'Keyword disabled')
      }
    } catch {
      toast.error('Network error â€“ please try again')
    } finally {
      setTogglingId(null)
    }
  }

  // ---------------------------------------------------------------------------
  // Keywords â€“ delete
  // ---------------------------------------------------------------------------
  async function handleDeleteKeyword(id: string, keyword: string) {
    if (!window.confirm(`Delete keyword "${keyword}"?`)) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/keywords/${id}`, { method: 'DELETE' })

      if (res.status === 204 || res.ok) {
        setKeywords(prev => prev.filter(k => k.id !== id))
        toast.success(`Keyword "${keyword}" deleted`)
      } else {
        const json = await res.json().catch(() => ({}))
        toast.error((json as { error?: string }).error ?? 'Failed to delete keyword')
      }
    } catch {
      toast.error('Network error â€“ please try again')
    } finally {
      setDeletingId(null)
    }
  }

  // ---------------------------------------------------------------------------
  // Subreddits â€“ add (direct Supabase insert)
  // ---------------------------------------------------------------------------
  function validateSubredditName(value: string): string | null {
    if (value.trim().length === 0) return 'Subreddit name cannot be empty.'
    if (!/^[a-zA-Z0-9_]+$/.test(value.trim())) {
      return 'Subreddit name can only contain letters, numbers, and underscores.'
    }
    if (value.trim().length > 21) return 'Subreddit name must be 21 characters or fewer.'
    return null
  }

  async function handleAddSubreddit() {
    const raw = newSubreddit.trim().replace(/^r\//i, '')
    const err = validateSubredditName(raw)
    if (err) {
      setSubredditError(err)
      return
    }
    setSubredditError(null)

    // Check duplicate (client-side)
    if (subreddits.some(s => s.subreddit_name.toLowerCase() === raw.toLowerCase())) {
      setSubredditError('This subreddit is already in your list.')
      return
    }

    setAddingSubreddit(true)
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const userId = sessionData.session?.user?.id
      if (!userId) {
        toast.error('You must be signed in')
        return
      }

      const { data, error } = await supabase
        .from('monitored_subreddits')
        .insert({ user_id: userId, subreddit_name: raw, is_active: true })
        .select()
        .single()

      if (error) {
        toast.error(error.message ?? 'Failed to add subreddit')
      } else {
        setSubreddits(prev =>
          [...prev, data].sort((a, b) =>
            a.subreddit_name.localeCompare(b.subreddit_name)
          )
        )
        setNewSubreddit('')
        toast.success(`r/${raw} added`)
      }
    } catch {
      toast.error('Network error â€“ please try again')
    } finally {
      setAddingSubreddit(false)
    }
  }

  function handleSubredditKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddSubreddit()
    }
  }

  // ---------------------------------------------------------------------------
  // Subreddits â€“ toggle (direct Supabase update)
  // ---------------------------------------------------------------------------
  async function handleToggleSubreddit(id: string, current: boolean) {
    setTogglingSubId(id)
    try {
      const { data, error } = await supabase
        .from('monitored_subreddits')
        .update({ is_active: !current })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        toast.error(error.message ?? 'Failed to update subreddit')
      } else {
        setSubreddits(prev => prev.map(s => (s.id === id ? { ...s, is_active: data.is_active } : s)))
        toast.success(data.is_active ? 'Subreddit enabled' : 'Subreddit disabled')
      }
    } catch {
      toast.error('Network error â€“ please try again')
    } finally {
      setTogglingSubId(null)
    }
  }

  // ---------------------------------------------------------------------------
  // Subreddits â€“ delete
  // ---------------------------------------------------------------------------
  async function handleDeleteSubreddit(id: string, name: string) {
    if (!window.confirm(`Remove r/${name} from monitoring?`)) return
    setDeletingSubId(id)
    try {
      const { error } = await supabase
        .from('monitored_subreddits')
        .delete()
        .eq('id', id)

      if (error) {
        toast.error(error.message ?? 'Failed to delete subreddit')
      } else {
        setSubreddits(prev => prev.filter(s => s.id !== id))
        toast.success(`r/${name} removed`)
      }
    } catch {
      toast.error('Network error â€“ please try again')
    } finally {
      setDeletingSubId(null)
    }
  }

  // ---------------------------------------------------------------------------
  // Derived counts
  // ---------------------------------------------------------------------------
  const activeKeywords = keywords.filter(k => k.is_active).length
  const activeSubreddits = subreddits.filter(s => s.is_active).length

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <AppShell>
    <div className="px-4 py-10">
      <div className="mx-auto max-w-2xl space-y-10">

        {/* Page header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Keywords &amp; Subreddits</h1>
          <p className="mt-1 text-sm text-slate-400">
            Manage what FreelanceAlert monitors for new leads.
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-14 rounded-xl bg-slate-800/60 animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* ----------------------------------------------------------------
                KEYWORDS section
            ---------------------------------------------------------------- */}
            <Card className="bg-slate-800/50 border-slate-700 text-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Keywords</CardTitle>
                    <CardDescription className="text-slate-400">
                      Posts containing these phrases will be flagged as leads.
                    </CardDescription>
                  </div>
                  <span className="ml-4 shrink-0 rounded-full bg-green-500/20 px-2.5 py-0.5 text-xs font-medium text-green-400">
                    {activeKeywords} active
                  </span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Add keyword */}
                <div className="space-y-1.5">
                  <div className="flex gap-2">
                    <Input
                      value={newKeyword}
                      onChange={e => {
                        setNewKeyword(e.target.value)
                        if (keywordError) setKeywordError(null)
                      }}
                      onKeyDown={handleKeywordKeyDown}
                      placeholder="e.g. need a web developer"
                      maxLength={101}
                      className="h-9 border-slate-600 bg-slate-900 text-white placeholder:text-slate-500 focus-visible:border-green-500 focus-visible:ring-green-500/20"
                    />
                    <Button
                      onClick={handleAddKeyword}
                      disabled={addingKeyword}
                      size="default"
                      className="shrink-0 border-0 bg-green-500 text-white hover:bg-green-600 disabled:opacity-60"
                    >
                      {addingKeyword ? 'Addingâ€¦' : 'Add'}
                    </Button>
                  </div>
                  {keywordError && (
                    <p className="text-xs text-red-400">{keywordError}</p>
                  )}
                </div>

                {/* Keyword list */}
                {keywords.length === 0 ? (
                  <p className="py-4 text-center text-sm text-slate-500">
                    No keywords yet. Add one above.
                  </p>
                ) : (
                  <ul className="divide-y divide-slate-700/60">
                    {keywords.map(kw => (
                      <li
                        key={kw.id}
                        className="flex items-center gap-3 py-3"
                      >
                        <ToggleSwitch
                          checked={kw.is_active}
                          onChange={() => handleToggleKeyword(kw.id)}
                          disabled={togglingId === kw.id}
                          label={`Toggle keyword "${kw.keyword}"`}
                        />
                        <span
                          className={[
                            'flex-1 truncate text-sm',
                            kw.is_active ? 'text-white' : 'text-slate-500 line-through',
                          ].join(' ')}
                        >
                          {kw.keyword}
                        </span>
                        <button
                          type="button"
                          aria-label={`Delete keyword "${kw.keyword}"`}
                          disabled={deletingId === kw.id}
                          onClick={() => handleDeleteKeyword(kw.id, kw.keyword)}
                          className="shrink-0 rounded-md p-1.5 text-slate-500 transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:opacity-40"
                        >
                          <Trash2Icon className="size-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            {/* ----------------------------------------------------------------
                MONITORED SUBREDDITS section
            ---------------------------------------------------------------- */}
            <Card className="bg-slate-800/50 border-slate-700 text-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Monitored Subreddits</CardTitle>
                    <CardDescription className="text-slate-400">
                      Communities scanned for matching keywords.
                    </CardDescription>
                  </div>
                  <span className="ml-4 shrink-0 rounded-full bg-green-500/20 px-2.5 py-0.5 text-xs font-medium text-green-400">
                    {activeSubreddits} active
                  </span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Add subreddit */}
                <div className="space-y-1.5">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-slate-400">
                        r/
                      </span>
                      <Input
                        value={newSubreddit}
                        onChange={e => {
                          setNewSubreddit(e.target.value)
                          if (subredditError) setSubredditError(null)
                        }}
                        onKeyDown={handleSubredditKeyDown}
                        placeholder="freelancers"
                        maxLength={24}
                        className="h-9 border-slate-600 bg-slate-900 pl-8 text-white placeholder:text-slate-500 focus-visible:border-green-500 focus-visible:ring-green-500/20"
                      />
                    </div>
                    <Button
                      onClick={handleAddSubreddit}
                      disabled={addingSubreddit}
                      size="default"
                      className="shrink-0 border-0 bg-green-500 text-white hover:bg-green-600 disabled:opacity-60"
                    >
                      {addingSubreddit ? 'Addingâ€¦' : 'Add'}
                    </Button>
                  </div>
                  {subredditError && (
                    <p className="text-xs text-red-400">{subredditError}</p>
                  )}
                  <p className="text-xs text-slate-500">
                    Letters, numbers, and underscores only &mdash; max 21 characters.
                  </p>
                </div>

                {/* Subreddit list */}
                {subreddits.length === 0 ? (
                  <p className="py-4 text-center text-sm text-slate-500">
                    No subreddits yet. Add one above.
                  </p>
                ) : (
                  <ul className="divide-y divide-slate-700/60">
                    {subreddits.map(sr => (
                      <li
                        key={sr.id}
                        className="flex items-center gap-3 py-3"
                      >
                        <ToggleSwitch
                          checked={sr.is_active}
                          onChange={() => handleToggleSubreddit(sr.id, sr.is_active)}
                          disabled={togglingSubId === sr.id}
                          label={`Toggle subreddit r/${sr.subreddit_name}`}
                        />
                        <span
                          className={[
                            'flex-1 truncate text-sm',
                            sr.is_active ? 'text-white' : 'text-slate-500 line-through',
                          ].join(' ')}
                        >
                          r/{sr.subreddit_name}
                        </span>
                        <button
                          type="button"
                          aria-label={`Remove r/${sr.subreddit_name}`}
                          disabled={deletingSubId === sr.id}
                          onClick={() => handleDeleteSubreddit(sr.id, sr.subreddit_name)}
                          className="shrink-0 rounded-md p-1.5 text-slate-500 transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:opacity-40"
                        >
                          <Trash2Icon className="size-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
    </AppShell>
  )
}
