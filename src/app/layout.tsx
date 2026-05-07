import type { Viewport } from "next";
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

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
      suppressHydrationWarning
    >
      <head>
        <meta name="darkreader" content="false" />
        <meta name="color-scheme" content="light" />
        <style>{`html { color-scheme: light; }`}</style>
        <script
          dangerouslySetInnerHTML={{
            __html: `
        (function() {
          var attrs = [
            'data-darkreader-mode',
            'data-darkreader-scheme',
            'data-darkreader-proxy-injected',
            'data-darkreader-inline-stroke',
            'data-darkreader-inline-bg',
            'data-darkreader-inline-color',
            'data-darkreader-inline-bgimg'
          ];
          var styles = [
            '--darkreader-inline-stroke',
            '--darkreader-inline-bg',
            '--darkreader-inline-color',
            '--darkreader-inline-bgimg'
          ];
          function clean() {
            var elements = document.querySelectorAll('[' + attrs.join('],[') + ']');
            for (var i = 0; i < elements.length; i++) {
              for (var j = 0; j < attrs.length; j++) {
                elements[i].removeAttribute(attrs[j]);
              }
              for (var k = 0; k < styles.length; k++) {
                elements[i].style.removeProperty(styles[k]);
              }
            }
            var root = document.documentElement;
            var body = document.body;
            for (var l = 0; l < attrs.length; l++) {
              if (root) root.removeAttribute(attrs[l]);
              if (body) body.removeAttribute(attrs[l]);
            }
            for (var m = 0; m < styles.length; m++) {
              if (root) root.style.removeProperty(styles[m]);
              if (body) body.style.removeProperty(styles[m]);
            }
          }
          clean();
          if (typeof requestAnimationFrame !== 'undefined') {
            requestAnimationFrame(clean);
          } else {
            setTimeout(clean, 0);
          }
        })();
      `,
          }}
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
