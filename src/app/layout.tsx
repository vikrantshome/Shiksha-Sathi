import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Manrope } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Shiksha Sathi — Create, Share & Auto-Grade Assignments",
    template: "%s | Shiksha Sathi",
  },
  description:
    "Shiksha Sathi is a teacher-first platform for creating NCERT-aligned homework assignments, sharing them with students, and auto-grading submissions instantly. Built for Indian schools.",
  keywords: [
    "Shiksha Sathi",
    "homework",
    "assignments",
    "NCERT",
    "CBSE",
    "teacher",
    "auto-grade",
    "question bank",
    "Indian schools",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
