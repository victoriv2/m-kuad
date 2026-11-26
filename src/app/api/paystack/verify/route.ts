import { NextRequest, NextResponse } from "next/server";

const REQUIRED_AMOUNT_KOBO = 200000; // ₦2,000.00

export async function GET(req: NextRequest) {
  const reference = req.nextUrl.searchParams.get("reference")?.trim();

  if (!reference) {
    return NextResponse.json(
      { error: "Missing payment reference." },
      { status: 400 }
    );
  }

  const secretKey = process.env.PAYSTACK_SECRET_KEY?.trim();
  const telegramGroupUrl = process.env.TELEGRAM_GROUP_URL?.trim();

  if (!secretKey || !telegramGroupUrl) {
    return NextResponse.json(
      { error: "Server configuration is incomplete." },
      { status: 500 }
    );
  }

  try {
    const paystackRes = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: {
          Authorization: `Bearer ${secretKey}`,
        },
        cache: "no-store",
      }
    );

    const paystackData = await paystackRes.json();

    if (!paystackRes.ok || !paystackData.status || !paystackData.data) {
      return NextResponse.json(
        { error: paystackData.message || "Could not verify payment." },
        { status: 400 }
      );
    }

    const tx = paystackData.data;
    if (
      tx.status !== "success" ||
      Number(tx.amount) < REQUIRED_AMOUNT_KOBO ||
      tx.currency !== "NGN"
    ) {
      return NextResponse.json(
        { error: "Payment was not completed or amount is invalid." },
        { status: 402 }
      );
    }

    return NextResponse.json({
      inviteLink: telegramGroupUrl,
      email: tx.customer?.email || null,
    });
  } catch {
    return NextResponse.json(
      { error: "An unexpected error occurred during verification." },
      { status: 500 }
    );
  }
}
