import Link from "next/link";

export default function Home() {
  return (
    <div style={{ backgroundColor: "#0f172a", color: "#ffffff", fontFamily: "system-ui, -apple-system, sans-serif", minHeight: "100vh" }}>

      {/* NAV */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        backgroundColor: "rgba(15,23,42,0.9)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid #1e293b",
        padding: "0 2rem", height: "64px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <span style={{ fontWeight: 800, fontSize: "1.25rem", letterSpacing: "-0.02em" }}>
          Freelance<span style={{ color: "#22c55e" }}>Alert</span>
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <Link href="#how-it-works" style={{ color: "#94a3b8", textDecoration: "none", fontSize: "0.9rem" }}>How it works</Link>
          <Link href="#pricing" style={{ color: "#94a3b8", textDecoration: "none", fontSize: "0.9rem" }}>Pricing</Link>
          <Link href="/login" style={{ color: "#94a3b8", textDecoration: "none", fontSize: "0.9rem" }}>Log in</Link>
          <Link href="/signup" style={{
            backgroundColor: "#22c55e", color: "#0f172a",
            padding: "0.5rem 1.25rem", borderRadius: "0.5rem",
            fontWeight: 700, fontSize: "0.9rem", textDecoration: "none",
          }}>Get Started</Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{
        padding: "6rem 2rem 4rem",
        textAlign: "center",
        maxWidth: "900px",
        margin: "0 auto",
      }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "0.5rem",
          backgroundColor: "#0d2818", border: "1px solid #166534",
          borderRadius: "9999px", padding: "0.35rem 1rem",
          fontSize: "0.8rem", color: "#4ade80", marginBottom: "2rem",
        }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#22c55e", display: "inline-block" }} />
          Monitoring Reddit 24/7
        </div>
        <h1 style={{
          fontSize: "clamp(2.5rem, 7vw, 4.5rem)",
          fontWeight: 900, lineHeight: 1.08,
          letterSpacing: "-0.03em", marginBottom: "1.5rem",
        }}>
          Never Miss a Client<br />
          <span style={{ color: "#22c55e" }}>Opportunity</span> Again
        </h1>
        <p style={{
          fontSize: "clamp(1rem, 2.5vw, 1.25rem)",
          color: "#94a3b8", maxWidth: "600px",
          margin: "0 auto 2.5rem", lineHeight: 1.7,
        }}>
          FreelanceAlert watches Reddit around the clock. The moment someone posts about needing your services, we score the lead, draft your pitch, and put it one tap away from sending.
        </p>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center", marginBottom: "4rem" }}>
          <Link href="/signup" style={{
            backgroundColor: "#22c55e", color: "#0f172a",
            padding: "0.875rem 2rem", borderRadius: "0.5rem",
            fontWeight: 700, fontSize: "1rem", textDecoration: "none",
          }}>Start for Free</Link>
          <Link href="#how-it-works" style={{
            border: "1px solid #334155", color: "#cbd5e1",
            padding: "0.875rem 2rem", borderRadius: "0.5rem",
            fontWeight: 600, fontSize: "1rem", textDecoration: "none",
          }}>See How It Works</Link>
        </div>
        {/* Stats row */}
        <div style={{
          display: "flex", justifyContent: "center", gap: "3rem",
          flexWrap: "wrap", borderTop: "1px solid #1e293b", paddingTop: "2.5rem",
        }}>
          {[["24/7", "Reddit monitoring"], ["< 5 min", "Lead detection"], ["AI-drafted", "Outreach messages"]].map(([val, label]) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#22c55e" }}>{val}</div>
              <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "0.25rem" }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" style={{ padding: "6rem 2rem", backgroundColor: "#0a1120" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <p style={{ textAlign: "center", color: "#22c55e", fontWeight: 700, fontSize: "0.85rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "1rem" }}>How It Works</p>
          <h2 style={{ textAlign: "center", fontSize: "clamp(1.75rem, 4vw, 2.75rem)", fontWeight: 800, marginBottom: "1rem", letterSpacing: "-0.02em" }}>
            From Reddit post to sent DM in minutes
          </h2>
          <p style={{ textAlign: "center", color: "#64748b", maxWidth: "500px", margin: "0 auto 3.5rem", lineHeight: 1.7 }}>
            Four steps run automatically in the background so you can focus on doing the work.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "1.5rem" }}>
            {[
              { step: "1", title: "Monitor", icon: "🔍", desc: "We scan hundreds of subreddits 24/7 matching your keywords and skill set." },
              { step: "2", title: "Score", icon: "⚡", desc: "AI scores every post 1–10 for hiring intent, budget signals, and urgency." },
              { step: "3", title: "Draft", icon: "✍️", desc: "A personalized outreach message is written for every lead scoring 6+." },
              { step: "4", title: "Send", icon: "🚀", desc: "Review in one tap, edit if you want, then fire off the Reddit DM." },
            ].map((item) => (
              <div key={item.step} style={{
                backgroundColor: "#0f172a", borderRadius: "1rem",
                padding: "2rem", border: "1px solid #1e293b",
                display: "flex", flexDirection: "column", gap: "1rem",
              }}>
                <div style={{ fontSize: "2rem" }}>{item.icon}</div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <span style={{
                    width: "1.75rem", height: "1.75rem", borderRadius: "50%",
                    backgroundColor: "#0d2818", border: "1px solid #166534",
                    color: "#22c55e", fontWeight: 800, fontSize: "0.8rem",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>{item.step}</span>
                  <h3 style={{ margin: 0, fontSize: "1.125rem", fontWeight: 700 }}>{item.title}</h3>
                </div>
                <p style={{ color: "#64748b", lineHeight: 1.6, margin: 0, fontSize: "0.925rem" }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{ padding: "6rem 2rem" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <p style={{ textAlign: "center", color: "#22c55e", fontWeight: 700, fontSize: "0.85rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "1rem" }}>Pricing</p>
          <h2 style={{ textAlign: "center", fontSize: "clamp(1.75rem, 4vw, 2.75rem)", fontWeight: 800, marginBottom: "0.75rem", letterSpacing: "-0.02em" }}>
            Simple, transparent pricing
          </h2>
          <p style={{ textAlign: "center", color: "#64748b", marginBottom: "3.5rem" }}>Start free. Upgrade when you land your first client.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem", alignItems: "start" }}>

            {/* Free */}
            <div style={{ backgroundColor: "#0a1120", border: "1px solid #1e293b", borderRadius: "1.25rem", padding: "2.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div>
                <h3 style={{ margin: "0 0 0.25rem", fontSize: "1.125rem", fontWeight: 700 }}>Free</h3>
                <p style={{ margin: 0, color: "#64748b", fontSize: "0.85rem" }}>Try it out, no card needed</p>
              </div>
              <div style={{ fontSize: "3rem", fontWeight: 900, letterSpacing: "-0.03em" }}>$0<span style={{ fontSize: "1rem", fontWeight: 400, color: "#64748b" }}>/mo</span></div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {["5 leads/month", "Dashboard access", "Email only"].map(f => (
                  <li key={f} style={{ display: "flex", alignItems: "center", gap: "0.75rem", color: "#94a3b8", fontSize: "0.9rem" }}>
                    <span style={{ color: "#22c55e", fontWeight: 700 }}>✓</span>{f}
                  </li>
                ))}
              </ul>
              <Link href="/signup" style={{ display: "block", textAlign: "center", border: "1px solid #334155", color: "#cbd5e1", padding: "0.75rem", borderRadius: "0.625rem", fontWeight: 600, textDecoration: "none", fontSize: "0.9rem" }}>Get Started Free</Link>
            </div>

            {/* Starter — highlighted */}
            <div style={{ backgroundColor: "#0d2818", border: "2px solid #22c55e", borderRadius: "1.25rem", padding: "2.5rem", display: "flex", flexDirection: "column", gap: "1.25rem", position: "relative" }}>
              <span style={{ position: "absolute", top: "-0.8rem", left: "50%", transform: "translateX(-50%)", backgroundColor: "#22c55e", color: "#0f172a", fontWeight: 700, fontSize: "0.7rem", padding: "0.25rem 0.875rem", borderRadius: "9999px", whiteSpace: "nowrap", letterSpacing: "0.05em" }}>MOST POPULAR</span>
              <div>
                <h3 style={{ margin: "0 0 0.25rem", fontSize: "1.125rem", fontWeight: 700 }}>Starter</h3>
                <p style={{ margin: 0, color: "#4ade80", fontSize: "0.85rem" }}>For active freelancers</p>
              </div>
              <div style={{ fontSize: "3rem", fontWeight: 900, letterSpacing: "-0.03em" }}>$19<span style={{ fontSize: "1rem", fontWeight: 400, color: "#4ade80" }}>/mo</span></div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {["50 leads/month", "AI drafted messages", "Email notifications", "Priority leads feed"].map(f => (
                  <li key={f} style={{ display: "flex", alignItems: "center", gap: "0.75rem", color: "#bbf7d0", fontSize: "0.9rem" }}>
                    <span style={{ color: "#22c55e", fontWeight: 700 }}>✓</span>{f}
                  </li>
                ))}
              </ul>
              <Link href="/signup" style={{ display: "block", textAlign: "center", backgroundColor: "#22c55e", color: "#0f172a", padding: "0.875rem", borderRadius: "0.625rem", fontWeight: 700, textDecoration: "none", fontSize: "0.95rem" }}>Start Free Trial</Link>
            </div>

            {/* Pro */}
            <div style={{ backgroundColor: "#0a1120", border: "1px solid #1e293b", borderRadius: "1.25rem", padding: "2.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div>
                <h3 style={{ margin: "0 0 0.25rem", fontSize: "1.125rem", fontWeight: 700 }}>Pro</h3>
                <p style={{ margin: 0, color: "#64748b", fontSize: "0.85rem" }}>Scale your freelance business</p>
              </div>
              <div style={{ fontSize: "3rem", fontWeight: 900, letterSpacing: "-0.03em" }}>$49<span style={{ fontSize: "1rem", fontWeight: 400, color: "#64748b" }}>/mo</span></div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {["Unlimited leads", "AI drafted messages", "SMS + email alerts", "Priority monitoring", "Custom subreddits"].map(f => (
                  <li key={f} style={{ display: "flex", alignItems: "center", gap: "0.75rem", color: "#94a3b8", fontSize: "0.9rem" }}>
                    <span style={{ color: "#22c55e", fontWeight: 700 }}>✓</span>{f}
                  </li>
                ))}
              </ul>
              <Link href="/signup" style={{ display: "block", textAlign: "center", border: "1px solid #22c55e", color: "#22c55e", padding: "0.75rem", borderRadius: "0.625rem", fontWeight: 600, textDecoration: "none", fontSize: "0.9rem" }}>Go Pro</Link>
            </div>

          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: "6rem 2rem", backgroundColor: "#0a1120" }}>
        <div style={{ maxWidth: "720px", margin: "0 auto" }}>
          <h2 style={{ textAlign: "center", fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 800, marginBottom: "3rem", letterSpacing: "-0.02em" }}>Frequently Asked Questions</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {[
              { q: "How does FreelanceAlert find leads?", a: "We use keyword and semantic search across hundreds of subreddits to surface posts where people are actively looking to hire. Our system runs continuously so you never miss a time-sensitive opportunity." },
              { q: "Which subreddits do you monitor?", a: "We monitor r/forhire, r/hiring, r/freelance, plus niche subreddits for your service category. Paid plans let you add custom subreddits to your watchlist." },
              { q: "How does the AI write messages?", a: "When a high-scoring lead is found, AI analyzes the post and crafts a personalized outreach message addressing the poster's specific needs. You review and edit before sending." },
              { q: "Can I cancel anytime?", a: "Yes. No long-term contracts. Cancel from your account settings at any time — you keep access until the end of your billing period." },
              { q: "Is my Reddit account safe?", a: "FreelanceAlert uses Reddit's official OAuth API. We never store your password. Sending DMs requires your explicit one-tap approval each time — nothing is sent automatically." },
            ].map((item, i) => (
              <details key={i} style={{ backgroundColor: "#0f172a", borderRadius: "0.875rem", padding: "1.5rem", border: "1px solid #1e293b" }}>
                <summary style={{ fontWeight: 600, fontSize: "1rem", cursor: "pointer", listStyle: "none", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
                  {item.q}
                  <span style={{ color: "#22c55e", fontSize: "1.25rem", lineHeight: 1, flexShrink: 0 }}>+</span>
                </summary>
                <p style={{ color: "#64748b", lineHeight: 1.7, marginTop: "1rem", marginBottom: 0, fontSize: "0.925rem" }}>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section style={{ padding: "5rem 2rem", textAlign: "center" }}>
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)", fontWeight: 900, marginBottom: "1rem", letterSpacing: "-0.02em" }}>
            Start finding clients today
          </h2>
          <p style={{ color: "#64748b", marginBottom: "2rem", lineHeight: 1.7 }}>
            Join freelancers who never miss a hot lead. Free plan available, no credit card required.
          </p>
          <Link href="/signup" style={{
            display: "inline-block", backgroundColor: "#22c55e", color: "#0f172a",
            padding: "1rem 2.5rem", borderRadius: "0.625rem",
            fontWeight: 700, fontSize: "1.05rem", textDecoration: "none",
          }}>Create Free Account</Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid #1e293b", padding: "2rem", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: "2rem", flexWrap: "wrap", marginBottom: "1.25rem" }}>
          {[{ label: "Pricing", href: "#pricing" }, { label: "Login", href: "/login" }, { label: "Sign Up", href: "/signup" }].map(link => (
            <Link key={link.href} href={link.href} style={{ color: "#475569", textDecoration: "none", fontSize: "0.875rem" }}>{link.label}</Link>
          ))}
        </div>
        <p style={{ color: "#334155", fontSize: "0.8rem", margin: 0 }}>
          &copy; 2026 FreelanceAlert. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
