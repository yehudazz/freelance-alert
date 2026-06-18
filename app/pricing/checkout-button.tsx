'use client'

import { useState } from 'react'

interface CheckoutButtonProps {
  priceId: string
  label: string
  variant: 'primary' | 'outline'
}

export function CheckoutButton({ priceId, label, variant }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      })

      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: 'Unknown error' }))
        console.error('Checkout error:', error)
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
      {loading ? 'Redirecting...' : label}
    </button>
  )
}
