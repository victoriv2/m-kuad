"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function VerifyContent() {
  const searchParams = useSearchParams();
  const reference =
    searchParams.get("reference") || searchParams.get("trxref");

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [inviteLink, setInviteLink] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!reference) {
      setStatus("error");
      setError("No payment reference found in URL.");
      return;
    }

    let cancelled = false;

    async function verifyPayment() {
      try {
        const res = await fetch(
          `/api/paystack/verify?reference=${encodeURIComponent(reference!)}`
        );
        const data = await res.json();

        if (cancelled) return;

        if (!res.ok || !data.inviteLink) {
          setStatus("error");
          setError(data.error || "Payment verification failed.");
          return;
        }

        setInviteLink(data.inviteLink);
        setStatus("success");
      } catch {
        if (cancelled) return;
        setStatus("error");
        setError("Network error while verifying payment.");
      }
    }

    verifyPayment();

    return () => {
      cancelled = true;
    };
  }, [reference]);

  async function handleCopy() {
    if (!inviteLink) return;
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback ignored if clipboard permission is unavailable
    }
  }

  return (
    <main className="container">
      <section className="card">
        {status === "loading" && (
          <>
            <span className="badge">Verifying Payment</span>
            <h1>Confirming your ₦100 payment...</h1>
            <p className="subtitle">
              Please wait a moment while we verify your transaction and unlock
              your Telegram group link.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <span className="badge">Payment Confirmed</span>
            <h1>You&apos;re In!</h1>
            <div className="success-box">
              <div className="success-title">Payment Verified</div>
              <p className="subtitle" style={{ marginBottom: 0 }}>
                Click below to join the private Telegram group.
              </p>
            </div>

            <a
              className="btn"
              href={inviteLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              Join Telegram Group Now
            </a>

            <button
              className="btn btn-secondary"
              type="button"
              onClick={handleCopy}
            >
              {copied ? "Copied!" : "Copy Group Link"}
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <span className="badge">Verification Issue</span>
            <h1>Could Not Verify Payment</h1>
            <div className="error" style={{ marginBottom: "1.25rem" }}>
              {error}
            </div>
            <Link className="btn" href="/">
              Back to Home
            </Link>
          </>
        )}
      </section>
    </main>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <main className="container">
          <section className="card">
            <h1>Loading...</h1>
          </section>
        </main>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
