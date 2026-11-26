"use client";

import { useState, useEffect, FormEvent } from "react";

export default function HomePage() {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowModal(true), 2500);
    return () => clearTimeout(timer);
  }, []);
  const [telegramUsername, setTelegramUsername] = useState("");
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
        body: JSON.stringify({ telegramUsername }),
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
    <>
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <img src="/popup.jpg" alt="Leaks and Kicks" className="modal-image" />
            <div className="modal-close-row">
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
          </div>
        </div>
      )}
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
              <label htmlFor="telegram-username">
                Telegram Username (optional)
              </label>
              <input
                id="telegram-username"
                type="text"
                placeholder="e.g. @username"
                value={telegramUsername}
                onChange={(e) => setTelegramUsername(e.target.value)}
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
    </>
  );
}
