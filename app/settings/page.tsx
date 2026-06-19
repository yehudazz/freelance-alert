'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, KeyboardEvent } from 'react'
import { AppShell } from '@/components/app-shell'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import type { Profile, Subscription } from '@/types/database'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

// ---------------------------------------------------------------------------
// Inline Switch â€“ no shadcn switch component exists in this project
// ---------------------------------------------------------------------------
function Switch({
  checked,
  onCheckedChange,
  disabled,
  id,
}: {
  checked: boolean
  onCheckedChange: (v: boolean) => void
  disabled?: boolean
  id?: string
}) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-50 ${
        checked ? 'bg-green-500' : 'bg-slate-600'
      }`}
    >
      <span
        className={`pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  )
}

// ---------------------------------------------------------------------------
// Inline confirmation dialog
// ---------------------------------------------------------------------------
function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  onConfirm,
  onCancel,
}: {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  onConfirm: () => void
  onCancel: () => void
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-md rounded-xl bg-slate-800 border border-slate-700 p-6 shadow-2xl">
        <h3 className="text-white text-lg font-semibold mb-2">{title}</h3>
        <p className="text-slate-400 text-sm mb-6">{description}</p>
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={onCancel} className="text-slate-300 hover:text-white">
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white border-0"
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Plan badge helper
// ---------------------------------------------------------------------------
function PlanBadge({ tier }: { tier: Profile['subscription_tier'] }) {
  const styles: Record<Profile['subscription_tier'], string> = {
    free: 'bg-slate-700 text-slate-300 border-slate-600',
    starter: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
    pro: 'bg-green-500/20 text-green-400 border-green-500/40',
  }
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ${styles[tier]}`}
    >
      {tier}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)

  // Profile section state
  const [fullName, setFullName] = useState('')
  const [serviceDescription, setServiceDescription] = useState('')
  const [bio, setBio] = useState('')
  const [skills, setSkills] = useState<string[]>([])
  const [skillInput, setSkillInput] = useState('')
  const [profileSaving, setProfileSaving] = useState(false)

  // Notifications section state
  const [notifEmail, setNotifEmail] = useState('')
  const [notifPhone, setNotifPhone] = useState('')
  const [notifyViaSms, setNotifyViaSms] = useState(false)
  const [notifSaving, setNotifSaving] = useState(false)

  // Subscription section state
  const [subscriptionTier, setSubscriptionTier] = useState<Profile['subscription_tier']>('free')
  const [subscriptionStatus, setSubscriptionStatus] = useState<Profile['subscription_status']>('active')
  const [renewalDate, setRenewalDate] = useState<string | null>(null)
  const [stripeCustomerId, setStripeCustomerId] = useState<string | null>(null)
  const [checkoutLoading, setCheckoutLoading] = useState<'starter' | 'pro' | null>(null)

  // Danger zone state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // ---------------------------------------------------------------------------
  // Load profile on mount
  // ---------------------------------------------------------------------------
  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch('/api/profile')
        if (!res.ok) {
          if (res.status === 401) {
            router.push('/login')
            return
          }
          throw new Error('Failed to load profile')
        }
        const { profile } = (await res.json()) as { profile: Profile }

        setFullName(profile.full_name ?? '')
        setServiceDescription(profile.service_description ?? '')
        setBio(profile.bio ?? '')
        setSkills(profile.skills ?? [])
        setNotifEmail(profile.notification_email ?? '')
        setNotifPhone(profile.notification_phone ?? '')
        setNotifyViaSms(profile.notify_via_sms ?? false)
        setSubscriptionTier(profile.subscription_tier)
        setSubscriptionStatus(profile.subscription_status)
        setStripeCustomerId(profile.stripe_customer_id ?? null)

        // Load subscription renewal date from subscriptions table
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          const { data: sub } = await supabase
            .from('subscriptions')
            .select('current_period_end')
            .eq('user_id', session.user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()

          if (sub?.current_period_end) {
            setRenewalDate(sub.current_period_end)
          }
        }
      } catch {
        toast.error('Failed to load settings')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [router, supabase])

  // ---------------------------------------------------------------------------
  // Skills tag input
  // ---------------------------------------------------------------------------
  const handleSkillKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const trimmed = skillInput.trim()
      if (trimmed && !skills.includes(trimmed)) {
        setSkills(prev => [...prev, trimmed])
      }
      setSkillInput('')
    }
  }

  const removeSkill = (skill: string) => {
    setSkills(prev => prev.filter(s => s !== skill))
  }

  // ---------------------------------------------------------------------------
  // Save profile (PATCH /api/profile)
  // ---------------------------------------------------------------------------
  async function saveProfile() {
    setProfileSaving(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName || null,
          service_description: serviceDescription || null,
          bio: bio || null,
          skills,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to save profile')
      }
      toast.success('Profile saved')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save profile')
    } finally {
      setProfileSaving(false)
    }
  }

  // ---------------------------------------------------------------------------
  // Save notifications (PATCH /api/profile)
  // ---------------------------------------------------------------------------
  async function saveNotifications() {
    setNotifSaving(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notification_email: notifEmail || null,
          notification_phone: notifyViaSms ? (notifPhone || null) : null,
          notify_via_sms: notifyViaSms,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to save notifications')
      }
      toast.success('Notification settings saved')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save notifications')
    } finally {
      setNotifSaving(false)
    }
  }

  // ---------------------------------------------------------------------------
  // Stripe checkout
  // ---------------------------------------------------------------------------
  async function startCheckout(plan: 'starter' | 'pro') {
    setCheckoutLoading(plan)
    try {
      const priceId =
        plan === 'starter'
          ? process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID
          : process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID

      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to start checkout')
      }
      const { url } = await res.json()
      if (url) window.location.href = url
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to start checkout')
    } finally {
      setCheckoutLoading(null)
    }
  }

  // ---------------------------------------------------------------------------
  // Delete account
  // ---------------------------------------------------------------------------
  async function deleteAccount() {
    setDeleting(true)
    try {
      const res = await fetch('/api/account/delete', { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? 'Failed to delete account')
      }
      await supabase.auth.signOut()
      router.push('/')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete account')
      setDeleting(false)
      setDeleteDialogOpen(false)
    }
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="text-slate-400 text-sm">Loading settings...</div>
      </div>
    )
  }

  const isPaidPlan = subscriptionTier !== 'free'

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

  return (
    <AppShell>
    <div className="py-10 px-4">
      <div className="mx-auto max-w-2xl space-y-8">
        {/* Page heading */}
        <div>
          <h1 className="text-white text-2xl font-bold">Settings</h1>
          <p className="text-slate-400 text-sm mt-1">Manage your account and preferences</p>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* 1. PROFILE                                                          */}
        {/* ------------------------------------------------------------------ */}
        <Card className="bg-slate-800/50 border-slate-700 ring-0">
          <CardHeader className="pb-0">
            <CardTitle className="text-white text-base font-semibold">Profile</CardTitle>
            <CardDescription className="text-slate-400 text-sm">
              Update your public profile information
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-5">
            {/* Full name */}
            <div className="space-y-1.5">
              <Label htmlFor="full-name" className="text-slate-200 text-sm">
                Full name
              </Label>
              <Input
                id="full-name"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Jane Smith"
                className="bg-slate-900 border-slate-600 text-white placeholder:text-slate-500 focus-visible:border-green-500 focus-visible:ring-green-500/20 h-10"
              />
            </div>

            {/* Service description */}
            <div className="space-y-1.5">
              <Label htmlFor="service-description" className="text-slate-200 text-sm">
                Service description
              </Label>
              <Input
                id="service-description"
                value={serviceDescription}
                onChange={e => setServiceDescription(e.target.value)}
                placeholder="I build websites for small businesses"
                maxLength={500}
                className="bg-slate-900 border-slate-600 text-white placeholder:text-slate-500 focus-visible:border-green-500 focus-visible:ring-green-500/20 h-10"
              />
            </div>

            {/* Skills tag input */}
            <div className="space-y-1.5">
              <Label htmlFor="skills-input" className="text-slate-200 text-sm">
                Skills
              </Label>
              <p className="text-slate-500 text-xs">Type a skill and press Enter to add it</p>
              <Input
                id="skills-input"
                value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                onKeyDown={handleSkillKeyDown}
                placeholder="e.g. React, SEO, Copywriting"
                className="bg-slate-900 border-slate-600 text-white placeholder:text-slate-500 focus-visible:border-green-500 focus-visible:ring-green-500/20 h-10"
              />
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {skills.map(skill => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 bg-green-500/20 text-green-400 border border-green-500/30 rounded-full px-3 py-1 text-sm"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="text-green-400 hover:text-white transition-colors leading-none"
                        aria-label={`Remove ${skill}`}
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Bio */}
            <div className="space-y-1.5">
              <Label htmlFor="bio" className="text-slate-200 text-sm">
                Bio
              </Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder="Tell us a bit about your experience and what makes you unique..."
                maxLength={500}
                rows={4}
                className="bg-slate-900 border-slate-600 text-white placeholder:text-slate-500 focus-visible:border-green-500 focus-visible:ring-green-500/20 resize-none"
              />
            </div>

            <div className="flex justify-end pt-1">
              <Button
                onClick={saveProfile}
                disabled={profileSaving}
                className="bg-green-500 hover:bg-green-600 text-white border-0 min-w-24"
              >
                {profileSaving ? 'Saving...' : 'Save profile'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ------------------------------------------------------------------ */}
        {/* 2. NOTIFICATIONS                                                    */}
        {/* ------------------------------------------------------------------ */}
        <Card className="bg-slate-800/50 border-slate-700 ring-0">
          <CardHeader className="pb-0">
            <CardTitle className="text-white text-base font-semibold">Notifications</CardTitle>
            <CardDescription className="text-slate-400 text-sm">
              Control how and where you receive lead alerts
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="notif-email" className="text-slate-200 text-sm">
                Email address
              </Label>
              <Input
                id="notif-email"
                type="email"
                value={notifEmail}
                onChange={e => setNotifEmail(e.target.value)}
                placeholder="you@example.com"
                className="bg-slate-900 border-slate-600 text-white placeholder:text-slate-500 focus-visible:border-green-500 focus-visible:ring-green-500/20 h-10"
              />
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <Label htmlFor="notif-phone" className="text-slate-200 text-sm">
                Phone number
              </Label>
              <Input
                id="notif-phone"
                type="tel"
                value={notifPhone}
                onChange={e => setNotifPhone(e.target.value)}
                placeholder="+1 555 000 0000"
                className="bg-slate-900 border-slate-600 text-white placeholder:text-slate-500 focus-visible:border-green-500 focus-visible:ring-green-500/20 h-10"
              />
            </div>

            {/* SMS toggle */}
            <div className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-900/50 px-4 py-3">
              <div>
                <p className="text-slate-200 text-sm font-medium">SMS notifications</p>
                <p className="text-slate-500 text-xs mt-0.5">
                  {notifPhone
                    ? 'Receive alerts by text message'
                    : 'Enter a phone number above to enable SMS'}
                </p>
              </div>
              <Switch
                id="sms-toggle"
                checked={notifyViaSms}
                onCheckedChange={v => {
                  if (v && !notifPhone.trim()) {
                    toast.error('Please enter a phone number first')
                    return
                  }
                  setNotifyViaSms(v)
                }}
                disabled={!notifPhone.trim()}
              />
            </div>

            <div className="flex justify-end pt-1">
              <Button
                onClick={saveNotifications}
                disabled={notifSaving}
                className="bg-green-500 hover:bg-green-600 text-white border-0 min-w-24"
              >
                {notifSaving ? 'Saving...' : 'Save notifications'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ------------------------------------------------------------------ */}
        {/* 3. SUBSCRIPTION                                                     */}
        {/* ------------------------------------------------------------------ */}
        <Card className="bg-slate-800/50 border-slate-700 ring-0">
          <CardHeader className="pb-0">
            <CardTitle className="text-white text-base font-semibold">Subscription</CardTitle>
            <CardDescription className="text-slate-400 text-sm">
              Manage your plan and billing
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-5">
            {/* Current plan */}
            <div className="flex items-center gap-3">
              <span className="text-slate-300 text-sm">Current plan:</span>
              <PlanBadge tier={subscriptionTier} />
            </div>

            {/* Status */}
            <div className="flex items-center gap-3">
              <span className="text-slate-300 text-sm">Status:</span>
              <span
                className={`text-sm font-medium capitalize ${
                  subscriptionStatus === 'active'
                    ? 'text-green-400'
                    : subscriptionStatus === 'trialing'
                    ? 'text-blue-400'
                    : 'text-slate-400'
                }`}
              >
                {subscriptionStatus}
              </span>
            </div>

            {/* Renewal date */}
            {renewalDate && (
              <div className="flex items-center gap-3">
                <span className="text-slate-300 text-sm">Billing renews:</span>
                <span className="text-slate-200 text-sm">{formatDate(renewalDate)}</span>
              </div>
            )}

            <Separator className="border-slate-700" />

            {isPaidPlan ? (
              /* Manage billing for paid users */
              <div className="space-y-2">
                <p className="text-slate-400 text-sm">
                  You are on the <span className="capitalize text-slate-200 font-medium">{subscriptionTier}</span> plan.
                </p>
                <Button
                  variant="outline"
                  onClick={async () => {
                    // Redirect to Stripe customer portal via checkout (or a portal endpoint if implemented)
                    toast.info('Redirecting to billing portal...')
                    try {
                      const res = await fetch('/api/stripe/create-portal', { method: 'POST' })
                      if (res.ok) {
                        const { url } = await res.json()
                        if (url) window.location.href = url
                      } else {
                        // Fallback: re-run checkout to let Stripe manage the subscription
                        toast.error('Billing portal unavailable. Please contact support.')
                      }
                    } catch {
                      toast.error('Could not open billing portal')
                    }
                  }}
                  className="border-slate-600 text-slate-200 hover:bg-slate-700 hover:text-white"
                >
                  Manage Billing
                </Button>
              </div>
            ) : (
              /* Upgrade buttons for free users */
              <div className="space-y-3">
                <p className="text-slate-400 text-sm">Upgrade to unlock more leads and features.</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={() => startCheckout('starter')}
                    disabled={checkoutLoading !== null}
                    className="bg-blue-600 hover:bg-blue-700 text-white border-0 flex-1"
                  >
                    {checkoutLoading === 'starter' ? 'Redirecting...' : 'Upgrade to Starter'}
                  </Button>
                  <Button
                    onClick={() => startCheckout('pro')}
                    disabled={checkoutLoading !== null}
                    className="bg-green-500 hover:bg-green-600 text-white border-0 flex-1"
                  >
                    {checkoutLoading === 'pro' ? 'Redirecting...' : 'Upgrade to Pro'}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
    </AppShell>
  )
}
