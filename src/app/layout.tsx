import type { Metadata } from "next";
import "@fontsource/geist-sans/400.css";
import "@fontsource/geist-sans/500.css";
import "@fontsource/geist-sans/600.css";
import "@fontsource/geist-sans/700.css";
import "@fontsource/geist-mono/400.css";
import "@fontsource/manrope/400.css";
import "@fontsource/manrope/500.css";
import "@fontsource/manrope/600.css";
import "@fontsource/manrope/700.css";
import "./globals.css";

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
      className="h-full antialiased font-sans"
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
