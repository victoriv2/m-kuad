import { NextRequest, NextResponse } from "next/server";

const REQUIRED_AMOUNT_KOBO = 200000; // ₦2,000.00

interface MemberRecord {
  reference: string;
  telegramUsername: string;
  amountNaira: number;
  paidAt: string;
}

async function recordVerifiedMember(member: MemberRecord): Promise<void> {
  const masterKey = process.env.JSONBIN_MASTER_KEY?.trim();
  const binId = process.env.JSONBIN_BIN_ID?.trim();

  if (!masterKey || !binId) return;

  try {
    const getRes = await fetch(
      `https://api.jsonbin.io/v3/b/${encodeURIComponent(binId)}/latest`,
      {
        headers: { "X-Master-Key": masterKey },
        cache: "no-store",
      }
    );

    if (!getRes.ok) return;

    const getData = await getRes.json();
    const existing: MemberRecord[] = Array.isArray(getData?.record?.members)
      ? getData.record.members
      : [];

    if (existing.some((item) => item.reference === member.reference)) {
      return;
    }

    const updated = [member, ...existing];

    await fetch(`https://api.jsonbin.io/v3/b/${encodeURIComponent(binId)}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": masterKey,
      },
      body: JSON.stringify({ members: updated }),
    });
  } catch {
    // Do not block the user's invite link if logging fails
  }
}

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

    const rawUsername = tx.metadata?.telegram_username;
    const telegramUsername =
      typeof rawUsername === "string" && rawUsername.trim()
        ? rawUsername.trim()
        : "(not provided)";

    await recordVerifiedMember({
      reference: tx.reference || reference,
      telegramUsername,
      amountNaira: Number(tx.amount) / 100,
      paidAt: tx.paid_at || new Date().toISOString(),
    });

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
