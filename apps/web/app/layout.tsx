import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "../components/layout/header";
import { Footer } from "../components/layout/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Memoshare",
  description: "Bevare dine familiehistorier.",
};

import { ChatProvider } from "../components/chat/chat-context";
import { ChatDock } from "../components/chat/chat-dock";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="no" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <ChatProvider>
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
          <ChatDock />
        </ChatProvider>
      </body>
    </html>
  );
}
