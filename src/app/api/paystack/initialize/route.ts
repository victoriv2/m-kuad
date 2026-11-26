import { NextRequest, NextResponse } from "next/server";

const AMOUNT_KOBO = 10000; // ₦100.00 in kobo
const FALLBACK_EMAIL = "leaks.and.kicks@gmail.com";

function resolveAppUrl(req: NextRequest): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (configured) {
    return configured.replace(/\/+$/, "");
  }

  const forwardedHost = req.headers.get("x-forwarded-host");
  const host = forwardedHost || req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") || "https";

  if (host) {
    return `${proto}://${host}`.replace(/\/+$/, "");
  }

  return req.nextUrl.origin.replace(/\/+$/, "");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const telegramUsername =
      typeof body?.telegramUsername === "string"
        ? body.telegramUsername.trim()
        : "";

    const secretKey = process.env.PAYSTACK_SECRET_KEY?.trim();
    if (!secretKey) {
      return NextResponse.json(
        { error: "Payment service is not configured." },
        { status: 500 }
      );
    }

    const appUrl = resolveAppUrl(req);

    const response = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: FALLBACK_EMAIL,
          amount: AMOUNT_KOBO,
          currency: "NGN",
          callback_url: `${appUrl}/verify`,
          metadata: {
            telegram_username: telegramUsername,
            product: "Telegram Group Access",
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok || !data.status || !data.data?.authorization_url) {
      return NextResponse.json(
        { error: data.message || "Failed to initialize payment." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      authorization_url: data.data.authorization_url,
      reference: data.data.reference,
    });
  } catch {
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
