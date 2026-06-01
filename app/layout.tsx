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
  title: "2026年沢村賞レース | SAP（Sawamura Award Point）",
  description:
    "独自指標SAP（Sawamura Award Point）で2026年沢村賞レースを予測。試合開催日に毎日自動更新。",
  verification: {
    google: "qhV_a68l9z7Q702N8uljJRTPHs3Rgux_3wIxDv7CXvo",
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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
