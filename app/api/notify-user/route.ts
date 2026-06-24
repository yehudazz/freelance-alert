import { NextRequest } from 'next/server'
import { Resend } from 'resend'
import twilio from 'twilio'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import type { Lead, Profile } from '@/types/database'

const MIN_LEAD_SCORE = 6

function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str
  return str.slice(0, maxLen - 1) + '…'
}

function urgencyColor(urgency: Lead['urgency_level']): string {
  switch (urgency) {
    case 'high':   return '#dc2626'
    case 'medium': return '#d97706'
    case 'low':    return '#16a34a'
    default:       return '#6b7280'
  }
}

function buildEmailHtml(lead: Lead, appUrl: string): string {
  const leadUrl = `${appUrl}/leads/${lead.id}`
  const score = lead.lead_score ?? 0
  const scoreColor = score >= 8 ? '#16a34a' : score >= 6 ? '#d97706' : '#dc2626'
  const urgencyLabel = lead.urgency_level ? lead.urgency_level.charAt(0).toUpperCase() + lead.urgency_level.slice(1) : 'Unknown'

  const budgetRow = lead.has_budget_mentioned && lead.budget_amount != null
    ? `<tr>
        <td style="padding:4px 0;color:#6b7280;font-size:14px;">Budget</td>
        <td style="padding:4px 0;font-size:14px;font-weight:600;">$${lead.budget_amount.toLocaleString()}</td>
      </tr>`
    : ''

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
        <!-- Header -->
        <tr>
          <td style="background:#1d4ed8;padding:24px 32px;">
            <p style="margin:0;color:#ffffff;font-size:20px;font-weight:700;">FreelanceAlert</p>
            <p style="margin:4px 0 0;color:#bfdbfe;font-size:14px;">New lead detected</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:32px;">
            <!-- Score badge -->
            <table cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
              <tr>
                <td style="background:${scoreColor};color:#ffffff;font-size:13px;font-weight:700;padding:4px 12px;border-radius:9999px;">
                  Score ${lead.lead_score}/10
                </td>
              </tr>
            </table>
            <!-- Title -->
            <h2 style="margin:0 0 16px;font-size:18px;color:#111827;line-height:1.4;">${lead.post_title.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</h2>
            <!-- Details table -->
            <table cellpadding="0" cellspacing="0" style="width:100%;border-top:1px solid #e5e7eb;border-bottom:1px solid #e5e7eb;padding:12px 0;margin-bottom:24px;">
              <tr>
                <td style="padding:4px 0;color:#6b7280;font-size:14px;width:100px;">Source</td>
                <td style="padding:4px 0;font-size:14px;">${lead.platform === 'hackernews' ? 'Hacker News' : lead.subreddit ? `Reddit · r/${lead.subreddit.replace(/</g, '&lt;')}` : (lead.platform ?? 'Unknown')}</td>
              </tr>
              <tr>
                <td style="padding:4px 0;color:#6b7280;font-size:14px;">Urgency</td>
                <td style="padding:4px 0;font-size:14px;">
                  <span style="color:${urgencyColor(lead.urgency_level)};font-weight:600;">${urgencyLabel}</span>
                </td>
              </tr>
              ${budgetRow}
            </table>
            <!-- CTA -->
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:#1d4ed8;border-radius:6px;">
                  <a href="${leadUrl}" style="display:inline-block;padding:12px 24px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;">View Lead &rarr;</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:16px 32px;border-top:1px solid #e5e7eb;">
            <p style="margin:0;color:#9ca3af;font-size:12px;">You are receiving this because you have email notifications enabled in FreelanceAlert.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

async function sendEmailNotification(lead: Lead, profile: Profile, appUrl: string): Promise<void> {
  if (!profile.notify_via_email || !profile.notification_email) return

  const resend = new Resend(process.env.RESEND_API_KEY)
  const subject = `New lead: ${truncate(lead.post_title, 60)}`
  const html = buildEmailHtml(lead, appUrl)

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? 'FreelanceAlert <noreply@freelancealert.app>',
    to: profile.notification_email,
    subject,
    html,
  })
}

async function sendSmsNotification(lead: Lead, profile: Profile, appUrl: string): Promise<void> {
  if (!profile.notify_via_sms || !profile.notification_phone) return

  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  const subreddit = lead.subreddit ?? 'unknown'
  const body = `FreelanceAlert: New lead scored ${lead.lead_score ?? 0}/10 on r/${subreddit}. View: ${appUrl}/leads/${lead.id}`

  await client.messages.create({
    body,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: profile.notification_phone,
  })
}

export async function POST(request: NextRequest): Promise<Response> {
  // Auth: accept CRON_SECRET header OR a valid session
  const cronSecret = request.headers.get('x-cron-secret')
  const isValidCronSecret =
    cronSecret != null &&
    process.env.CRON_SECRET != null &&
    cronSecret === process.env.CRON_SECRET

  if (!isValidCronSecret) {
    // Fall back to session check
    try {
      const supabase = await createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 })
      }
    } catch {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  let body: { leadId?: unknown; userId?: unknown }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { leadId, userId } = body
  if (typeof leadId !== 'string' || typeof userId !== 'string') {
    return Response.json({ error: 'leadId and userId must be strings' }, { status: 400 })
  }

  const admin = createAdminClient()

  const [leadResult, profileResult] = await Promise.all([
    admin.from('leads').select('*').eq('id', leadId).single(),
    admin.from('profiles').select('*').eq('id', userId).single(),
  ])

  if (leadResult.error || !leadResult.data) {
    return Response.json({ error: 'Lead not found' }, { status: 404 })
  }
  if (profileResult.error || !profileResult.data) {
    return Response.json({ error: 'User profile not found' }, { status: 404 })
  }

  const lead: Lead = leadResult.data
  const profile: Profile = profileResult.data

  if ((lead.lead_score ?? 0) < MIN_LEAD_SCORE) {
    return Response.json({ skipped: true, reason: 'lead_score below threshold' }, { status: 200 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
  const results: { email?: string; sms?: string } = {}
  const errors: { email?: string; sms?: string } = {}

  if (profile.notify_via_email && profile.notification_email) {
    try {
      await sendEmailNotification(lead, profile, appUrl)
      results.email = 'sent'
    } catch (err) {
      errors.email = err instanceof Error ? err.message : 'unknown error'
    }
  }

  if (profile.notify_via_sms && profile.notification_phone) {
    try {
      await sendSmsNotification(lead, profile, appUrl)
      results.sms = 'sent'
    } catch (err) {
      errors.sms = err instanceof Error ? err.message : 'unknown error'
    }
  }

  const hasErrors = Object.keys(errors).length > 0
  return Response.json(
    { success: !hasErrors, results, ...(hasErrors ? { errors } : {}) },
    { status: hasErrors ? 207 : 200 }
  )
}
