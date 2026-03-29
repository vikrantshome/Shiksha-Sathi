"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

/* ── Navbar ── */
const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Features", href: "#features" },
    { name: "How it Works", href: "#how-it-works" },
    { name: "Resources", href: "#resources" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "py-3" : "py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div
          className={`flex items-center justify-between px-6 py-3 rounded-md transition-all duration-500 ${
            isScrolled
              ? "bg-[rgba(250,249,245,0.8)] backdrop-blur-[20px] shadow-sm"
              : "bg-transparent"
          }`}
        >
          <Link href="/" className="flex items-center gap-2">
            <span className="text-[1.25rem] font-[700] tracking-tight text-[var(--color-primary)] font-[family-name:var(--font-manrope)]">
              Shiksha Sathi
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-[0.875rem] font-[500] text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] transition-colors"
              >
                {link.name}
              </Link>
            ))}
            <Link
              href="/login"
              className="px-5 py-2 text-[0.875rem] font-[600] text-[var(--color-on-primary)] rounded-[0.125rem] transition-transform active:scale-[0.98]"
              style={{
                background:
                  "linear-gradient(145deg, var(--color-primary), var(--color-primary-dim))",
              }}
            >
              Start Teaching
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-[var(--color-primary)]"
            >
              {mobileMenuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 bg-[var(--color-surface)] px-6 py-8 md:hidden flex flex-col gap-6"
            style={{
              borderBottom: "1px solid var(--color-surface-container)",
            }}
          >
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-[1rem] font-[500] text-[var(--color-on-surface)]"
              >
                {link.name}
              </Link>
            ))}
            <Link
              href="/login"
              className="w-full py-3 text-center rounded-[0.125rem] font-[600] text-[var(--color-on-primary)]"
              style={{
                background:
                  "linear-gradient(145deg, var(--color-primary), var(--color-primary-dim))",
              }}
            >
              Start Teaching
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

/* ── Feature Card ── */
const FeatureCard = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => (
  <div className="p-8 bg-[var(--color-surface-container-lowest)] rounded-[var(--radius-md)] group hover:bg-[var(--color-primary-container)] transition-colors duration-500">
    <div className="w-10 h-10 mb-6 flex items-center justify-center text-[var(--color-primary)] group-hover:scale-110 transition-transform duration-300">
      {icon}
    </div>
    <h3 className="text-[1.25rem] font-[600] text-[var(--color-on-surface)] mb-3 leading-tight">
      {title}
    </h3>
    <p className="text-[0.875rem] text-[var(--color-on-surface-variant)] leading-relaxed">
      {description}
    </p>
  </div>
);

