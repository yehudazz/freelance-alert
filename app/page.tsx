import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen" style={{ background: "#020817", color: "#e2e8f0", fontFamily: "system-ui,-apple-system,sans-serif" }}>

      {/* ─── GLOBAL STYLES ─────────────────────────────────── */}
      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes pulse-green { 0%,100%{opacity:1} 50%{opacity:.5} }
        @keyframes shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
        .float { animation: float 4s ease-in-out infinite; }
        .dot-pulse { animation: pulse-green 2s ease-in-out infinite; }
        .gradient-text {
          background: linear-gradient(135deg, #ffffff 0%, #22c55e 50%, #4ade80 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }
        .btn-primary {
          background: linear-gradient(135deg, #22c55e, #16a34a);
          color: #020817;
          font-weight: 700;
          padding: .75rem 1.75rem;
          border-radius: .625rem;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: .5rem;
          transition: all .2s;
          font-size: .95rem;
          box-shadow: 0 0 20px rgba(34,197,94,.25);
        }
        .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 0 30px rgba(34,197,94,.4); }
        .btn-ghost {
          border: 1px solid #1e3a5f;
          color: #94a3b8;
          font-weight: 600;
          padding: .75rem 1.75rem;
          border-radius: .625rem;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: .5rem;
          transition: all .2s;
          font-size: .95rem;
          background: rgba(255,255,255,.02);
        }
        .btn-ghost:hover { border-color: #22c55e; color: #4ade80; background: rgba(34,197,94,.05); }
        .card {
          background: rgba(15,22,41,.8);
          border: 1px solid #1e3a5f;
          border-radius: 1rem;
          padding: 1.75rem;
          transition: border-color .2s, transform .2s;
        }
        .card:hover { border-color: rgba(34,197,94,.27); transform: translateY(-2px); }
        .pricing-card {
          background: rgba(15,22,41,.8);
          border: 1px solid #1e3a5f;
          border-radius: 1.25rem;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          transition: all .25s;
        }
        .pricing-card:hover { transform: translateY(-4px); }
        .pricing-card.popular {
          border: 2px solid #22c55e;
          background: linear-gradient(180deg, rgba(34,197,94,.07) 0%, rgba(15,22,41,.8) 100%);
          box-shadow: 0 0 40px rgba(34,197,94,.15);
        }
        .feature-icon {
          width: 44px; height: 44px;
          background: linear-gradient(135deg, rgba(34,197,94,.15), rgba(34,197,94,.05));
          border: 1px solid rgba(34,197,94,.3);
          border-radius: .75rem;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.25rem;
          flex-shrink: 0;
        }
        .step-number {
          width: 36px; height: 36px;
          background: linear-gradient(135deg, #22c55e, #16a34a);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-weight: 800; font-size: .85rem; color: #020817;
          flex-shrink: 0;
        }
        details > summary { list-style: none; }
        details > summary::-webkit-details-marker { display: none; }
        .nav-link { color: #94a3b8; text-decoration: none; font-size: .9rem; transition: color .15s; }
        .nav-link:hover { color: #e2e8f0; }
        .check-item {
          display: flex; align-items: center; gap: .625rem;
          color: #94a3b8; font-size: .9rem;
        }
        .check-item .check { color: #22c55e; font-weight: 700; flex-shrink: 0; }
        .tag {
          display: inline-flex; align-items: center; gap: .375rem;
          background: rgba(34,197,94,.1);
          border: 1px solid rgba(34,197,94,.3);
          border-radius: 9999px;
          padding: .3rem .875rem;
          font-size: .78rem; font-weight: 600; color: #4ade80;
          letter-spacing: .04em; text-transform: uppercase;
        }
        .mock-card {
          background: rgba(15,22,41,.95);
          border: 1px solid #1e3a5f;
          border-radius: 1rem;
          padding: 1.25rem;
          max-width: 380px;
          box-shadow: 0 25px 60px rgba(0,0,0,.6), 0 0 40px rgba(34,197,94,.08);
        }
        .score-bar-fill { background: linear-gradient(90deg, #22c55e, #4ade80); border-radius: 9999px; height: 6px; }
        .testimonial-card {
          background: rgba(15,22,41,.6);
          border: 1px solid #1e3a5f;
          border-radius: 1rem;
          padding: 1.75rem;
        }
        .divider { border: none; border-top: 1px solid #1e3a5f; margin: 0; }
        .container { max-width: 1120px; margin: 0 auto; }
        .grid-3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; }
        .grid-4 { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.5rem; }
        @media (max-width: 768px) {
          .hide-mobile { display: none !important; }
          .grid-3, .grid-4 { grid-template-columns: 1fr; }
          h1 { font-size: 2.5rem !important; }
          .hero-ctas { flex-direction: column; align-items: stretch; }
          .hero-ctas a { text-align: center; justify-content: center; }
        }
      `}</style>

      {/* ─── NAV ────────────────────────────────────────────── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(2,8,23,.85)", backdropFilter: "blur(16px) saturate(180%)",
        borderBottom: "1px solid #1e3a5f",
        padding: "0 1.5rem", height: "60px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <Link href="/" style={{ fontWeight: 900, fontSize: "1.2rem", letterSpacing: "-.02em", textDecoration: "none", color: "inherit" }}>
          Freelance<span style={{ color: "#22c55e" }}>Alert</span>
        </Link>
        <div className="hide-mobile" style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
          <a href="#features" className="nav-link">Features</a>
          <a href="#how-it-works" className="nav-link">How it works</a>
          <a href="#pricing" className="nav-link">Pricing</a>
          <a href="#faq" className="nav-link">FAQ</a>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: ".75rem" }}>
          <Link href="/login" className="nav-link hide-mobile" style={{ padding: ".4rem .875rem" }}>Log in</Link>
          <Link href="/signup" className="btn-primary" style={{ padding: ".45rem 1.25rem", fontSize: ".875rem" }}>
            Get started free →
          </Link>
        </div>
      </nav>

      {/* ─── HERO ───────────────────────────────────────────── */}
      <section style={{ padding: "5rem 1.5rem 4rem", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-200px", left: "50%", transform: "translateX(-50%)", width: "600px", height: "600px", background: "radial-gradient(circle, rgba(34,197,94,.08) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div className="container" style={{ position: "relative" }}>
          <div style={{ marginBottom: "1.5rem" }}>
            <span className="tag">
              <span className="dot-pulse" style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
              Now monitoring 200+ subreddits
            </span>
          </div>
          <h1 style={{ fontSize: "clamp(2.75rem, 8vw, 5rem)", fontWeight: 900, lineHeight: 1.05, letterSpacing: "-.04em", marginBottom: "1.5rem" }}>
            Land freelance clients<br />
            <span className="gradient-text">while you sleep</span>
          </h1>
          <p style={{ fontSize: "clamp(1.05rem, 2.5vw, 1.3rem)", color: "#64748b", maxWidth: "560px", margin: "0 auto 2.5rem", lineHeight: 1.7 }}>
            FreelanceAlert scans Reddit 24/7 for people who need your skills. AI scores every lead, writes your pitch, and delivers it in one tap — before your competition even wakes up.
          </p>
          <div className="hero-ctas" style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap", marginBottom: "4rem" }}>
            <Link href="/signup" className="btn-primary" style={{ fontSize: "1rem", padding: ".875rem 2rem" }}>
              Start finding clients free →
            </Link>
            <a href="#how-it-works" className="btn-ghost" style={{ fontSize: "1rem", padding: ".875rem 2rem" }}>
              See how it works
            </a>
          </div>

          {/* Mock UI */}
          <div style={{ display: "flex", gap: "1.25rem", justifyContent: "center", flexWrap: "wrap", marginBottom: "4rem" }}>
            <div className="mock-card float" style={{ textAlign: "left" }}>
              <div style={{ display: "flex", alignItems: "center", gap: ".5rem", marginBottom: "1rem" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e" }} />
                <span style={{ fontSize: ".75rem", color: "#22c55e", fontWeight: 600, letterSpacing: ".05em" }}>NEW LEAD DETECTED</span>
                <span style={{ marginLeft: "auto", fontSize: ".75rem", color: "#475569" }}>2m ago</span>
              </div>
              <div style={{ background: "#0a1628", border: "1px solid #1e3a5f", borderRadius: ".625rem", padding: "1rem", marginBottom: ".875rem" }}>
                <div style={{ fontSize: ".7rem", color: "#4ade80", marginBottom: ".4rem", fontWeight: 600 }}>r/forhire</div>
                <p style={{ margin: 0, fontSize: ".875rem", color: "#e2e8f0", lineHeight: 1.5 }}>
                  &ldquo;Need a React developer for my SaaS dashboard. Budget $2k, need ASAP. DM me.&rdquo;
                </p>
              </div>
              <div style={{ marginBottom: ".875rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: ".375rem" }}>
                  <span style={{ fontSize: ".75rem", color: "#64748b" }}>AI Score</span>
                  <span style={{ fontSize: ".75rem", fontWeight: 700, color: "#22c55e" }}>9.1 / 10 · HIGH INTENT</span>
                </div>
                <div style={{ background: "#1e3a5f", borderRadius: "9999px", height: 6 }}>
                  <div className="score-bar-fill" style={{ width: "91%" }} />
                </div>
              </div>
              <div style={{ display: "flex", gap: ".625rem" }}>
                <button style={{ flex: 1, padding: ".5rem", background: "rgba(34,197,94,.1)", border: "1px solid rgba(34,197,94,.3)", borderRadius: ".5rem", color: "#4ade80", fontSize: ".8rem", fontWeight: 600, cursor: "pointer" }}>View post</button>
                <button style={{ flex: 1.5, padding: ".5rem", background: "linear-gradient(135deg,#22c55e,#16a34a)", border: "none", borderRadius: ".5rem", color: "#020817", fontSize: ".8rem", fontWeight: 700, cursor: "pointer" }}>Send drafted pitch →</button>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: ".875rem", justifyContent: "center" }}>
              {[
                { label: "Leads found today", value: "47", sub: "across 12 subreddits" },
                { label: "Avg response rate", value: "34%", sub: "vs 8% cold outreach" },
                { label: "Time to respond", value: "4 min", sub: "vs hours manually" },
              ].map(s => (
                <div key={s.label} style={{ background: "rgba(15,22,41,.8)", border: "1px solid #1e3a5f", borderRadius: ".875rem", padding: ".875rem 1.25rem", textAlign: "left", minWidth: "200px" }}>
                  <div style={{ fontSize: ".75rem", color: "#475569", marginBottom: ".25rem" }}>{s.label}</div>
                  <div style={{ fontSize: "1.75rem", fontWeight: 900, color: "#e2e8f0", lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: ".7rem", color: "#22c55e", marginTop: ".25rem" }}>{s.sub}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ borderTop: "1px solid #1e3a5f", paddingTop: "2rem" }}>
            <p style={{ fontSize: ".8rem", color: "#334155", marginBottom: "1.25rem", letterSpacing: ".06em", textTransform: "uppercase" }}>Used by freelancers specializing in</p>
            <div style={{ display: "flex", gap: "2rem", justifyContent: "center", flexWrap: "wrap" }}>
              {["Web Development", "Copywriting", "UI/UX Design", "Video Editing", "SEO", "Data Science"].map(s => (
                <span key={s} style={{ fontSize: ".85rem", color: "#475569", fontWeight: 500 }}>{s}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURES ───────────────────────────────────────── */}
      <section id="features" style={{ padding: "5rem 1.5rem", background: "rgba(10,18,38,.5)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <span className="tag" style={{ marginBottom: "1.25rem" }}>Features</span>
            <h2 style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)", fontWeight: 800, letterSpacing: "-.03em", margin: ".75rem 0 .875rem" }}>
              Everything you need to win clients on Reddit
            </h2>
            <p style={{ color: "#475569", maxWidth: "500px", margin: "0 auto", lineHeight: 1.7 }}>
              Built specifically for freelancers who know their next client is out there — they just haven&apos;t been found yet.
            </p>
          </div>
          <div className="grid-3">
            {[
              { icon: "🔍", title: "24/7 Reddit Monitoring", desc: "We never sleep. Every subreddit in your stack is watched continuously — the moment someone posts about needing help, we catch it." },
              { icon: "⚡", title: "AI Lead Scoring", desc: "Not all posts are equal. Our AI scores each lead 1–10 for hiring intent, budget signals, and urgency so you focus only on the best." },
              { icon: "✍️", title: "Drafted Outreach", desc: "Every high-scoring lead comes with a personalized pitch written by AI. Edit it if you want, or fire it off in one tap." },
              { icon: "🔔", title: "Instant Notifications", desc: "Get notified the moment a 7+ lead appears via email. Hot opportunities don&apos;t wait — neither should you." },
              { icon: "🎯", title: "Custom Keywords", desc: "Tell us your skills and specialties. We build a custom watchlist so every lead is actually relevant to what you do." },
              { icon: "📊", title: "Lead Dashboard", desc: "A clean feed of every lead, sorted by score and recency. Filter, review, and respond — all in one place." },
            ].map(f => (
              <div key={f.title} className="card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div className="feature-icon">{f.icon}</div>
                <div>
                  <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: ".375rem", color: "#e2e8f0" }}>{f.title}</h3>
                  <p style={{ fontSize: ".9rem", color: "#475569", lineHeight: 1.65, margin: 0 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ───────────────────────────────────── */}
      <section id="how-it-works" style={{ padding: "5rem 1.5rem" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <span className="tag" style={{ marginBottom: "1.25rem" }}>How it works</span>
            <h2 style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)", fontWeight: 800, letterSpacing: "-.03em", margin: ".75rem 0 .875rem" }}>
              From Reddit post to sent pitch in minutes
            </h2>
            <p style={{ color: "#475569", maxWidth: "480px", margin: "0 auto", lineHeight: 1.7 }}>
              Four steps run in the background while you&apos;re busy doing actual work.
            </p>
          </div>
          <div className="grid-4">
            {[
              { n: "1", icon: "🎯", title: "Set your keywords", desc: "Add your skills, tools, and specialties. We turn them into a 24/7 watchlist across hundreds of subreddits." },
              { n: "2", icon: "🔍", title: "We scan Reddit", desc: "Our engine reads every new post in real time — faster than any human, across the subreddits your clients actually use." },
              { n: "3", icon: "⚡", title: "AI scores & drafts", desc: "Each post gets a score. Anything above 6 triggers an AI-written outreach message tailored to that specific post." },
              { n: "4", icon: "🚀", title: "You hit send", desc: "Review the lead and drafted message. Tap send. The entire workflow takes under 30 seconds." },
            ].map(s => (
              <div key={s.n} style={{ display: "flex", flexDirection: "column", gap: "1rem", padding: "1.75rem", background: "rgba(15,22,41,.4)", border: "1px solid #1e3a5f", borderRadius: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: ".875rem" }}>
                  <div className="step-number">{s.n}</div>
                  <span style={{ fontSize: "1.5rem" }}>{s.icon}</span>
                </div>
                <div>
                  <h3 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: ".375rem", color: "#e2e8f0" }}>{s.title}</h3>
                  <p style={{ fontSize: ".9rem", color: "#475569", lineHeight: 1.65, margin: 0 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ────────────────────────────────────────── */}
      <section id="pricing" style={{ padding: "5rem 1.5rem", background: "rgba(10,18,38,.5)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <span className="tag" style={{ marginBottom: "1.25rem" }}>Pricing</span>
            <h2 style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)", fontWeight: 800, letterSpacing: "-.03em", margin: ".75rem 0 .875rem" }}>
              One client pays for a year
            </h2>
            <p style={{ color: "#475569", maxWidth: "440px", margin: "0 auto", lineHeight: 1.7 }}>
              Start free. Upgrade only when you&apos;re landing more work than you can handle.
            </p>
          </div>
          <div className="grid-3" style={{ alignItems: "start" }}>

            {/* Free */}
            <div className="pricing-card">
              <div>
                <div style={{ fontSize: ".8rem", fontWeight: 600, color: "#475569", letterSpacing: ".05em", textTransform: "uppercase", marginBottom: ".5rem" }}>Free</div>
                <div style={{ fontSize: "3rem", fontWeight: 900, letterSpacing: "-.04em", lineHeight: 1 }}>$0</div>
                <div style={{ fontSize: ".85rem", color: "#334155", marginTop: ".375rem" }}>No credit card needed</div>
              </div>
              <hr className="divider" />
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: ".75rem" }}>
                {["5 leads per month", "AI lead scoring", "Dashboard access", "Email notifications"].map(f => (
                  <li key={f} className="check-item"><span className="check">✓</span>{f}</li>
                ))}
                {["Drafted outreach messages", "Custom subreddits"].map(f => (
                  <li key={f} className="check-item" style={{ opacity: .35 }}><span style={{ color: "#334155" }}>✗</span>{f}</li>
                ))}
              </ul>
              <Link href="/signup" className="btn-ghost" style={{ textAlign: "center", justifyContent: "center" }}>
                Get started free
              </Link>
            </div>

            {/* Starter */}
            <div className="pricing-card popular" style={{ position: "relative" }}>
              <span style={{ position: "absolute", top: "-1px", left: "50%", transform: "translateX(-50%) translateY(-50%)", background: "linear-gradient(135deg,#22c55e,#16a34a)", color: "#020817", fontWeight: 800, fontSize: ".7rem", padding: ".3rem 1rem", borderRadius: "9999px", whiteSpace: "nowrap", letterSpacing: ".06em" }}>MOST POPULAR</span>
              <div>
                <div style={{ fontSize: ".8rem", fontWeight: 600, color: "#22c55e", letterSpacing: ".05em", textTransform: "uppercase", marginBottom: ".5rem" }}>Starter</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: ".375rem" }}>
                  <div style={{ fontSize: "3rem", fontWeight: 900, letterSpacing: "-.04em", lineHeight: 1, color: "#e2e8f0" }}>$19</div>
                  <div style={{ fontSize: ".9rem", color: "#4ade80" }}>/month</div>
                </div>
                <div style={{ fontSize: ".85rem", color: "#4ade80", marginTop: ".375rem" }}>Best for active freelancers</div>
              </div>
              <hr style={{ border: "none", borderTop: "1px solid rgba(34,197,94,.2)", margin: 0 }} />
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: ".75rem" }}>
                {["50 leads per month", "AI lead scoring", "Drafted outreach messages", "Email notifications", "Priority leads feed", "5 custom keywords"].map(f => (
                  <li key={f} className="check-item" style={{ color: "#bbf7d0" }}><span className="check">✓</span>{f}</li>
                ))}
              </ul>
              <Link href="/signup" className="btn-primary" style={{ textAlign: "center", justifyContent: "center" }}>
                Start free trial →
              </Link>
            </div>

            {/* Pro */}
            <div className="pricing-card">
              <div>
                <div style={{ fontSize: ".8rem", fontWeight: 600, color: "#475569", letterSpacing: ".05em", textTransform: "uppercase", marginBottom: ".5rem" }}>Pro</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: ".375rem" }}>
                  <div style={{ fontSize: "3rem", fontWeight: 900, letterSpacing: "-.04em", lineHeight: 1 }}>$49</div>
                  <div style={{ fontSize: ".9rem", color: "#475569" }}>/month</div>
                </div>
                <div style={{ fontSize: ".85rem", color: "#334155", marginTop: ".375rem" }}>Scale your freelance business</div>
              </div>
              <hr className="divider" />
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: ".75rem" }}>
                {["Unlimited leads", "AI lead scoring", "Drafted outreach messages", "Email + SMS notifications", "Unlimited custom keywords", "Custom subreddits", "Priority support"].map(f => (
                  <li key={f} className="check-item"><span className="check">✓</span>{f}</li>
                ))}
              </ul>
              <Link href="/signup" style={{ display: "block", textAlign: "center", border: "1px solid #22c55e", color: "#22c55e", padding: ".75rem", borderRadius: ".625rem", fontWeight: 700, textDecoration: "none", fontSize: ".9rem", transition: "all .2s" }}>
                Go Pro
              </Link>
            </div>

          </div>
          <p style={{ textAlign: "center", color: "#334155", fontSize: ".8rem", marginTop: "2rem" }}>
            All plans include a 14-day free trial. Cancel anytime. No contracts.
          </p>
        </div>
      </section>

      {/* ─── TESTIMONIALS ───────────────────────────────────── */}
      <section style={{ padding: "5rem 1.5rem" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <h2 style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 800, letterSpacing: "-.03em" }}>
              Freelancers who stopped missing leads
            </h2>
          </div>
          <div className="grid-3">
            {[
              { name: "Marcus T.", role: "React Developer", stars: 5, text: "I used to spend 2 hours every morning scanning Reddit for clients. FreelanceAlert replaced that entirely. I got my first lead response within the first day." },
              { name: "Priya S.", role: "UX Designer", stars: 5, text: "The drafted messages are scarily good. I barely edit them. Landed a $4,500 project from a lead I would have missed on my own. Worth every penny." },
              { name: "Jake R.", role: "Copywriter & SEO", stars: 5, text: "The lead scoring is what sold me. I only see posts where someone genuinely has a budget and is ready to hire. Zero time wasted." },
            ].map(t => (
              <div key={t.name} className="testimonial-card">
                <div style={{ display: "flex", gap: ".25rem", marginBottom: "1rem" }}>
                  {Array.from({ length: t.stars }).map((_, i) => <span key={i} style={{ color: "#f59e0b", fontSize: ".875rem" }}>★</span>)}
                </div>
                <p style={{ color: "#94a3b8", lineHeight: 1.7, marginBottom: "1.25rem", fontSize: ".925rem" }}>&ldquo;{t.text}&rdquo;</p>
                <div style={{ display: "flex", alignItems: "center", gap: ".75rem" }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#22c55e,#0ea5e9)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".875rem", fontWeight: 700, color: "#020817" }}>
                    {t.name[0]}
                  </div>
                  <div>
                    <div style={{ fontSize: ".875rem", fontWeight: 700, color: "#e2e8f0" }}>{t.name}</div>
                    <div style={{ fontSize: ".75rem", color: "#475569" }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ────────────────────────────────────────────── */}
      <section id="faq" style={{ padding: "5rem 1.5rem", background: "rgba(10,18,38,.5)" }}>
        <div className="container" style={{ maxWidth: "740px" }}>
          <h2 style={{ textAlign: "center", fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 800, letterSpacing: "-.03em", marginBottom: "3rem" }}>
            Common questions
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: ".75rem" }}>
            {[
              { q: "Does FreelanceAlert require Reddit login?", a: "No Reddit login is needed to receive leads and view AI drafts. You only connect your Reddit account when you want to send a DM directly from the app." },
              { q: "Which subreddits do you monitor?", a: "We monitor r/forhire, r/hiring, r/freelance, and 200+ niche subreddits based on your skill set. Pro users can add any custom subreddit to their watchlist." },
              { q: "How does the AI write the outreach messages?", a: "Our AI reads the original post and crafts a personalized pitch addressing the poster's exact problem, mentioning your relevant experience, and opening a real conversation — not a generic template." },
              { q: "What if I don't like a drafted message?", a: "Edit it however you want before sending — or delete it entirely. You have full control. The AI draft is a starting point, not a final word." },
              { q: "Can I cancel anytime?", a: "Yes. No long-term contracts, no cancellation fees. Cancel from your account settings and you'll keep access until the end of your billing period." },
              { q: "What if there are no leads for my skill set?", a: "If we don't find high-quality leads within your first 30 days, we'll refund your subscription — no questions asked." },
            ].map((item, i) => (
              <details key={i} style={{ background: "rgba(15,22,41,.6)", border: "1px solid #1e3a5f", borderRadius: ".875rem", overflow: "hidden" }}>
                <summary style={{ padding: "1.25rem 1.5rem", fontWeight: 600, fontSize: ".975rem", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", color: "#e2e8f0" }}>
                  {item.q}
                  <span style={{ color: "#22c55e", fontSize: "1.5rem", lineHeight: 1, flexShrink: 0, fontWeight: 300 }}>+</span>
                </summary>
                <p style={{ padding: "0 1.5rem 1.25rem", color: "#64748b", lineHeight: 1.7, margin: 0, fontSize: ".925rem" }}>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ──────────────────────────────────────── */}
      <section style={{ padding: "6rem 1.5rem" }}>
        <div className="container" style={{ textAlign: "center", maxWidth: "680px" }}>
          <div style={{ background: "linear-gradient(135deg, rgba(34,197,94,.08), rgba(14,165,233,.05))", border: "1px solid rgba(34,197,94,.2)", borderRadius: "1.5rem", padding: "3.5rem 2rem" }}>
            <h2 style={{ fontSize: "clamp(1.75rem, 4vw, 3rem)", fontWeight: 900, letterSpacing: "-.04em", marginBottom: "1rem" }}>
              Your next client is on Reddit<br />
              <span className="gradient-text">right now</span>
            </h2>
            <p style={{ color: "#475569", marginBottom: "2rem", lineHeight: 1.7, fontSize: "1.05rem" }}>
              Join freelancers who never miss a hot lead. Start free — no credit card required.
            </p>
            <Link href="/signup" className="btn-primary" style={{ fontSize: "1.05rem", padding: "1rem 2.5rem" }}>
              Create your free account →
            </Link>
            <p style={{ color: "#1e3a5f", fontSize: ".8rem", marginTop: "1.25rem" }}>
              Free plan · No credit card · Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─────────────────────────────────────────── */}
      <footer style={{ borderTop: "1px solid #0f1e38", padding: "2.5rem 1.5rem" }}>
        <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1.5rem" }}>
          <span style={{ fontWeight: 800, fontSize: "1.1rem", letterSpacing: "-.02em" }}>
            Freelance<span style={{ color: "#22c55e" }}>Alert</span>
          </span>
          <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
            {[["Features", "#features"], ["How it works", "#how-it-works"], ["Pricing", "#pricing"], ["FAQ", "#faq"], ["Log in", "/login"], ["Sign up", "/signup"]].map(([label, href]) => (
              <a key={label} href={href} style={{ color: "#334155", textDecoration: "none", fontSize: ".875rem" }}>{label}</a>
            ))}
          </div>
          <p style={{ color: "#1e3a5f", fontSize: ".8rem", margin: 0 }}>© 2026 FreelanceAlert</p>
        </div>
      </footer>
    </div>
  );
}
