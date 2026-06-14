import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Base Pulse",
    template: "%s | Base Pulse",
  },
  description:
    "Track live Base gas and trending contract activity from a mobile-first Farcaster Mini App.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  openGraph: {
    title: "Base Pulse",
    description: "Live Base gas and trending contract activity.",
    url: "/",
    siteName: "Base Pulse",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Base Pulse",
    description: "Live Base gas and trending contract activity.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#050816] text-zinc-100">
        {children}
      </body>
    </html>
  );
}
