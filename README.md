# Telegram Group Access (₦2,000 via Paystack)

A Next.js website where users pay **₦2,000** via **Paystack** and only receive your private Telegram group link after server-side payment verification.

## Deploy to Vercel (Recommended)
1. Go to [Vercel](https://vercel.com/new) and import the `victoriv2/m-kuad` repository.
2. Add these **Environment Variables** in Vercel:
   - `PAYSTACK_SECRET_KEY` — Your Paystack Secret Key (`sk_live_...`)
   - `TELEGRAM_GROUP_URL` — Your private Telegram invite link (e.g., `https://t.me/+your_invite_link`)
   - `NEXT_PUBLIC_APP_URL` — Your Vercel URL (e.g., `https://m-kuad.vercel.app`)
3. Click **Deploy**.

> Neither your Paystack Secret Key nor your Telegram link is exposed in the public GitHub repository or browser code.
