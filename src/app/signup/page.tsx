"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setCookie } from "cookies-next";
import { auth } from "@/lib/api/auth";
import AuthShell from "@/components/AuthShell";
import AuthSessionGuard from "@/components/AuthSessionGuard";
import SearchableSchoolDropdown from "@/components/SearchableSchoolDropdown";

export default function SignupPage() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [school, setSchool] = useState("");
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const validatePhone = (phone: string): boolean => {
    const digits = phone.replace(/\D/g, "");
    if (digits.length !== 10) {
      setPhoneError("Phone number must be exactly 10 digits");
      return false;
    }
    setPhoneError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setPhoneError(null);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const password = formData.get("password") as string;

    // Validate phone
    if (!validatePhone(phone)) return;

    // Validate school
    if (!school.trim()) {
      setError("Please select or enter a school name");
      return;
    }

    setIsPending(true);

    try {
      const response = await auth.signup({
        name,
        email: email || undefined,
        phone: phone.replace(/\D/g, ""), // Store digits only
        password,
        school,
        role: "TEACHER",
      });

      setCookie("auth-token", response.token, {
        maxAge: 30 * 24 * 60 * 60,
        path: "/",
      });

      router.push("/teacher/dashboard");
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setError(apiError.message || "We could not create your account right now.");
      setIsPending(false);
      return;
    }

    setIsPending(false);
  };

  return (
    <AuthShell
      eyebrow="Join the Community"
      title="Begin Your Journey"
      description="Create your teacher workspace to publish assignments, guide student practice, and keep your classroom operations in one calm academic system."
      alternatePrompt="Already an educator here?"
      alternateHref="/login"
      alternateLabel="Log in instead"
      legalNote={
        <>
          By creating an account, you agree to Shiksha Sathi&apos;s{" "}
          <a href="#" className="underline underline-offset-2 hover:text-primary transition-colors">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="underline underline-offset-2 hover:text-primary transition-colors">
            Privacy Policy
          </a>
          .
        </>
      }
    >
      <AuthSessionGuard />

      {error && (
        <div className="mb-6 p-4 bg-error-container/20 text-error text-sm rounded-md border border-error/10">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Full Name — required */}
        <div className="group">
          <label htmlFor="signup-name" className="block font-label text-xs tracking-[0.05em] uppercase font-semibold text-on-surface-variant mb-2">
            Full Name <span className="text-error">*</span>
          </label>
          <input
            id="signup-name"
            type="text"
            name="name"
            required
            placeholder="E.g. Dr. Helena Richards"
            className="w-full bg-surface-container-highest border-0 border-b border-outline-variant focus:ring-0 focus:border-primary px-0 py-3 text-on-surface placeholder:text-outline transition-all duration-300"
          />
        </div>

        {/* School — Searchable Dropdown (required) */}
        <SearchableSchoolDropdown value={school} onChange={setSchool} />

        {/* Phone — 10 digits only (required) */}
        <div className="group">
          <label htmlFor="signup-phone" className="block font-label text-xs tracking-[0.05em] uppercase font-semibold text-on-surface-variant mb-2">
            Phone Number <span className="text-error">*</span>
          </label>
          <input
            id="signup-phone"
            type="tel"
            name="phone"
            required
            placeholder="9876543210"
            maxLength={10}
            pattern="\d{10}"
            className={`w-full bg-surface-container-highest border-0 border-b px-0 py-3 text-on-surface placeholder:text-outline transition-all duration-300 ${
              phoneError ? "border-error focus:border-error" : "border-outline-variant focus:border-primary"
            }`}
          />
          {phoneError && (
            <p className="mt-1 text-xs text-error">{phoneError}</p>
          )}
        </div>

        {/* Email — optional */}
        <div className="group">
          <label htmlFor="signup-email" className="block font-label text-xs tracking-[0.05em] uppercase font-semibold text-on-surface-variant mb-2">
            Email Address <span className="text-on-surface-variant/50">(optional)</span>
          </label>
          <input
            id="signup-email"
            type="email"
            name="email"
            placeholder="helena.richards@institution.edu"
            className="w-full bg-surface-container-highest border-0 border-b border-outline-variant focus:ring-0 focus:border-primary px-0 py-3 text-on-surface placeholder:text-outline transition-all duration-300"
          />
        </div>

        {/* Password */}
        <div className="group">
          <label htmlFor="signup-password" className="block font-label text-xs tracking-[0.05em] uppercase font-semibold text-on-surface-variant mb-2">
            Password <span className="text-error">*</span>
          </label>
          <input
            id="signup-password"
            type="password"
            name="password"
            required
            placeholder="••••••••"
            className="w-full bg-surface-container-highest border-0 border-b border-outline-variant focus:ring-0 focus:border-primary px-0 py-3 text-on-surface placeholder:text-outline transition-all duration-300"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full mt-4 py-4 px-6 bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold text-sm tracking-wide rounded-lg shadow-md hover:shadow-xl active:scale-[0.98] transition-all duration-300 uppercase disabled:opacity-75 disabled:pointer-events-none"
        >
          {isPending ? "Creating Account…" : "Create Teacher Account"}
        </button>
      </form>
    </AuthShell>
  );
}
