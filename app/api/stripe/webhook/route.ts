import { NextRequest } from 'next/server'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig) {
    return new Response('Missing stripe-signature header', { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return new Response('Invalid signature', { status: 400 })
  }

  const adminClient = createAdminClient()

  if (
    event.type === 'customer.subscription.created' ||
    event.type === 'customer.subscription.updated'
  ) {
    const subscription = event.data.object as Stripe.Subscription
    const customerId = subscription.customer as string
    const stripeSubscriptionId = subscription.id
    const status = subscription.status
    const priceId = subscription.items.data[0]?.price.id
    const currentPeriodEnd = new Date(
      (subscription as unknown as { current_period_end: number }).current_period_end * 1000
    ).toISOString()

    const starterPriceId = process.env.STRIPE_STARTER_PRICE_ID!
    const proPriceId = process.env.STRIPE_PRO_PRICE_ID!
    const plan: 'starter' | 'pro' = priceId === proPriceId ? 'pro' : 'starter'
    const subscriptionTier: 'starter' | 'pro' = plan
    const subscriptionStatus: 'active' | 'cancelled' | 'trialing' =
      status === 'trialing' ? 'trialing' : status === 'active' ? 'active' : 'cancelled'

    const { data: profileData } = await adminClient
      .from('profiles')
      .select('id')
      .eq('stripe_customer_id', customerId)
      .single()

    if (profileData) {
      await adminClient
        .from('subscriptions')
        .upsert(
          {
            user_id: profileData.id,
            stripe_subscription_id: stripeSubscriptionId,
            plan,
            status,
            current_period_end: currentPeriodEnd,
          },
          { onConflict: 'stripe_subscription_id' }
        )

      await adminClient
        .from('profiles')
        .update({
          subscription_tier: subscriptionTier,
          subscription_status: subscriptionStatus,
        })
        .eq('id', profileData.id)
    }
  } else if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription
    const customerId = subscription.customer as string
    const stripeSubscriptionId = subscription.id

    const { data: profileData } = await adminClient
      .from('profiles')
      .select('id')
      .eq('stripe_customer_id', customerId)
      .single()

    if (profileData) {
      await adminClient
        .from('subscriptions')
        .update({ status: 'canceled' })
        .eq('stripe_subscription_id', stripeSubscriptionId)

      await adminClient
        .from('profiles')
        .update({
          subscription_status: 'cancelled',
          subscription_tier: 'free',
        })
        .eq('id', profileData.id)
    }
  }

  return new Response('OK', { status: 200 })
}
