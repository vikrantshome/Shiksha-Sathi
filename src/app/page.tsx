"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

// Check circle SVG
const CheckCircleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-primary)]">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

// Globe, groups, email SVG for footer
const GlobeIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></svg>
);
const GroupsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
);
const EmailIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"/></svg>
);

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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "py-2" : "py-4"}`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div
          className={`flex items-center justify-between px-4 py-2.5 rounded-lg transition-all duration-500 ${isScrolled ? "bg-[var(--color-surface)]/90 backdrop-blur-[20px] shadow-sm border border-[var(--color-outline-variant)]/20" : "bg-transparent"}`}
        >
          <Link href="/" className="flex items-center gap-2">
            <span className="text-[1.125rem] font-[700] tracking-tight text-[var(--color-primary)] font-manrope">
              Shiksha Sathi
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-[0.875rem] font-[600] tracking-tight text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] transition-colors font-manrope"
              >
                {link.name}
              </Link>
            ))}
            <div className="flex items-center gap-3">
              <Link
                href="/student/dashboard"
                className="text-[0.875rem] font-[600] tracking-tight text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] transition-colors font-manrope"
              >
                Student Portal
              </Link>
              <Link
                href="/login"
                className="px-4 py-2 text-[0.875rem] font-[600] text-[var(--color-primary)] hover:bg-[var(--color-surface-container-low)] rounded-md transition-all"
              >
                Teacher Login
              </Link>
              <Link
                href="/signup"
                className="px-5 py-2 text-[0.875rem] font-[700] text-[var(--color-on-primary)] rounded-md shadow-sm hover:opacity-90 transition-all active:scale-[0.98] bg-gradient-to-br from-primary to-primary-dim"
              >
                Create Free Account
              </Link>
            </div>
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-primary)]">
              {mobileMenuOpen ? (
                <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
              ) : (
                <><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></>
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
            className="absolute top-full left-0 right-0 bg-[var(--color-surface)] px-4 py-6 md:hidden flex flex-col gap-4 shadow-xl border-b border-[var(--color-surface-container)]"
          >
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-[1rem] font-[600] text-[var(--color-on-surface)]"
              >
                {link.name}
              </Link>
            ))}
            <Link
              href="/student/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-3 text-center rounded-md font-[600] text-[var(--color-primary)] border border-[var(--color-primary)]"
            >
              Student Portal
            </Link>
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-3 text-center rounded-md font-[600] text-[var(--color-primary)] border border-[var(--color-primary)]"
            >
              Teacher Login
            </Link>
            <Link
              href="/signup"
              className="w-full py-3 text-center rounded-md font-[700] text-[var(--color-on-primary)] bg-gradient-to-br from-primary to-primary-dim"
            >
              Create Free Account
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

/* ── Landing Page ── */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--color-surface)] text-[var(--color-on-surface)] selection:bg-[var(--color-secondary-container)] selection:text-[var(--color-on-secondary-container)] font-geist-sans">
      <Navbar />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-16 lg:py-20 grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-secondary-container)] text-[var(--color-on-secondary-container)] text-[0.75rem] font-[700] uppercase tracking-widest"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              Built for Indian Teachers
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-[3rem] md:text-[4.5rem] font-[800] text-[var(--color-primary)] leading-[1.1] tracking-tight font-manrope"
            >
              Empower Your Teaching with Shiksha Sathi
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-[1.125rem] md:text-[1.25rem] text-[var(--color-on-surface-variant)] max-w-xl leading-relaxed"
            >
              A comprehensive teacher-first platform for creating NCERT-aligned homework, auto-grading, and tracking class performance—all for free.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 pt-4"
            >
              <Link
                href="/signup"
                className="px-8 py-4 text-[1rem] font-[700] rounded-lg shadow-lg hover:shadow-xl transition-all text-[var(--color-on-primary)] text-center bg-gradient-to-br from-primary to-primary-dim"
              >
                Get Started for Free
              </Link>
              {/* Watch demo removed per instruction */}
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="pt-4 flex items-center gap-6 text-[0.875rem] text-[var(--color-outline)] font-[500]"
            >
              <div className="flex items-center gap-2">
                <CheckCircleIcon />
                CBSE Aligned
              </div>
              <div className="flex items-center gap-2">
                <CheckCircleIcon />
                NCERT Framework
              </div>
            </motion.div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="aspect-[4/5] rounded-lg overflow-hidden shadow-2xl">
              <Image 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBT2YwhLdWLyEwN-ipM7c5sT0UVExnhHDv6T8TVcrlCCRSTTx-jy8TsmmKqbXJGlHfUvPEa7-pjvSDaRdDbJ0NN8P7XlJoTQKOSFKba7II2PfLxwKI6heSzOi-8BQSMycCdqf5NaFUmsgbQdNrKZNdezs2vB-3sNVwB4Fl3guqxub15StajgkzFhmUqZauCsUKyFrOMqwHy3EKhZRuOjO732v61HUJTfq1OJ6upy6xTkEGVzRtDlm5FKH0AlWpJtrZTwWWmNKKOODjt" 
                alt="Teacher working in a digital environment" 
                className="w-full h-full object-cover"
                width={600}
                height={750}
                unoptimized
              />
            </div>
            
            {/* Floating Card */}
            <div className="absolute -bottom-8 -left-8 bg-[rgba(255,255,255,0.85)] backdrop-blur-[12px] p-6 rounded-lg shadow-xl max-w-[240px] border border-[var(--color-outline-variant)]/20">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-[var(--color-primary-container)] flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
                </div>
                <div>
                  <div className="text-[0.75rem] text-[var(--color-outline)] font-[700]">Class Performance</div>
                  <div className="text-[1.125rem] font-[700] text-[var(--color-primary)]">+24% Improvement</div>
                </div>
              </div>
              <div className="h-12 w-full bg-[var(--color-surface-container-low)] rounded-sm flex items-end gap-1 p-1">
                <div className="w-full bg-[var(--color-primary)] opacity-40 h-1/2 rounded-t-[2px]"></div>
                <div className="w-full bg-[var(--color-primary)] opacity-60 h-2/3 rounded-t-[2px]"></div>
                <div className="w-full bg-[var(--color-primary)] opacity-30 h-1/3 rounded-t-[2px]"></div>
                <div className="w-full bg-[var(--color-primary)] opacity-100 h-full rounded-t-[2px]"></div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Feature Bento Grid */}
        <section id="features" className="bg-[var(--color-surface-container-low)] py-12 md:py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="text-center mb-12 md:mb-16 lg:mb-20 space-y-3 md:space-y-4">
              <h2 className="text-[1.5rem] md:text-[2.5rem] lg:text-[3rem] font-[800] text-[var(--color-primary)] font-manrope tracking-tight">The Modern Educator&apos;s Toolkit</h2>
              <p className="text-[var(--color-on-surface-variant)] max-w-2xl mx-auto text-[1rem] md:text-[1.125rem]">Designed by educators for educators, focusing on efficiency and pedagogical excellence.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {/* Feature 1: Main Focus */}
              <div className="md:col-span-2 bg-[var(--color-surface-container-lowest)] p-6 md:p-8 lg:p-10 rounded-lg shadow-sm border border-[var(--color-outline-variant)]/30 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[var(--color-secondary-container)] flex items-center justify-center mb-6 md:mb-8">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-on-secondary-container)" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
                  </div>
                  <h3 className="text-[1.5rem] md:text-[1.875rem] font-[700] text-[var(--color-primary)] mb-3 md:mb-4 font-manrope">Expansive Question Bank</h3>
                  <p className="text-[var(--color-on-surface-variant)] text-[1rem] md:text-[1.125rem] leading-relaxed max-w-lg">
                    Access thousands of curated questions aligned with the NCERT curriculum and CBSE frameworks. Create personalized worksheets and assessments in minutes, tailored to your students&apos; needs.
                  </p>
                </div>
                <div className="mt-8 md:mt-12 flex flex-wrap gap-2 md:gap-3">
                  {['Mathematics', 'Science', 'Social Studies', 'English'].map(subject => (
                    <span key={subject} className="px-3 md:px-4 py-1.5 md:py-2 bg-[var(--color-surface-container)] rounded-full text-[0.75rem] md:text-[0.875rem] font-[500] text-[var(--color-primary)]">
                      {subject}
                    </span>
                  ))}
                </div>
              </div>

              {/* Feature 2: Small Card */}
              <div className="bg-[var(--color-surface-container-lowest)] p-6 md:p-8 lg:p-10 rounded-lg shadow-sm border border-[var(--color-outline-variant)]/30">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[var(--color-primary-container)] flex items-center justify-center mb-6 md:mb-8">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-on-primary-container)" strokeWidth="2"><path d="m9 11 3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
                </div>
                <h3 className="text-[1.25rem] md:text-[1.5rem] font-[700] text-[var(--color-primary)] mb-3 md:mb-4 font-manrope">Smart Auto-Grading</h3>
                <p className="text-[var(--color-on-surface-variant)] leading-relaxed">
                  Save hours every week with instant feedback. Our intelligent system automatically grades assignments and identifies common misconceptions.
                </p>
              </div>

              {/* Feature 3: Small Card */}
              <div className="bg-[var(--color-surface-container-lowest)] p-6 md:p-8 lg:p-10 rounded-lg shadow-sm border border-[var(--color-outline-variant)]/30">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[var(--color-tertiary-container)] flex items-center justify-center mb-6 md:mb-8">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-tertiary)" strokeWidth="2"><path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" /></svg>
                </div>
                <h3 className="text-[1.25rem] md:text-[1.5rem] font-[700] text-[var(--color-primary)] mb-3 md:mb-4 font-manrope">Assignment Reports</h3>
                <p className="text-[var(--color-on-surface-variant)] leading-relaxed">
                  Gain deep insights into class and individual performance. Track progress over time with visually intuitive dashboards.
                </p>
              </div>

              {/* Feature 4: Wide Highlight */}
              <div className="md:col-span-2 relative overflow-hidden bg-[var(--color-primary)] text-[var(--color-on-primary)] p-6 md:p-8 lg:p-10 rounded-lg flex items-center">
                <div className="relative z-10 max-w-md">
                  <h3 className="text-[1.5rem] md:text-[1.875rem] font-[700] mb-3 md:mb-4 font-manrope">Ready for the New Academic Cycle</h3>
                  <p className="text-[var(--color-primary-container)] text-[1rem] md:text-[1.125rem]">
                    All our content is updated to reflect the latest NCF and NEP 2020 recommendations for Indian schools.
                  </p>
                  <button className="mt-6 md:mt-8 px-5 md:px-6 py-2.5 md:py-3 bg-[var(--color-on-primary)] text-[var(--color-primary)] font-[700] rounded-lg hover:bg-[var(--color-surface-container-lowest)] transition-all">
                    View Curriculum Map
                  </button>
                </div>
                <div className="absolute right-0 top-0 h-full w-1/3 opacity-20 hidden lg:block">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-[300px] h-[300px] absolute -right-10 top-1/2 -translate-y-1/2"><path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72l5 2.73 5-2.73v3.72z"/></svg>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Academic Trust Section */}
        <section id="how-it-works" className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16 lg:py-20">
          <div className="bg-[var(--color-surface-container-lowest)] rounded-lg p-6 md:p-10 lg:p-12 border border-[var(--color-outline-variant)]/50 flex flex-col md:flex-row gap-8 md:gap-12 lg:gap-16 items-center shadow-sm">
            <div className="md:w-1/2">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCCn-q2qwOGKCOamKJ0SrPcvhyhy4f8ZfzhJbgLYdcuBrLhhfOKzV_iiR5Bd8czw_4lP5z6PyICRxrv42IQapDRDwvGC2dQsuk-cG5RWyMhYNLLxQ8lQrAoNNUwaYom0j6vXhcz2xbLnX0rQy_CqFjplf0VNtw7M9MNKhSUGbonpz6wNUg-CSFo_l14AlgO79cGJfUIoNzPRdGEROU1gIX9m6ctHN2gOIOIJ8Jdz9VANfvKBx8s3c9eRIoXBg5NLCLjCYGAbNtptU1G"
                alt="Teacher assisting students"
                className="rounded-lg shadow-lg w-full h-auto"
                width={600}
                height={450}
                unoptimized
              />
            </div>
            <div className="md:w-1/2 space-y-4 md:space-y-6">
              <h2 className="text-[1.75rem] md:text-[2rem] lg:text-[2.25rem] font-[800] text-[var(--color-primary)] font-manrope tracking-tight leading-tight">
                Focus on Teaching, Leave the Paperwork to Us
              </h2>
              <p className="text-[var(--color-on-surface-variant)] text-[1rem] md:text-[1.125rem] leading-relaxed">
                We understand that a teacher&apos;s time is precious. Shiksha Sathi was created to remove the administrative burden of teaching, allowing you to focus on what matters most: your students.
              </p>
              <ul className="space-y-3 pt-2 md:pt-4">
                {[
                  "Zero cost for government & private schools",
                  "Secure data protection for student privacy",
                  "24/7 Academic Support for educators"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 md:gap-3 font-[500] text-[var(--color-primary)]">
                    <span className="text-[var(--color-primary-container)] bg-[var(--color-primary)] rounded-full w-5 h-5 md:w-6 md:h-6 flex items-center justify-center shrink-0">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="max-w-[1024px] mx-auto px-4 md:px-8 py-12 md:py-16">
          <div className="p-6 md:p-10 lg:p-12 rounded-lg text-[var(--color-on-primary)] shadow-2xl relative overflow-hidden bg-gradient-to-br from-primary to-primary-dim">
            <div className="relative z-10 space-y-6 md:space-y-8">
              <h2 className="text-[1.75rem] md:text-[2.5rem] lg:text-[3rem] font-[800] font-manrope tracking-tight leading-tight">
                Join Thousands of Indian Teachers
              </h2>
              <p className="text-[var(--color-primary-container)] text-[1rem] md:text-[1.125rem] max-w-2xl mx-auto">
                Transform your classroom with data-driven insights and effortless resource planning.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center pt-2 md:pt-4">
                <Link
                  href="/signup"
                  className="bg-[var(--color-surface-container-lowest)] text-[var(--color-primary)] px-8 md:px-10 py-4 md:py-5 text-[1rem] md:text-[1.125rem] font-[700] rounded-lg shadow-lg hover:bg-[var(--color-surface-container-low)] transition-all inline-block hover:scale-[1.02] active:scale-[0.98]"
                >
                  Get Started Now — It&apos;s Free
                </Link>
              </div>
            </div>
            
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-[var(--color-surface-container-lowest)] opacity-10 rounded-full blur-[60px]"></div>
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-[var(--color-primary-container)] opacity-20 rounded-full blur-[60px]"></div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer id="resources" className="bg-[var(--color-surface-container-low)] dark:bg-slate-900 pt-10 md:pt-12 lg:pt-16 border-t border-[var(--color-outline-variant)]/20">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
            <div className="space-y-4 md:space-y-6">
              <div className="text-[1rem] md:text-[1.125rem] font-[700] text-[var(--color-on-surface)] font-manrope">
                Shiksha Sathi
              </div>
              <p className="text-[var(--color-on-surface-variant)] text-[0.8125rem] md:text-[0.875rem] leading-relaxed max-w-xs">
                Elevating the standard of education across India through intelligent teacher tools and curriculum-aligned resources.
              </p>
              <div className="flex gap-3 md:gap-4">
                <span className="text-[var(--color-primary)] cursor-pointer hover:opacity-70 transition-opacity">
                  <GlobeIcon />
                </span>
                <span className="text-[var(--color-primary)] cursor-pointer hover:opacity-70 transition-opacity">
                  <GroupsIcon />
                </span>
                <span className="text-[var(--color-primary)] cursor-pointer hover:opacity-70 transition-opacity">
                  <EmailIcon />
                </span>
              </div>
            </div>
            <div className="space-y-4 md:space-y-6">
              <h4 className="font-[700] text-[var(--color-primary)] font-manrope">Academic Resources</h4>
              <ul className="space-y-2 md:space-y-3">
                <li><Link href="#" className="text-[var(--color-on-surface-variant)] text-[0.8125rem] md:text-[0.875rem] hover:text-[var(--color-primary)] hover:underline transition-colors opacity-80 hover:opacity-100">NCERT Resources</Link></li>
                <li><Link href="#" className="text-[var(--color-on-surface-variant)] text-[0.8125rem] md:text-[0.875rem] hover:text-[var(--color-primary)] hover:underline transition-colors opacity-80 hover:opacity-100">CBSE Guidelines</Link></li>
                <li><Link href="#" className="text-[var(--color-on-surface-variant)] text-[0.8125rem] md:text-[0.875rem] hover:text-[var(--color-primary)] hover:underline transition-colors opacity-80 hover:opacity-100">Teacher Training Hub</Link></li>
                <li><Link href="#" className="text-[var(--color-on-surface-variant)] text-[0.8125rem] md:text-[0.875rem] hover:text-[var(--color-primary)] hover:underline transition-colors opacity-80 hover:opacity-100">NEP 2020 Compliance</Link></li>
              </ul>
            </div>
            <div className="space-y-4 md:space-y-6">
              <h4 className="font-[700] text-[var(--color-primary)] font-manrope">Platform</h4>
              <ul className="space-y-2 md:space-y-3">
                <li><Link href="#" className="text-[var(--color-on-surface-variant)] text-[0.8125rem] md:text-[0.875rem] hover:text-[var(--color-primary)] hover:underline transition-colors opacity-80 hover:opacity-100">Privacy Policy</Link></li>
                <li><Link href="#" className="text-[var(--color-on-surface-variant)] text-[0.8125rem] md:text-[0.875rem] hover:text-[var(--color-primary)] hover:underline transition-colors opacity-80 hover:opacity-100">Terms of Service</Link></li>
                <li><Link href="#" className="text-[var(--color-on-surface-variant)] text-[0.8125rem] md:text-[0.875rem] hover:text-[var(--color-primary)] hover:underline transition-colors opacity-80 hover:opacity-100">Contact Us</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 md:mt-10 pt-6 md:pt-8 border-t border-[var(--color-outline-variant)]/30 text-center">
            <p className="text-[var(--color-on-surface-variant)] text-[0.75rem] md:text-[0.875rem]">
              © {new Date().getFullYear()} Shiksha Sathi. All resources aligned with NCERT and CBSE frameworks for Indian Educators.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
