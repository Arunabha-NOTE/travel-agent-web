import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import { QueryProvider } from "@/providers/query-provider";
import "./globals.css";

const lexendSans = Lexend({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const lexendMono = Lexend({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "TravelAI — Your AI Travel Planning Assistant",
  description:
    "Plan personalized travel itineraries instantly with RAG-powered AI. Describe your trip and get a smart day-by-day plan in seconds.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dracula">
      <body
        className={`${lexendSans.variable} ${lexendMono.variable} antialiased`}
      >
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
