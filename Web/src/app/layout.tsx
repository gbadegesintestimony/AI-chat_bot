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
  title: "GOBD AI Fault-Code Assistant",
  description: "Ask about vehicle fault codes and get a plain-language explanation.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      {/* h-full (not min-h-full) + overflow-hidden caps the page at the viewport height so
          only designated inner panels (the message list, the sidebar) scroll — without this,
          a long AI reply grows the whole page instead of just its own scroll container. */}
      <body className="h-full flex flex-col overflow-hidden">{children}</body>
    </html>
  );
}
