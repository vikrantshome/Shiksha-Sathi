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
    <div className="bg-background text-on-surface min-h-screen flex flex-col">
      <header className="fixed top-0 left-0 w-full z-50 bg-[#faf9f5]/80 backdrop-blur-[24px] shadow-[0px_12px_32px_rgba(27,28,26,0.04)]">
        <div className="flex justify-between items-center h-16 px-4 md:px-8 w-full max-w-full">
          <Link
            href="/"
            className="text-xl font-bold tracking-[-0.02em] text-[#002b29] hover:opacity-80 transition-opacity"
          >
            Shiksha Sathi
          </Link>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center pt-20 pb-10 px-4 md:px-6 bg-[radial-gradient(circle_at_top_right,#cae5e1_0%,transparent_40%),radial-gradient(circle_at_bottom_left,#efeeea_0%,transparent_30%)]">
        <div className="w-full max-w-xl bg-surface-container-low p-5 md:p-8 lg:p-10 rounded-xl shadow-[0px_12px_32px_rgba(27,28,26,0.04)] relative overflow-hidden">
          {/* Decorative Accent */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-secondary-container opacity-20 blur-3xl -mr-16 -mt-16"></div>

          <div className="relative z-10">
            {/* Header Section */}
            <div className="mb-8">
              <span className="font-['Manrope'] text-[10px] tracking-[0.15em] uppercase font-bold text-on-surface-variant block mb-2">
                {eyebrow}
              </span>
              <h1 className="font-headline text-2xl md:text-3xl font-bold tracking-tight text-primary">
                {title}
              </h1>
              <p className="text-on-surface-variant mt-2 text-sm font-light">
                {description}
              </p>
            </div>

            {/* Form & Children content */}
            {children}

            {legalNote && (
              <p className="text-[11px] text-on-surface-variant leading-relaxed opacity-70 mt-4">
                {legalNote}
              </p>
            )}

            {/* CTA Actions */}
            <div className="pt-3 flex flex-col gap-4 mt-6">
              <div className="flex items-center justify-center gap-2">
                <span className="text-sm text-on-surface-variant">{alternatePrompt}</span>
                <Link
                  href={alternateHref}
                  className="text-sm font-bold text-primary hover:text-primary-container transition-colors duration-200"
                >
                  {alternateLabel}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Asymmetric Background Elements */}
        <div className="hidden lg:block absolute left-8 bottom-8 w-64 opacity-40">
          <div className="flex flex-col gap-4">
            <div className="w-12 h-[1px] bg-primary"></div>
            <p className="text-xs font-medium tracking-widest uppercase text-on-surface-variant/60 leading-loose">
              Curating the future<br/>of educational<br/>excellence.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
