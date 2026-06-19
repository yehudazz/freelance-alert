'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const NAV = [
  { href: '/dashboard', icon: '⊞', label: 'Dashboard' },
  { href: '/leads',     icon: '⚡', label: 'Leads' },
  { href: '/keywords',  icon: '🎯', label: 'Keywords' },
  { href: '/settings',  icon: '⚙', label: 'Settings' },
]

function PlanBadge({ tier }: { tier: string }) {
  const colors: Record<string, string> = {
    free:    'background:#1e293b;color:#64748b;border:1px solid #334155',
    starter: 'background:rgba(34,197,94,.12);color:#4ade80;border:1px solid rgba(34,197,94,.3)',
    pro:     'background:rgba(168,85,247,.12);color:#c084fc;border:1px solid rgba(168,85,247,.3)',
  }
  const style = colors[tier] ?? colors.free
  return (
    <span style={{ ...Object.fromEntries(style.split(';').map(s => { const [k, v] = s.split(':'); return [k.trim().replace(/-([a-z])/g, (_, c) => c.toUpperCase()), v?.trim()] })), borderRadius: '9999px', padding: '.2rem .625rem', fontSize: '.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em' }}>
      {tier}
    </span>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<{ email: string; name?: string } | null>(null)
  const [plan, setPlan] = useState('free')
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      setUser({ email: user.email ?? '', name: user.user_metadata?.full_name })
      supabase.from('profiles').select('subscription_tier').eq('id', user.id).single()
        .then(({ data }) => { if (data?.subscription_tier) setPlan(data.subscription_tier) })
    })
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() ?? '?'

  const Sidebar = () => (
    <aside style={{
      width: 240, flexShrink: 0,
      background: '#030d1a',
      borderRight: '1px solid #0f2040',
      display: 'flex', flexDirection: 'column',
      height: '100vh', position: 'sticky', top: 0,
      overflowY: 'auto',
    }}>
      {/* Logo */}
      <div style={{ padding: '1.25rem 1.25rem .75rem', borderBottom: '1px solid #0f2040' }}>
        <Link href="/dashboard" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
          <span style={{ fontWeight: 900, fontSize: '1.1rem', letterSpacing: '-.02em', color: '#e2e8f0' }}>
            Freelance<span style={{ color: '#22c55e' }}>Alert</span>
          </span>
        </Link>
        <div style={{ marginTop: '.5rem' }}>
          <PlanBadge tier={plan} />
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: '.75rem .75rem', flex: 1 }}>
        <p style={{ fontSize: '.68rem', fontWeight: 700, color: '#1e3a5f', letterSpacing: '.08em', textTransform: 'uppercase', padding: '.25rem .5rem .5rem', margin: 0 }}>Menu</p>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '.25rem' }}>
          {NAV.map(item => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <li key={item.href}>
                <Link href={item.href} onClick={() => setMobileOpen(false)} style={{
                  display: 'flex', alignItems: 'center', gap: '.75rem',
                  padding: '.625rem .75rem', borderRadius: '.625rem',
                  textDecoration: 'none', fontSize: '.9rem', fontWeight: active ? 600 : 400,
                  color: active ? '#e2e8f0' : '#475569',
                  background: active ? 'rgba(34,197,94,.08)' : 'transparent',
                  border: active ? '1px solid rgba(34,197,94,.15)' : '1px solid transparent',
                  transition: 'all .15s',
                }}>
                  <span style={{ fontSize: '1rem', width: 20, textAlign: 'center' }}>{item.icon}</span>
                  {item.label}
                  {active && <span style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />}
                </Link>
              </li>
            )
          })}
        </ul>

        {/* Upgrade CTA */}
        {plan === 'free' && (
          <div style={{ margin: '1.25rem 0 0', padding: '1rem', background: 'rgba(34,197,94,.06)', border: '1px solid rgba(34,197,94,.15)', borderRadius: '.875rem' }}>
            <p style={{ margin: '0 0 .25rem', fontSize: '.8rem', fontWeight: 700, color: '#4ade80' }}>Upgrade to Starter</p>
            <p style={{ margin: '0 0 .75rem', fontSize: '.75rem', color: '#334155', lineHeight: 1.5 }}>Unlock AI drafts and 50 leads/mo</p>
            <Link href="/pricing" style={{ display: 'block', textAlign: 'center', background: 'linear-gradient(135deg,#22c55e,#16a34a)', color: '#020817', fontWeight: 700, fontSize: '.8rem', padding: '.5rem', borderRadius: '.5rem', textDecoration: 'none' }}>
              Upgrade →
            </Link>
          </div>
        )}
      </nav>

      {/* User footer */}
      <div style={{ padding: '.875rem 1rem', borderTop: '1px solid #0f2040' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '.625rem' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#22c55e,#0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.75rem', fontWeight: 700, color: '#020817', flexShrink: 0 }}>
            {initials}
          </div>
          <div style={{ minWidth: 0 }}>
            {user?.name && <p style={{ margin: 0, fontSize: '.8rem', fontWeight: 600, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</p>}
            <p style={{ margin: 0, fontSize: '.72rem', color: '#334155', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</p>
          </div>
        </div>
        <button onClick={handleSignOut} style={{ width: '100%', padding: '.5rem', background: 'transparent', border: '1px solid #0f2040', borderRadius: '.5rem', color: '#334155', fontSize: '.8rem', cursor: 'pointer', transition: 'all .15s', textAlign: 'center' }}
          onMouseOver={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#ef4444'; (e.currentTarget as HTMLButtonElement).style.color = '#ef4444' }}
          onMouseOut={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#0f2040'; (e.currentTarget as HTMLButtonElement).style.color = '#334155' }}>
          Sign out
        </button>
      </div>
    </aside>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#020817', color: '#e2e8f0', fontFamily: 'system-ui,-apple-system,sans-serif' }}>

      {/* Desktop sidebar */}
      <div className="hide-on-mobile" style={{ display: 'flex' }}>
        <Sidebar />
      </div>

      {/* Mobile top bar */}
      <style>{`
        @media (max-width: 768px) {
          .hide-on-mobile { display: none !important; }
          .show-on-mobile { display: flex !important; }
        }
        @media (min-width: 769px) {
          .show-on-mobile { display: none !important; }
        }
        .mobile-overlay { position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:40; }
        .mobile-sidebar { position:fixed;left:0;top:0;bottom:0;z-index:50;width:260px; }
      `}</style>

      <div className="show-on-mobile" style={{ display: 'none', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 30, background: '#030d1a', borderBottom: '1px solid #0f2040', padding: '.75rem 1rem', alignItems: 'center', justifyContent: 'space-between', height: 52 }}>
        <span style={{ fontWeight: 900, fontSize: '1rem', color: '#e2e8f0' }}>Freelance<span style={{ color: '#22c55e' }}>Alert</span></span>
        <button onClick={() => setMobileOpen(true)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.25rem', cursor: 'pointer', padding: '.25rem' }}>☰</button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div className="mobile-overlay" onClick={() => setMobileOpen(false)} />
          <div className="mobile-sidebar">
            <Sidebar />
          </div>
        </>
      )}

      {/* Main content */}
      <main style={{ flex: 1, minWidth: 0, paddingTop: 0 }} className="mobile-pt">
        <style>{`.mobile-pt { padding-top: 0; } @media (max-width: 768px) { .mobile-pt { padding-top: 52px; } }`}</style>
        {children}
      </main>
    </div>
  )
}
