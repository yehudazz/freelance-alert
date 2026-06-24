'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useRef } from 'react'
import { AppShell } from '@/components/app-shell'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface Keyword {
  id: string
  keyword: string
  is_active: boolean
}

export default function KeywordsPage() {
  const supabase = createClient()
  const [keywords, setKeywords] = useState<Keyword[]>([])
  const [loading, setLoading] = useState(true)
  const [description, setDescription] = useState('')
  const [generating, setGenerating] = useState(false)
  const [suggested, setSuggested] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)
      const { data } = await supabase
        .from('keywords')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      setKeywords(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  async function handleGenerate() {
    if (!description.trim()) return
    setGenerating(true)
    setSuggested([])
    try {
      const res = await fetch('/api/generate-keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description }),
      })
      const data = await res.json()
      if (data.keywords?.length) {
        setSuggested(data.keywords)
      } else {
        toast.error('Could not generate keywords, try again')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setGenerating(false)
    }
  }

  async function saveKeywords() {
    if (!suggested.length || !userId) return
    setSaving(true)
    const rows = suggested.map(kw => ({ user_id: userId, keyword: kw, is_active: true }))
    const { data, error } = await supabase.from('keywords').insert(rows).select()
    if (error) {
      toast.error('Failed to save keywords')
    } else {
      setKeywords(prev => [...(data ?? []), ...prev])
      setSuggested([])
      setDescription('')
      toast.success(`${rows.length} search terms saved!`)
    }
    setSaving(false)
  }

  async function deleteKeyword(id: string) {
    await supabase.from('keywords').delete().eq('id', id)
    setKeywords(prev => prev.filter(k => k.id !== id))
    toast.success('Removed')
  }

  async function toggleKeyword(id: string, current: boolean) {
    await supabase.from('keywords').update({ is_active: !current }).eq('id', id)
    setKeywords(prev => prev.map(k => k.id === id ? { ...k, is_active: !current } : k))
  }

  function removeSuggested(kw: string) {
    setSuggested(prev => prev.filter(k => k !== kw))
  }

  return (
    <AppShell>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '2.5rem 1.5rem' }}>

        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#e2e8f0', marginBottom: '.375rem', letterSpacing: '-.02em' }}>
            What service do you offer?
          </h1>
          <p style={{ color: '#475569', fontSize: '.9rem', lineHeight: 1.6 }}>
            Describe what you do and our AI will create the perfect search terms to find clients on Hacker News automatically.
          </p>
        </div>

        {/* AI Chat Input */}
        <div style={{ background: 'rgba(15,22,41,.8)', border: '1px solid #1e3a5f', borderRadius: '1rem', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#22c55e,#0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>
              🤖
            </div>
            <div style={{ background: 'rgba(34,197,94,.06)', border: '1px solid rgba(34,197,94,.15)', borderRadius: '.75rem', padding: '1rem', flex: 1 }}>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: '.9rem', lineHeight: 1.6 }}>
                Hey! Tell me what kind of freelance service you provide and I&apos;ll generate search terms that match what your potential clients post when they&apos;re looking for someone like you.
              </p>
            </div>
          </div>

          <textarea
            ref={textareaRef}
            value={description}
            onChange={e => setDescription(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleGenerate() }}
            placeholder="Example: I'm a React developer who builds SaaS dashboards and landing pages. I specialize in TypeScript and Next.js."
            rows={3}
            style={{
              width: '100%', boxSizing: 'border-box',
              background: 'rgba(2,8,23,.6)', border: '1px solid #1e3a5f',
              borderRadius: '.625rem', padding: '.875rem 1rem',
              color: '#e2e8f0', fontSize: '.9rem', lineHeight: 1.6,
              resize: 'vertical', outline: 'none',
              fontFamily: 'inherit',
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '.75rem' }}>
            <span style={{ fontSize: '.75rem', color: '#334155' }}>Ctrl+Enter to generate</span>
            <button
              onClick={handleGenerate}
              disabled={generating || !description.trim()}
              style={{
                background: generating ? '#1e3a5f' : 'linear-gradient(135deg,#22c55e,#16a34a)',
                color: generating ? '#475569' : '#020817',
                border: 'none', borderRadius: '.5rem',
                padding: '.625rem 1.25rem', fontWeight: 700, fontSize: '.875rem',
                cursor: generating || !description.trim() ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: '.5rem',
                transition: 'all .2s',
              }}
            >
              {generating ? (
                <>
                  <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite', fontSize: '1rem' }}>⟳</span>
                  Generating...
                </>
              ) : '✨ Generate search terms'}
            </button>
          </div>
        </div>

        {/* Suggested keywords */}
        {suggested.length > 0 && (
          <div style={{ background: 'rgba(15,22,41,.8)', border: '1px solid rgba(34,197,94,.2)', borderRadius: '1rem', padding: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '1rem' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#22c55e,#0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>🤖</div>
              <p style={{ margin: 0, color: '#4ade80', fontSize: '.9rem', fontWeight: 600 }}>
                Found {suggested.length} search terms for you. Remove any you don&apos;t want, then save.
              </p>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem', marginBottom: '1rem' }}>
              {suggested.map(kw => (
                <span key={kw} style={{
                  display: 'inline-flex', alignItems: 'center', gap: '.375rem',
                  background: 'rgba(34,197,94,.1)', border: '1px solid rgba(34,197,94,.25)',
                  borderRadius: '9999px', padding: '.3rem .75rem',
                  fontSize: '.825rem', color: '#4ade80', fontWeight: 500,
                }}>
                  {kw}
                  <button onClick={() => removeSuggested(kw)} style={{ background: 'none', border: 'none', color: '#22c55e', cursor: 'pointer', fontSize: '.875rem', padding: 0, lineHeight: 1, opacity: .7 }}>×</button>
                </span>
              ))}
            </div>
            <button
              onClick={saveKeywords}
              disabled={saving || suggested.length === 0}
              style={{
                background: 'linear-gradient(135deg,#22c55e,#16a34a)',
                color: '#020817', border: 'none', borderRadius: '.5rem',
                padding: '.75rem 1.5rem', fontWeight: 700, fontSize: '.9rem',
                cursor: saving ? 'not-allowed' : 'pointer', width: '100%',
              }}
            >
              {saving ? 'Saving...' : `✓ Save ${suggested.length} search terms`}
            </button>
          </div>
        )}

        {/* Active keywords */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#e2e8f0' }}>
              Active search terms
              {keywords.length > 0 && <span style={{ marginLeft: '.5rem', fontSize: '.8rem', color: '#334155', fontWeight: 400 }}>({keywords.filter(k => k.is_active).length} active)</span>}
            </h2>
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
              {[1,2,3].map(i => <div key={i} style={{ height: 52, borderRadius: '.75rem', background: 'rgba(15,22,41,.5)', animation: 'pulse 2s infinite' }} />)}
            </div>
          ) : keywords.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', background: 'rgba(15,22,41,.4)', border: '1px solid #1e3a5f', borderRadius: '1rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '.75rem' }}>🎯</div>
              <p style={{ color: '#475569', fontSize: '.9rem', margin: 0 }}>No search terms yet — describe your service above to get started.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
              {keywords.map(kw => (
                <div key={kw.id} style={{
                  display: 'flex', alignItems: 'center', gap: '.75rem',
                  background: 'rgba(15,22,41,.6)', border: `1px solid ${kw.is_active ? '#1e3a5f' : '#0f1e38'}`,
                  borderRadius: '.75rem', padding: '.875rem 1rem',
                  opacity: kw.is_active ? 1 : .5,
                }}>
                  <button
                    onClick={() => toggleKeyword(kw.id, kw.is_active)}
                    style={{
                      width: 36, height: 20, borderRadius: '9999px', flexShrink: 0,
                      background: kw.is_active ? '#22c55e' : '#1e3a5f',
                      border: 'none', cursor: 'pointer', position: 'relative', transition: 'background .2s',
                    }}
                  >
                    <span style={{
                      position: 'absolute', top: 2, left: kw.is_active ? 18 : 2,
                      width: 16, height: 16, borderRadius: '50%', background: 'white',
                      transition: 'left .2s',
                    }} />
                  </button>
                  <span style={{ flex: 1, fontSize: '.9rem', color: kw.is_active ? '#e2e8f0' : '#475569' }}>{kw.keyword}</span>
                  <button
                    onClick={() => deleteKeyword(kw.id)}
                    style={{ background: 'none', border: 'none', color: '#334155', cursor: 'pointer', padding: '.25rem', fontSize: '1rem', lineHeight: 1, borderRadius: '.375rem', transition: 'color .15s' }}
                    onMouseOver={e => (e.currentTarget.style.color = '#ef4444')}
                    onMouseOut={e => (e.currentTarget.style.color = '#334155')}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <style>{`
          @keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
          @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
          textarea:focus { border-color: rgba(34,197,94,.4) !important; box-shadow: 0 0 0 3px rgba(34,197,94,.08); }
        `}</style>
      </div>
    </AppShell>
  )
}