/* ── Landing Page ── */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--color-surface)] text-[var(--color-on-surface)] selection:bg-[var(--color-primary-container)] font-[family-name:var(--font-geist-sans)]">
      <Navbar />

      <main>
        {/* Hero Section */}
        <section className="relative pt-40 pb-24 md:pt-56 md:pb-40 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="max-w-3xl">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-[2.25rem] md:text-[3.5rem] font-[700] tracking-tight leading-[1.1] mb-8 font-[family-name:var(--font-manrope)]"
              >
                Empowering Indian Educators
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-[1.125rem] md:text-[1.25rem] text-[var(--color-on-surface-variant)] mb-4 leading-relaxed max-w-2xl"
              >
                A comprehensive teacher-first platform for creating
                NCERT-aligned homework, auto-grading, and tracking class
                performance—all for free.
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="text-[0.875rem] text-[var(--color-on-surface-variant)] mb-12 leading-relaxed max-w-2xl italic"
              >
                Designed by educators for educators, focusing on efficiency and
                pedagogical excellence.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Link
                  href="/login"
                  className="px-8 py-4 rounded-[var(--radius-sm)] text-[1rem] font-[600] text-[var(--color-on-primary)] text-center transition-all hover:opacity-90 active:scale-[0.98]"
                  style={{
                    background:
                      "linear-gradient(145deg, var(--color-primary), var(--color-primary-dim))",
                  }}
                >
                  Start Teaching
                </Link>
                <Link
                  href="/signup"
                  className="px-8 py-4 rounded-[var(--radius-sm)] text-[1rem] font-[600] text-[var(--color-primary)] text-center transition-colors bg-transparent hover:bg-[var(--color-surface-container)] active:scale-[0.98]"
                >
                  Create Account
                </Link>
              </motion.div>
            </div>
          </div>

          {/* Subtle Decorative Element */}
          <div className="absolute top-0 right-0 w-1/2 h-full bg-[var(--color-primary-container)] opacity-20 blur-[120px] -z-10 translate-x-1/4 -translate-y-1/4" />
        </section>

        {/* Features Grid */}
        <section
          id="features"
          className="py-24 bg-[var(--color-surface-container-low)]"
        >
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-16">
              <h2 className="text-[1.75rem] font-[600] mb-4 font-[family-name:var(--font-manrope)]">
                Built for the Academic Cycle
              </h2>
              <div className="w-12 h-1 bg-[var(--color-primary)] rounded-full" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <FeatureCard
                icon={
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                  </svg>
                }
                title="Expansive Question Bank"
                description="Access thousands of curated questions aligned with NCERT curriculum and CBSE frameworks. Create personalized worksheets and assessments in minutes."
              />
              <FeatureCard
                icon={
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m9 11 3 3L22 4" />
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                  </svg>
                }
                title="Smart Auto-Grading"
                description="Save hours every week with instant feedback. Our intelligent system automatically grades assignments and identifies common misconceptions."
              />
              <FeatureCard
                icon={
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 3v18h18" />
                    <path d="m19 9-5 5-4-4-3 3" />
                  </svg>
                }
                title="Assignment Reports"
                description="Gain deep insights into class and individual performance. Track progress over time with visually intuitive dashboards."
              />
              <FeatureCard
                icon={
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h7" />
                    <path d="M3 10h18" />
                    <path d="M16 2v6" />
                    <path d="M8 2v6" />
                    <path d="m16 19 2 2 4-4" />
                  </svg>
                }
                title="Ready for the New Academic Cycle"
                description="All content updated to reflect the latest NCF and NEP 2020 recommendations for Indian schools."
              />
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section id="how-it-works" className="py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-16">
              <h2 className="text-[1.75rem] font-[600] mb-4 font-[family-name:var(--font-manrope)]">
                Why Shiksha Sathi?
              </h2>
              <p className="text-[1rem] text-[var(--color-on-surface-variant)] max-w-xl leading-relaxed">
                We understand that a teacher&apos;s time is precious. Shiksha
                Sathi was created to remove the administrative burden of
                teaching, allowing you to focus on what matters most: your
                students.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <ul className="space-y-6">
                  {[
                    "Zero cost for government & private schools",
                    "Secure data protection for student privacy",
                    "24/7 Academic Support for educators",
                  ].map((text, i) => (
                    <li key={i} className="flex items-start gap-4">
                      <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-[var(--color-success)] flex items-center justify-center text-white">
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <span className="text-[1rem] font-[500] text-[var(--color-on-surface)]">
                        {text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative">
                <div className="aspect-square bg-[var(--color-surface-container)] rounded-[var(--radius-md)] flex items-center justify-center overflow-hidden">
                  <div className="w-3/4 h-3/4 grid grid-cols-2 gap-4">
                    <div className="bg-[var(--color-primary)] opacity-10 rounded-sm" />
                    <div className="bg-[var(--color-primary)] opacity-40 rounded-sm translate-y-8" />
                    <div className="bg-[var(--color-primary)] opacity-20 rounded-sm -translate-y-4" />
                    <div className="bg-[var(--color-primary)] opacity-60 rounded-sm" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="py-24 px-6">
          <div
            className="max-w-7xl mx-auto rounded-[var(--radius-md)] p-12 md:p-20 text-center relative overflow-hidden"
            style={{
              background:
                "linear-gradient(145deg, var(--color-primary), var(--color-primary-dim))",
            }}
          >
            <h2 className="text-[1.75rem] md:text-[2.25rem] font-[700] text-[var(--color-on-primary)] mb-6 font-[family-name:var(--font-manrope)] relative z-10 leading-tight">
              Ready to Transform Your Classroom?
            </h2>
            <p className="text-[1rem] text-[var(--color-on-primary)] opacity-80 mb-10 max-w-xl mx-auto relative z-10 leading-relaxed">
              Transform your classroom with data-driven insights and effortless
              resource planning.
            </p>
            <Link
              href="/login"
              className="inline-block px-10 py-4 bg-[var(--color-on-primary)] text-[var(--color-primary)] font-[600] rounded-[var(--radius-md)] transition-transform hover:scale-[1.02] active:scale-[0.98] relative z-10"
            >
              Get Started
            </Link>

            {/* Background Texture */}
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
                backgroundSize: "24px 24px",
              }}
            />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer
        id="resources"
        className="py-20 bg-[var(--color-surface-container-low)]"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
            <div>
              <span className="text-[1.25rem] font-[700] text-[var(--color-primary)] font-[family-name:var(--font-manrope)] block mb-6">
                Shiksha Sathi
              </span>
              <p className="text-[0.875rem] text-[var(--color-on-surface-variant)] max-w-xs leading-relaxed">
                Elevating the standard of education across India through
                intelligent teacher tools and curriculum-aligned resources.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <span className="text-[0.6875rem] font-[500] text-[var(--color-on-surface)] uppercase tracking-[0.05em]">
                Academic Resources
              </span>
              <Link
                href="#"
                className="text-[0.875rem] text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] transition-colors"
              >
                NCERT Resources
              </Link>
              <Link
                href="#"
                className="text-[0.875rem] text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] transition-colors"
              >
                CBSE Guidelines
              </Link>
              <Link
                href="#"
                className="text-[0.875rem] text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] transition-colors"
              >
                Teacher Training Hub
              </Link>
              <Link
                href="#"
                className="text-[0.875rem] text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] transition-colors"
              >
                NEP 2020 Compliance
              </Link>
            </div>
            <div className="flex flex-col gap-4">
              <span className="text-[0.6875rem] font-[500] text-[var(--color-on-surface)] uppercase tracking-[0.05em]">
                Platform
              </span>
              <Link
                href="#"
                className="text-[0.875rem] text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="#"
                className="text-[0.875rem] text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                href="#"
                className="text-[0.875rem] text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
          <div className="pt-8 flex flex-col md:flex-row justify-between gap-4">
            <p className="text-[0.75rem] text-[var(--color-on-surface-variant)] uppercase tracking-widest">
              © {new Date().getFullYear()} Shiksha Sathi. All resources aligned
              with NCERT and CBSE frameworks for Indian Educators.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
