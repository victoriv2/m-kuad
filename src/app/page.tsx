"use client";

import { useState, FormEvent } from "react";

export default function HomePage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });

      const data = await res.json();

      if (!res.ok || !data.authorization_url) {
        setError(data.error || "Unable to start payment. Please try again.");
        setLoading(false);
        return;
      }

      window.location.href = data.authorization_url;
    } catch {
      setError("Network error. Please check your connection and try again.");
      setLoading(false);
    }
  }

  return (
    <main className="container">
      <section className="card">
        <span className="badge">Private Telegram Access</span>
        <h1>Join Our Exclusive Telegram Group</h1>
        <p className="subtitle">
          Get instant access to our private community. Your invite link is
          unlocked only after your payment is verified.
        </p>

        <div className="price-box">
          <span className="price">₦2,000</span>
          <span className="price-note">One-time access fee</span>
        </div>

        <ul className="benefits">
          <li>Instant access after payment verification</li>
          <li>Secured by Paystack (Card, Bank Transfer, USSD)</li>
          <li>Direct link to the private Telegram group</li>
        </ul>

        <form className="form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="name">Full Name (optional)</label>
            <input
              id="name"
              type="text"
              placeholder="e.g. Chinedu Okafor"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="email">Email Address *</label>
            <input
              id="email"
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {error && <div className="error">{error}</div>}

          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Redirecting to Paystack..." : "Pay ₦2,000 to Join"}
          </button>
        </form>

        <p className="footer-note">
          Payments are processed securely by Paystack.
        </p>
      </section>
    </main>
  );
}
