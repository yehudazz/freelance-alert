'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface CheckoutButtonProps {
  plan: 'starter' | 'pro'
  label: string
  variant: 'primary' | 'outline'
}

export function CheckoutButton({ plan, label, variant }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleClick = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })

      if (res.status === 401) {
        router.push('/login?redirect=/pricing')
        return
      }

      if (!res.ok) {
        console.error('Checkout error:', await res.text())
        setLoading(false)
        return
      }

      const { url } = await res.json()
      if (url) {
        window.location.href = url
      } else {
        setLoading(false)
      }
    } catch (err) {
      console.error('Checkout error:', err)
      setLoading(false)
    }
  }

  const baseClasses =
    'w-full inline-flex items-center justify-center rounded-lg h-10 px-4 text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed'

  const variantClasses =
    variant === 'primary'
      ? 'bg-green-500 hover:bg-green-600 text-white border-0'
      : 'border border-slate-600 text-white hover:bg-slate-700'

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={`${baseClasses} ${variantClasses}`}
    >
      {loading ? 'Redirecting to Stripe...' : label}
    </button>
  )
}
