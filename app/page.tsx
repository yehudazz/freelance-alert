import Link from "next/link";

export default function Home() {
  return (
    <main style={{ backgroundColor: "#0f172a", color: "#ffffff", fontFamily: "system-ui, sans-serif" }}>
      {/* HERO */}
      <section
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "4rem 1.5rem",
        }}
      >
        <h1
          style={{
            fontSize: "clamp(2.25rem, 6vw, 4rem)",
            fontWeight: 800,
            lineHeight: 1.15,
            maxWidth: "900px",
            marginBottom: "1.5rem",
          }}
        >
          Never Miss a Client Opportunity Again
        </h1>
        <p
          style={{
            fontSize: "clamp(1rem, 2.5vw, 1.375rem)",
            color: "#94a3b8",
            maxWidth: "700px",
            lineHeight: 1.7,
            marginBottom: "2.5rem",
          }}
        >
          FreelanceAlert monitors Reddit 24/7. When someone needs your service we find them, score the lead, write your
          pitch, and send it with one tap.
        </p>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
          <Link
            href="/signup"
            style={{
              backgroundColor: "#22c55e",
              color: "#0f172a",
              padding: "0.875rem 2rem",
              borderRadius: "0.5rem",
              fontWeight: 700,
              fontSize: "1rem",
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            Start Free
          </Link>
          <Link
            href="#how-it-works"
            style={{
              border: "2px solid #ffffff",
              color: "#ffffff",
              padding: "0.875rem 2rem",
              borderRadius: "0.5rem",
              fontWeight: 700,
              fontSize: "1rem",
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            See How It Works
          </Link>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        id="how-it-works"
        style={{
          padding: "5rem 1.5rem",
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
            fontWeight: 800,
            marginBottom: "3rem",
          }}
        >
          How It Works
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "2rem",
          }}
        >
          {[
            {
              step: "1",
              title: "Monitor",
              desc: "We watch Reddit 24/7 across the subreddits where your clients hang out.",
            },
            {
              step: "2",
              title: "Score",
              desc: "AI scores each post 1-10 on hiring intent, budget, and urgency.",
            },
            {
              step: "3",
              title: "Draft",
              desc: "Claude writes a personalized outreach message for every high-scoring lead.",
            },
            {
              step: "4",
              title: "Send",
              desc: "You review in one tap and send the Reddit DM.",
            },
          ].map((item) => (
            <div
              key={item.step}
              style={{
                backgroundColor: "#1e293b",
                borderRadius: "1rem",
                padding: "2rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              <div
                style={{
                  width: "2.5rem",
                  height: "2.5rem",
                  borderRadius: "50%",
                  backgroundColor: "#22c55e",
                  color: "#0f172a",
                  fontWeight: 800,
                  fontSize: "1.125rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {item.step}
              </div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0 }}>{item.title}</h3>
              <p style={{ color: "#94a3b8", lineHeight: 1.6, margin: 0 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section
        style={{
          padding: "5rem 1.5rem",
          backgroundColor: "#0f172a",
        }}
      >
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <h2
            style={{
              textAlign: "center",
              fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
              fontWeight: 800,
              marginBottom: "3rem",
            }}
          >
            Simple Pricing
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "2rem",
              alignItems: "start",
            }}
          >
            {/* Free */}
            <div
              style={{
                backgroundColor: "#1e293b",
                borderRadius: "1rem",
                padding: "2rem",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              <h3 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0 }}>Free</h3>
              <p style={{ fontSize: "2.5rem", fontWeight: 800, margin: 0 }}>
                $0
                <span style={{ fontSize: "1rem", fontWeight: 400, color: "#94a3b8" }}>/mo</span>
              </p>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                {["5 leads/month", "Email only", "No AI drafting"].map((f) => (
                  <li
                    key={f}
                    style={{ color: "#94a3b8", display: "flex", alignItems: "center", gap: "0.5rem" }}
                  >
                    <span style={{ color: "#22c55e" }}>&#10003;</span> {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                style={{
                  backgroundColor: "#22c55e",
                  color: "#0f172a",
                  padding: "0.75rem 1.5rem",
                  borderRadius: "0.5rem",
                  fontWeight: 700,
                  fontSize: "1rem",
                  textDecoration: "none",
                  textAlign: "center",
                  display: "block",
                  marginTop: "0.5rem",
                }}
              >
                Get Started
              </Link>
            </div>

            {/* Starter */}
            <div
              style={{
                backgroundColor: "#1e293b",
                borderRadius: "1rem",
                padding: "2rem",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                border: "2px solid #22c55e",
                position: "relative",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  top: "-0.75rem",
                  left: "50%",
                  transform: "translateX(-50%)",
                  backgroundColor: "#22c55e",
                  color: "#0f172a",
                  fontWeight: 700,
                  fontSize: "0.75rem",
                  padding: "0.25rem 0.875rem",
                  borderRadius: "9999px",
                  whiteSpace: "nowrap",
                }}
              >
                MOST POPULAR
              </span>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0 }}>Starter</h3>
              <p style={{ fontSize: "2.5rem", fontWeight: 800, margin: 0 }}>
                $19
                <span style={{ fontSize: "1rem", fontWeight: 400, color: "#94a3b8" }}>/mo</span>
              </p>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                {["50 leads/month", "AI drafting", "Email notifications"].map((f) => (
                  <li
                    key={f}
                    style={{ color: "#94a3b8", display: "flex", alignItems: "center", gap: "0.5rem" }}
                  >
                    <span style={{ color: "#22c55e" }}>&#10003;</span> {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                style={{
                  backgroundColor: "#22c55e",
                  color: "#0f172a",
                  padding: "0.75rem 1.5rem",
                  borderRadius: "0.5rem",
                  fontWeight: 700,
                  fontSize: "1rem",
                  textDecoration: "none",
                  textAlign: "center",
                  display: "block",
                  marginTop: "0.5rem",
                }}
              >
                Start Free Trial
              </Link>
            </div>

            {/* Pro */}
            <div
              style={{
                backgroundColor: "#1e293b",
                borderRadius: "1rem",
                padding: "2rem",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              <h3 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0 }}>Pro</h3>
              <p style={{ fontSize: "2.5rem", fontWeight: 800, margin: 0 }}>
                $49
                <span style={{ fontSize: "1rem", fontWeight: 400, color: "#94a3b8" }}>/mo</span>
              </p>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                {["Unlimited leads", "AI drafting", "SMS + email", "Priority monitoring"].map((f) => (
                  <li
                    key={f}
                    style={{ color: "#94a3b8", display: "flex", alignItems: "center", gap: "0.5rem" }}
                  >
                    <span style={{ color: "#22c55e" }}>&#10003;</span> {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                style={{
                  border: "2px solid #22c55e",
                  color: "#22c55e",
                  padding: "0.75rem 1.5rem",
                  borderRadius: "0.5rem",
                  fontWeight: 700,
                  fontSize: "1rem",
                  textDecoration: "none",
                  textAlign: "center",
                  display: "block",
                  marginTop: "0.5rem",
                  backgroundColor: "transparent",
                }}
              >
                Go Pro
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section
        style={{
          padding: "5rem 1.5rem",
          maxWidth: "800px",
          margin: "0 auto",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
            fontWeight: 800,
            marginBottom: "3rem",
          }}
        >
          Frequently Asked Questions
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {[
            {
              q: "How does FreelanceAlert find leads?",
              a: "FreelanceAlert uses keyword and semantic search across hundreds of subreddits to surface posts where people are actively looking to hire freelancers with your skills. Our system runs continuously so you never miss a time-sensitive opportunity.",
            },
            {
              q: "Which subreddits do you monitor?",
              a: "We monitor general hiring subreddits like r/forhire, r/hiring, and r/freelance, plus niche subreddits relevant to your service category. You can also add custom subreddits to your watchlist on any paid plan.",
            },
            {
              q: "How does the AI write messages?",
              a: "When a high-scoring lead is detected, Claude analyzes the original Reddit post and crafts a personalized outreach message that addresses the poster's specific needs. You can review and edit the draft before sending.",
            },
            {
              q: "Can I cancel anytime?",
              a: "Yes. There are no long-term contracts. You can cancel your subscription at any time from your account settings and you will not be charged again. You retain access until the end of your current billing period.",
            },
            {
              q: "Is my Reddit account safe?",
              a: "FreelanceAlert only uses Reddit's official OAuth API. We never store your Reddit password. Sending DMs requires your explicit one-tap approval each time — we never send messages automatically without your review.",
            },
          ].map((item, i) => (
            <details
              key={i}
              style={{
                backgroundColor: "#1e293b",
                borderRadius: "0.75rem",
                padding: "1.5rem",
              }}
            >
              <summary
                style={{
                  fontWeight: 700,
                  fontSize: "1.0625rem",
                  cursor: "pointer",
                  listStyle: "none",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "1rem",
                }}
              >
                {item.q}
                <span style={{ color: "#22c55e", fontSize: "1.5rem", lineHeight: 1, flexShrink: 0 }}>+</span>
              </summary>
              <p style={{ color: "#94a3b8", lineHeight: 1.7, marginTop: "1rem", marginBottom: 0 }}>{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer
        style={{
          borderTop: "1px solid #1e293b",
          padding: "2.5rem 1.5rem",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "2rem",
            flexWrap: "wrap",
            marginBottom: "1.5rem",
          }}
        >
          {[
            { label: "Pricing", href: "/pricing" },
            { label: "Login", href: "/login" },
            { label: "Sign Up", href: "/signup" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{ color: "#94a3b8", textDecoration: "none", fontSize: "0.9375rem" }}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <p style={{ color: "#475569", fontSize: "0.875rem", margin: 0 }}>
          &copy; {new Date().getFullYear()} FreelanceAlert. All rights reserved.
        </p>
      </footer>
    </main>
  );
}
