import { NextRequest } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  const PLAN_TO_PRICE: Record<string, string | undefined> = {
    starter: process.env.STRIPE_STARTER_PRICE_ID,
    pro: process.env.STRIPE_PRO_PRICE_ID,
  }
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const rateLimitResult = rateLimit(session.user.id, 30)
  if (!rateLimitResult.success) {
    return Response.json({ error: 'Too many requests' }, { status: 429 })
  }

  let body: { plan?: string }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { plan } = body
  const priceId = plan ? PLAN_TO_PRICE[plan] : undefined

  if (!priceId) {
    return Response.json({ error: 'Invalid plan' }, { status: 400 })
  }

  const adminClient = createAdminClient()

  const { data: profile, error: profileError } = await adminClient
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', session.user.id)
    .single()

  if (profileError) {
    return Response.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }

  let customerId = profile?.stripe_customer_id

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: session.user.email,
      metadata: { supabase_user_id: session.user.id },
    })
    customerId = customer.id

    const { error: updateError } = await adminClient
      .from('profiles')
      .update({ stripe_customer_id: customerId })
      .eq('id', session.user.id)

    if (updateError) {
      return Response.json({ error: 'Failed to save customer ID' }, { status: 500 })
    }
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/dashboard?success=true`,
    cancel_url: `${appUrl}/pricing`,
  })

  return Response.json({ url: checkoutSession.url })
}
