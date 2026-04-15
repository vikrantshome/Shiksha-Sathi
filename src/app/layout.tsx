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
  metadataBase: new URL("https://shiksha-sathi-taupe.vercel.app"),
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
  openGraph: {
    title: "Shiksha Sathi — Create, Share & Auto-Grade Assignments",
    description:
      "A teacher-first platform for building NCERT-aligned assignments, sharing them instantly, and reviewing student performance with clarity.",
    type: "website",
    url: "https://shiksha-sathi-taupe.vercel.app",
    siteName: "Shiksha Sathi",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Shiksha Sathi teacher platform preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Shiksha Sathi — Create, Share & Auto-Grade Assignments",
    description:
      "Build NCERT-aligned homework, share student links, and review results in one teacher-first workspace.",
    images: ["/twitter-image"],
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
      className="h-full antialiased font-sans"
    >
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
