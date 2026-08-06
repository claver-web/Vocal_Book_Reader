import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs'
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#050b14",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "Vocal Reader — Next-Gen Audiobook & Speed PDF Reader",
  description: "Experience effortless speed reading with smart multi-column text extraction, interactive karaoke word highlighting from 100-500 WPM, and natural hands-free TTS narration.",
  keywords: ["PDF reader", "vocal reader", "karaoke reading", "speed reading", "TTS reader", "audiobook app", "dyslexia friendly reader", "ebook reader"],
  authors: [{ name: "Antigravity Team" }],
  creator: "Vocal Reader",
  publisher: "Vocal Reader App",
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "Vocal Reader — Transform Any PDF Into An Interactive Vocal Book",
    description: "Multi-column research paper parsing, word-by-word karaoke highlighting, custom TTS narrators, offline library history, and dyslexia-friendly typography.",
    siteName: "Vocal Reader",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vocal Reader — Next-Gen Audiobook & Speed PDF Reader",
    description: "Read faster and comprehend better with interactive visual word tracking and hands-free voice synthesis.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${inter.variable} font-sans h-full antialiased dark`}>
        <body className="min-h-full flex flex-col bg-[#050b14] text-slate-100 selection:bg-amber-500 selection:text-slate-950 overflow-x-hidden">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
