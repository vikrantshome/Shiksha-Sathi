import Link from "next/link";
import { ReactNode } from "react";

interface AuthShellProps {
  eyebrow: string;
  title: string;
  description: string;
  alternatePrompt: string;
  alternateHref: string;
  alternateLabel: string;
  children: ReactNode;
  legalNote?: ReactNode;
}

export default function AuthShell({
  eyebrow,
  title,
  description,
  alternatePrompt,
  alternateHref,
  alternateLabel,
  children,
  legalNote,
}: AuthShellProps) {
  return (
  <div className="flex flex-col min-h-screen bg-background text-on-surface">
      <header className="fixed top-0 left-0 w-full z-50 bg-[#faf9f5]/80 backdrop-blur-[24px] shadow-[0px_12px_32px_rgba(27,28,26,0.04)]">
        <div className="flex items-center justify-between w-full h-16 max-w-full px-4 md:px-8">
          <Link
            href="/"
            className="text-xl font-bold tracking-[-0.02em] text-primary hover:opacity-80 transition-opacity"
          >
            Shiksha Sathi
          </Link>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center bg-[radial-gradient(circle_at_top_right,#cae5e1_0%,transparent_40%),radial-gradient(circle_at_bottom_left,#efeeea_0%,transparent_30%)] pt-16 overflow-y-auto">
        <div className="w-full max-w-xl bg-surface-container-low p-5 md:p-6 lg:p-8 rounded-lg shadow-[0px_12px_32px_rgba(27,28,26,0.04)] relative overflow-hidden mx-4">
          {/* Decorative Accent */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-secondary-container opacity-20 blur-3xl"></div>

          <div className="relative z-10">
            {/* Header Section */}
            <div className="mb-5">
              <span className="font-['Manrope'] text-[10px] tracking-[0.15em] uppercase font-bold text-on-surface-variant block mb-2">
                {eyebrow}
              </span>
              <h1 className="text-2xl font-bold tracking-tight font-headline md:text-3xl text-primary">
                {title}
              </h1>
              <p className="mt-1.5 text-xs font-light leading-relaxed text-on-surface-variant">
                {description}
              </p>
            </div>

            {/* Form & Children content */}
            {children}

            {legalNote && (
              <p className="text-[11px] text-on-surface-variant leading-relaxed opacity-70 mt-3">
                {legalNote}
              </p>
            )}

            {/* CTA Actions */}
            <div className="flex flex-col gap-3 pt-2 mt-3">
              <div className="flex items-center justify-center gap-2">
                <span className="text-sm text-on-surface-variant">{alternatePrompt}</span>
                <Link
                  href={alternateHref}
                  className="text-sm font-bold transition-colors duration-200 text-primary hover:text-primary-container"
                >
                  {alternateLabel}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Asymmetric Background Elements */}
        <div className="absolute hidden w-64 lg:block left-8 bottom-8 opacity-40">
          <div className="flex flex-col gap-4">
            <div className="w-12 h-[1px] bg-primary"></div>
            <p className="text-xs font-medium leading-loose tracking-widest uppercase text-on-surface-variant/60">
              Curating the future<br/>of educational<br/>excellence.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
