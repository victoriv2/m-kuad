import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Join Our Private Telegram Group — ₦100",
  description:
    "Pay ₦100 securely via Paystack to get instant access to our private Telegram group.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
