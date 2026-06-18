'use client'

export const dynamic = 'force-dynamic'

import { useState, KeyboardEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'

const TOTAL_STEPS = 6

const DEFAULT_SUBREDDITS = [
  { name: 'forhire', label: 'r/forhire' },
  { name: 'entrepreneur', label: 'r/entrepreneur' },
  { name: 'smallbusiness', label: 'r/smallbusiness' },
  { name: 'startups', label: 'r/startups' },
  { name: 'webdev', label: 'r/webdev' },
  { name: 'hiring', label: 'r/hiring' },
  { name: 'digitalnomad', label: 'r/digitalnomad' },
]

interface FormData {
  serviceDescription: string
  skills: string[]
  bio: string
  keywords: string[]
  subreddits: string[]
  notificationEmail: string
  notificationPhone: string
  notifyViaSms: boolean
}

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()

  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<FormData>({
    serviceDescription: '',
    skills: [],
    bio: '',
    keywords: [],
    subreddits: [],
    notificationEmail: '',
    notificationPhone: '',
    notifyViaSms: false,
  })

  // Tag input state
  const [skillInput, setSkillInput] = useState('')
  const [customKeyword, setCustomKeyword] = useState('')
  const [customSubreddit, setCustomSubreddit] = useState('')

  // Validation error per step
  const [stepError, setStepError] = useState<string | null>(null)

  // Derive suggested keywords from serviceDescription
  const getSuggestedKeywords = (): string[] => {
    const svc = formData.serviceDescription.trim()
    if (!svc) return []
    // Extract a short noun phrase: take up to the first 4 words
    const words = svc.replace(/^(i |we )?(build|make|create|develop|design|offer|provide|do|write|manage|run|help with)\s+/i, '').split(' ').slice(0, 4).join(' ')
    return [
      `need a ${words}`,
      `looking to hire a ${words}`,
      `anyone recommend a ${words}`,
    ]
  }

  // ---- Handlers ----

  const handleSkillKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const trimmed = skillInput.trim()
      if (trimmed && !formData.skills.includes(trimmed)) {
        setFormData(prev => ({ ...prev, skills: [...prev.skills, trimmed] }))
      }
      setSkillInput('')
    }
  }

  const removeSkill = (skill: string) => {
    setFormData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }))
  }

  const toggleKeyword = (kw: string) => {
    setFormData(prev => {
      const exists = prev.keywords.includes(kw)
      return {
        ...prev,
        keywords: exists ? prev.keywords.filter(k => k !== kw) : [...prev.keywords, kw],
      }
    })
  }

  const addCustomKeyword = () => {
    const trimmed = customKeyword.trim()
    if (trimmed && !formData.keywords.includes(trimmed)) {
      setFormData(prev => ({ ...prev, keywords: [...prev.keywords, trimmed] }))
    }
    setCustomKeyword('')
  }

  const handleCustomKeywordKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addCustomKeyword()
    }
  }

  const removeKeyword = (kw: string) => {
    setFormData(prev => ({ ...prev, keywords: prev.keywords.filter(k => k !== kw) }))
  }

  const toggleSubreddit = (name: string) => {
    setFormData(prev => {
      const exists = prev.subreddits.includes(name)
      return {
        ...prev,
        subreddits: exists ? prev.subreddits.filter(s => s !== name) : [...prev.subreddits, name],
      }
    })
  }

  const addCustomSubreddit = () => {
    const trimmed = customSubreddit.trim().replace(/^r\//i, '')
    if (trimmed && !formData.subreddits.includes(trimmed)) {
      setFormData(prev => ({ ...prev, subreddits: [...prev.subreddits, trimmed] }))
    }
    setCustomSubreddit('')
  }

  const handleCustomSubredditKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addCustomSubreddit()
    }
  }

  const removeSubreddit = (name: string) => {
    setFormData(prev => ({ ...prev, subreddits: prev.subreddits.filter(s => s !== name) }))
  }

  // ---- Validation ----

  const validateStep = (): boolean => {
    setStepError(null)
    switch (currentStep) {
      case 1:
        if (!formData.serviceDescription.trim()) {
          setStepError('Please describe what you do.')
          return false
        }
        return true
      case 2:
        if (formData.skills.length === 0) {
          setStepError('Please add at least one skill.')
          return false
        }
        return true
      case 3:
        if (!formData.bio.trim()) {
          setStepError('Please write a short bio.')
          return false
        }
        return true
      case 4:
        if (formData.keywords.length === 0) {
          setStepError('Please add at least one keyword.')
          return false
        }
        return true
      case 5:
        if (formData.subreddits.length === 0) {
          setStepError('Please select at least one subreddit.')
          return false
        }
        return true
      case 6:
        if (!formData.notificationEmail.trim()) {
          setStepError('Please enter a notification email.')
          return false
        }
        if (formData.notifyViaSms && !formData.notificationPhone.trim()) {
          setStepError('Please enter a phone number for SMS notifications.')
          return false
        }
        return true
      default:
        return true
    }
  }

  const handleNext = async () => {
    if (!validateStep()) return

    if (currentStep === 1) {
      // Pre-populate suggested keywords now that we have the service description
      const suggested = getSuggestedKeywords()
      if (formData.keywords.length === 0) {
        setFormData(prev => ({ ...prev, keywords: suggested }))
      }
    }

    if (currentStep === 6) {
      await handleComplete()
      return
    }

    setCurrentStep(prev => prev + 1)
  }

  const handleBack = () => {
    setStepError(null)
    setCurrentStep(prev => prev - 1)
  }

  // ---- Load session email on mount ----
  // We useEffect-like pattern: fetch on first render if email not set
  const [emailLoaded, setEmailLoaded] = useState(false)
  if (!emailLoaded) {
    setEmailLoaded(true)
    supabase.auth.getSession().then(({ data }) => {
      const email = data.session?.user?.email ?? ''
      setFormData(prev => ({ ...prev, notificationEmail: prev.notificationEmail || email }))
    })
  }

  // ---- Submit ----

  const handleComplete = async () => {
    if (!validateStep()) return
    setIsSubmitting(true)
    setError(null)

    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      if (sessionError || !sessionData.session) {
        setError('Session expired. Please log in again.')
        setIsSubmitting(false)
        return
      }

      const userId = sessionData.session.user.id
      const fullName = sessionData.session.user.user_metadata?.full_name ?? null

      // 1. Update profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          service_description: formData.serviceDescription,
          skills: formData.skills,
          bio: formData.bio,
          notification_email: formData.notificationEmail,
          notification_phone: formData.notifyViaSms ? formData.notificationPhone : null,
          notify_via_sms: formData.notifyViaSms,
        })
        .eq('id', userId)

      if (profileError) {
        setError(`Failed to save profile: ${profileError.message}`)
        setIsSubmitting(false)
        return
      }

      // 2. Insert keywords
      if (formData.keywords.length > 0) {
        const { error: keywordsError } = await supabase
          .from('keywords')
          .insert(
            formData.keywords.map(kw => ({
              user_id: userId,
              keyword: kw,
              is_active: true,
            }))
          )
        if (keywordsError) {
          setError(`Failed to save keywords: ${keywordsError.message}`)
          setIsSubmitting(false)
          return
        }
      }

      // 3. Insert monitored subreddits
      if (formData.subreddits.length > 0) {
        const { error: subredditsError } = await supabase
          .from('monitored_subreddits')
          .insert(
            formData.subreddits.map(name => ({
              user_id: userId,
              subreddit_name: name,
              is_active: true,
            }))
          )
        if (subredditsError) {
          setError(`Failed to save subreddits: ${subredditsError.message}`)
          setIsSubmitting(false)
          return
        }
      }

      router.push('/dashboard')
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      setIsSubmitting(false)
    }
  }

  // ---- Render steps ----

  const suggestedKeywords = getSuggestedKeywords()

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="service-description" className="text-white text-base">
                Describe what you do
              </Label>
              <p className="text-slate-400 text-sm">
                This helps us find the most relevant leads for you.
              </p>
              <Input
                id="service-description"
                value={formData.serviceDescription}
                onChange={e => setFormData(prev => ({ ...prev, serviceDescription: e.target.value }))}
                placeholder="I build websites for small businesses"
                className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 focus-visible:border-green-500 focus-visible:ring-green-500/20 h-11"
              />
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="skills-input" className="text-white text-base">
                Add your skills
              </Label>
              <p className="text-slate-400 text-sm">
                Type a skill and press Enter to add it.
              </p>
              <Input
                id="skills-input"
                value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                onKeyDown={handleSkillKeyDown}
                placeholder="e.g. React, SEO, Copywriting"
                className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 focus-visible:border-green-500 focus-visible:ring-green-500/20 h-11"
              />
            </div>
            {formData.skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.skills.map(skill => (
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
        )

      case 3:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bio" className="text-white text-base">
                Write a short bio
              </Label>
              <p className="text-slate-400 text-sm">
                Our AI uses this to personalize outreach messages on your behalf. Include your experience, specialties, and what makes you unique.
              </p>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={e => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="e.g. I'm a freelance web developer with 5 years of experience building fast, modern websites for small businesses. I specialize in Next.js and Shopify, and I pride myself on clear communication and on-time delivery."
                className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 focus-visible:border-green-500 focus-visible:ring-green-500/20 min-h-32 resize-none"
                rows={5}
              />
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-white text-base">
                Choose keywords to monitor
              </Label>
              <p className="text-slate-400 text-sm">
                We'll alert you when these phrases appear in Reddit posts. Click to toggle suggested keywords, or add your own.
              </p>
            </div>

            {suggestedKeywords.length > 0 && (
              <div className="space-y-2">
                <p className="text-slate-400 text-xs uppercase tracking-wider font-medium">Suggested</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedKeywords.map(kw => {
                    const isSelected = formData.keywords.includes(kw)
                    return (
                      <button
                        key={kw}
                        type="button"
                        onClick={() => toggleKeyword(kw)}
                        className={`inline-flex items-center rounded-full px-3 py-1.5 text-sm border transition-colors ${
                          isSelected
                            ? 'bg-green-500/20 text-green-400 border-green-500/50 hover:bg-green-500/30'
                            : 'bg-slate-800 text-slate-300 border-slate-600 hover:border-green-500/50 hover:text-green-400'
                        }`}
                      >
                        {isSelected ? <span className="mr-1.5 text-xs">&#10003;</span> : <span className="mr-1.5 text-xs">+</span>}
                        {kw}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Input
                value={customKeyword}
                onChange={e => setCustomKeyword(e.target.value)}
                onKeyDown={handleCustomKeywordKeyDown}
                placeholder="Add a custom keyword..."
                className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 focus-visible:border-green-500 focus-visible:ring-green-500/20 h-10"
              />
              <Button
                type="button"
                onClick={addCustomKeyword}
                className="bg-green-500 hover:bg-green-600 text-white border-0 shrink-0"
              >
                Add
              </Button>
            </div>

            {formData.keywords.length > 0 && (
              <div className="space-y-2">
                <p className="text-slate-400 text-xs uppercase tracking-wider font-medium">Active keywords</p>
                <div className="flex flex-wrap gap-2">
                  {formData.keywords.map(kw => (
                    <span
                      key={kw}
                      className="inline-flex items-center gap-1.5 bg-green-500/20 text-green-400 border border-green-500/30 rounded-full px-3 py-1 text-sm"
                    >
                      {kw}
                      <button
                        type="button"
                        onClick={() => removeKeyword(kw)}
                        className="text-green-400 hover:text-white transition-colors leading-none"
                        aria-label={`Remove keyword ${kw}`}
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )

      case 5:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-white text-base">
                Pick subreddits to monitor
              </Label>
              <p className="text-slate-400 text-sm">
                We'll scan these communities for potential clients.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {DEFAULT_SUBREDDITS.map(({ name, label }) => {
                const isChecked = formData.subreddits.includes(name)
                return (
                  <label
                    key={name}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      isChecked
                        ? 'bg-green-500/10 border-green-500/50 text-green-400'
                        : 'bg-slate-800 border-slate-600 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={() => toggleSubreddit(name)}
                      className="border-slate-500 data-checked:bg-green-500 data-checked:border-green-500"
                    />
                    <span className="text-sm font-medium">{label}</span>
                  </label>
                )
              })}
            </div>

            <div className="space-y-2">
              <p className="text-slate-400 text-xs uppercase tracking-wider font-medium">Add custom subreddit</p>
              <div className="flex gap-2">
                <Input
                  value={customSubreddit}
                  onChange={e => setCustomSubreddit(e.target.value)}
                  onKeyDown={handleCustomSubredditKeyDown}
                  placeholder="e.g. freelancers or r/freelancers"
                  className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 focus-visible:border-green-500 focus-visible:ring-green-500/20 h-10"
                />
                <Button
                  type="button"
                  onClick={addCustomSubreddit}
                  className="bg-green-500 hover:bg-green-600 text-white border-0 shrink-0"
                >
                  Add
                </Button>
              </div>
            </div>

            {formData.subreddits.filter(s => !DEFAULT_SUBREDDITS.find(d => d.name === s)).length > 0 && (
              <div className="space-y-2">
                <p className="text-slate-400 text-xs uppercase tracking-wider font-medium">Custom subreddits</p>
                <div className="flex flex-wrap gap-2">
                  {formData.subreddits
                    .filter(s => !DEFAULT_SUBREDDITS.find(d => d.name === s))
                    .map(s => (
                      <span
                        key={s}
                        className="inline-flex items-center gap-1.5 bg-green-500/20 text-green-400 border border-green-500/30 rounded-full px-3 py-1 text-sm"
                      >
                        r/{s}
                        <button
                          type="button"
                          onClick={() => removeSubreddit(s)}
                          className="text-green-400 hover:text-white transition-colors leading-none"
                          aria-label={`Remove r/${s}`}
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                </div>
              </div>
            )}
          </div>
        )

      case 6:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="notification-email" className="text-white text-base">
                Notification email
              </Label>
              <p className="text-slate-400 text-sm">
                We'll send lead alerts to this address.
              </p>
              <Input
                id="notification-email"
                type="email"
                value={formData.notificationEmail}
                onChange={e => setFormData(prev => ({ ...prev, notificationEmail: e.target.value }))}
                placeholder="you@example.com"
                className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 focus-visible:border-green-500 focus-visible:ring-green-500/20 h-11"
              />
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <Checkbox
                  checked={formData.notifyViaSms}
                  onCheckedChange={checked =>
                    setFormData(prev => ({ ...prev, notifyViaSms: checked === true }))
                  }
                  className="border-slate-500 data-checked:bg-green-500 data-checked:border-green-500"
                />
                <span className="text-white text-sm font-medium">Also notify me via SMS</span>
              </label>

              {formData.notifyViaSms && (
                <div className="space-y-2 pl-7">
                  <Label htmlFor="notification-phone" className="text-white text-sm">
                    Phone number
                  </Label>
                  <Input
                    id="notification-phone"
                    type="tel"
                    value={formData.notificationPhone}
                    onChange={e => setFormData(prev => ({ ...prev, notificationPhone: e.target.value }))}
                    placeholder="+1 555 000 0000"
                    className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 focus-visible:border-green-500 focus-visible:ring-green-500/20 h-11"
                  />
                </div>
              )}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const stepTitles = [
    'What do you do?',
    'What are your skills?',
    'Write a short bio',
    'Add your first keywords',
    'Pick subreddits to monitor',
    'How do you want to be notified?',
  ]

  const isLastStep = currentStep === TOTAL_STEPS

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <p className="text-green-500 text-sm font-medium mb-1 uppercase tracking-wider">
            FreelanceAlert Setup
          </p>
          <h1 className="text-white text-2xl font-bold">
            {stepTitles[currentStep - 1]}
          </h1>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-xs">Step {currentStep} of {TOTAL_STEPS}</span>
            <span className="text-slate-400 text-xs">{Math.round((currentStep / TOTAL_STEPS) * 100)}%</span>
          </div>
          <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
            />
          </div>
          <div className="flex gap-1 mt-2">
            {Array.from({ length: TOTAL_STEPS }, (_, i) => (
              <div
                key={i}
                className={`flex-1 h-0.5 rounded-full transition-colors duration-200 ${
                  i + 1 <= currentStep ? 'bg-green-500' : 'bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Card */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 sm:p-8 shadow-xl">
          {renderStep()}

          {/* Step error */}
          {stepError && (
            <p className="mt-4 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {stepError}
            </p>
          )}

          {/* Global error */}
          {error && (
            <p className="mt-4 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-700">
            <Button
              type="button"
              onClick={handleBack}
              disabled={currentStep === 1}
              variant="ghost"
              className="text-slate-400 hover:text-white disabled:opacity-30"
            >
              Back
            </Button>

            <Button
              type="button"
              onClick={handleNext}
              disabled={isSubmitting}
              className="bg-[#22c55e] hover:bg-green-600 text-white font-semibold px-6 border-0 min-w-28"
            >
              {isSubmitting
                ? 'Saving...'
                : isLastStep
                ? 'Complete Setup'
                : 'Next'}
            </Button>
          </div>
        </div>

        {/* Step indicator dots */}
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-200 ${
                i + 1 === currentStep
                  ? 'w-5 h-2 bg-green-500'
                  : i + 1 < currentStep
                  ? 'w-2 h-2 bg-green-700'
                  : 'w-2 h-2 bg-slate-600'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
