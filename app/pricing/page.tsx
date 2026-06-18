import Link from 'next/link'
import { CheckIcon, XMarkIcon } from './icons'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { CheckoutButton } from './checkout-button'

export const metadata = {
  title: 'Pricing – FreelanceAlert',
  description:
    "Simple, transparent pricing. Start free, upgrade when you're ready to land more freelance clients.",
}

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    description: 'Get a feel for FreelanceAlert with no commitment.',
    badge: null,
    features: [
      { label: '5 leads per month', included: true },
      { label: 'Email notifications', included: true },
      { label: 'Monitor 2 subreddits', included: true },
      { label: 'AI-drafted messages', included: false },
      { label: 'Custom keywords', included: false },
      { label: 'SMS notifications', included: false },
      { label: 'Priority monitoring', included: false },
    ],
    cta: {
      label: 'Get Started Free',
      href: '/signup',
      variant: 'outline' as const,
    },
  },
  {
    name: 'Starter',
    price: '$19',
    period: '/month',
    description: 'Everything you need to consistently land new clients.',
    badge: 'Most Popular',
    features: [
      { label: '50 leads per month', included: true },
      { label: 'AI-drafted messages', included: true },
      { label: 'Email notifications', included: true },
      { label: 'Monitor 10 subreddits', included: true },
      { label: 'Custom keywords', included: true },
      { label: 'SMS notifications', included: false },
      { label: 'Priority monitoring', included: false },
    ],
    cta: {
      label: 'Start Free Trial',
      priceId: 'starter',
      variant: 'primary' as const,
    },
  },
  {
    name: 'Pro',
    price: '$49',
    period: '/month',
    description: 'For serious freelancers who want every edge.',
    badge: null,
    features: [
      { label: 'Unlimited leads', included: true },
      { label: 'AI-drafted messages', included: true },
      { label: 'Email + SMS notifications', included: true },
      { label: 'Unlimited subreddits', included: true },
      { label: 'Custom keywords', included: true },
      { label: 'Priority monitoring (every 2 min)', included: true },
      { label: 'Early access to new features', included: true },
    ],
    cta: {
      label: 'Go Pro',
      priceId: 'pro',
      variant: 'outline' as const,
    },
  },
]

const faqs = [
  {
    q: 'Do I need a credit card to start?',
    a: 'No. The Free plan requires no credit card. You only need to add payment details when upgrading to Starter or Pro.',
  },
  {
    q: 'What counts as a "lead"?',
    a: 'A lead is a Reddit post that matches your keywords and subreddits. Each unique matching post shown to you counts as one lead.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. There are no contracts or lock-ins. You can cancel or downgrade at any time from your account settings.',
  },
  {
    q: 'What is AI message drafting?',
    a: 'When a lead is found, FreelanceAlert uses your bio and the post context to draft a personalized outreach message you can send with one click or tweak first.',
  },
  {
    q: 'How does priority monitoring work?',
    a: "Pro accounts have their subreddits checked every 2 minutes instead of every 15 minutes, so you're first to respond to fresh posts.",
  },
  {
    q: 'What happens when I hit my monthly lead limit?',
    a: 'Monitoring pauses until your limit resets at the start of the next billing cycle. You can upgrade at any time to immediately resume.',
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      {/* Header */}
      <section className="pt-20 pb-12 px-4 text-center">
        <p className="text-green-500 text-sm font-medium uppercase tracking-wider mb-3">
          Pricing
        </p>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
          Simple, honest pricing
        </h1>
        <p className="text-slate-400 text-lg max-w-xl mx-auto">
          Start for free. Upgrade when you're ready to land more clients — no
          surprise fees, no lock-in.
        </p>
      </section>

      {/* Pricing grid */}
      <section className="px-4 pb-20 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {plans.map((plan) => {
            const isPopular = plan.badge === 'Most Popular'
            return (
              <Card
                key={plan.name}
                className={[
                  'relative flex flex-col bg-slate-800/60 border-slate-700 text-white',
                  isPopular
                    ? 'border-green-500/60 shadow-[0_0_0_1px_rgba(34,197,94,0.4)] md:scale-105'
                    : '',
                ].join(' ')}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-green-500 text-white border-0 px-3 py-1 text-xs font-semibold uppercase tracking-wide shadow-lg">
                      {plan.badge}
                    </Badge>
                  </div>
                )}

                <CardHeader className="pt-8 pb-2">
                  <CardTitle className="text-xl font-bold text-white">
                    {plan.name}
                  </CardTitle>
                  <div className="flex items-end gap-1 mt-2">
                    <span className="text-4xl font-extrabold text-white">
                      {plan.price}
                    </span>
                    <span className="text-slate-400 text-base mb-1">
                      {plan.period}
                    </span>
                  </div>
                  <CardDescription className="text-slate-400 mt-2">
                    {plan.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-1 py-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li
                        key={feature.label}
                        className="flex items-start gap-2.5 text-sm"
                      >
                        {feature.included ? (
                          <CheckIcon className="mt-0.5 size-4 shrink-0 text-green-400" />
                        ) : (
                          <XMarkIcon className="mt-0.5 size-4 shrink-0 text-slate-600" />
                        )}
                        <span
                          className={
                            feature.included ? 'text-slate-200' : 'text-slate-500'
                          }
                        >
                          {feature.label}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="pt-2 pb-6 bg-transparent border-0">
                  {'href' in plan.cta ? (
                    <Link
                      href={plan.cta.href ?? '/'}
                      className={[
                        'w-full inline-flex items-center justify-center rounded-lg h-10 px-4 text-sm font-semibold transition-colors',
                        'border border-slate-600 text-white hover:bg-slate-700',
                      ].join(' ')}
                    >
                      {plan.cta.label}
                    </Link>
                  ) : (
                    <CheckoutButton
                      priceId={plan.cta.priceId!}
                      label={plan.cta.label}
                      variant={plan.cta.variant}
                    />
                  )}
                </CardFooter>
              </Card>
            )
          })}
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 pb-24 max-w-3xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10">
          Frequently asked questions
        </h2>
        <dl className="space-y-6">
          {faqs.map((item) => (
            <div
              key={item.q}
              className="border border-slate-700 rounded-xl px-6 py-5 bg-slate-800/40"
            >
              <dt className="text-base font-semibold text-white mb-2">
                {item.q}
              </dt>
              <dd className="text-slate-400 text-sm leading-relaxed">{item.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Bottom CTA strip */}
      <section className="border-t border-slate-800 bg-slate-900/60 px-4 py-14 text-center">
        <h3 className="text-2xl font-bold mb-3">
          Ready to find your next client?
        </h3>
        <p className="text-slate-400 mb-6">
          Join freelancers already using FreelanceAlert to win more business.
        </p>
        <Link
          href="/signup"
          className="inline-flex items-center justify-center rounded-lg bg-green-500 hover:bg-green-600 text-white font-semibold px-8 py-3 text-sm transition-colors"
        >
          Get Started Free
        </Link>
      </section>
    </div>
  )
}
