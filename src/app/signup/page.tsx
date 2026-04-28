"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/api/auth";
import { saveStudentIdentity } from "@/lib/api/students";
import { trackEvent } from "@/lib/analytics";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import AuthShell from "@/components/AuthShell";
import AuthSessionGuard from "@/components/AuthSessionGuard";
import SearchableSchoolDropdown from "@/components/SearchableSchoolDropdown";
import Loader from "@/components/Loader";

type Role = "TEACHER" | "STUDENT";

export default function SignupPage() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<Role>("TEACHER");
  const [school, setSchool] = useState("");
  const [board, setBoard] = useState("");
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const boardOptions = ["CBSE", "ICSE", "State Board", "IB", "IGCSE"];

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
    const studentClass = formData.get("studentClass") as string;
    const section = formData.get("section") as string;
    const rollNumber = formData.get("rollNumber") as string;

    // Validate phone
    if (!validatePhone(phone)) return;

    // Validate school
    if (!school.trim()) {
      setError("Please select or enter a school name");
      return;
    }

    // Validate board (for teachers)
    if (role === "TEACHER" && !board.trim()) {
      setError("Please select your board");
      return;
    }

    // Student-specific validation
    if (role === "STUDENT" && (!studentClass || !section || !rollNumber)) {
      setError("Please fill in all student details (class, section, roll number)");
      return;
    }

    setIsPending(true);

    try {
      const response = await auth.signup({
        name,
        email: email || undefined,
        phone: phone.replace(/\D/g, ""),
        password,
        school,
        board: role === "TEACHER" ? board : undefined,
        rollNumber: role === "STUDENT" ? rollNumber : undefined,
        studentClass: role === "STUDENT" ? studentClass : undefined,
        section: role === "STUDENT" ? section : undefined,
        role,
      });

      // Set sessionStorage for client-side auth (tab-isolated)
      // No cookie - cookie is shared across all tabs, defeating tab isolation
      sessionStorage.setItem('shiksha-sathi-token', response.token);

      trackEvent("user_signed_up", { role, school });
      if (role === "STUDENT") {
        saveStudentIdentity({
          studentId: rollNumber,
          studentName: name,
          school,
          class: studentClass,
          section,
          storedAt: new Date().toISOString(),
        });
        router.push("/student/dashboard");
      } else {
        router.push("/teacher/dashboard");
      }
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
      description={
        role === "TEACHER"
          ? "Create your teacher workspace to publish assignments, guide student practice, and manage your classroom."
          : "Access assignments, submit answers, and track your academic progress."
      }
      alternatePrompt="Already have an account?"
      alternateHref="/login"
      alternateLabel="Log in instead"
      legalNote={
        <>
          By creating an account, you agree to Shiksha Sathi&apos;s{" "}
          <a href="#" className="underline transition-colors underline-offset-2 hover:text-primary">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="underline transition-colors underline-offset-2 hover:text-primary">
            Privacy Policy
          </a>
          .
        </>
      }
    >
      <AuthSessionGuard />

      {error && (
        <div className="p-3 mb-4 text-sm border rounded-md bg-error-container/20 text-error border-error/10">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
        {/* Role Toggle — M3 Segmented Button */}
        <div className="flex max-w-xs gap-2 p-1 mx-auto mb-2 rounded-full bg-surface-container">
          <button
            type="button"
            onClick={() => setRole("TEACHER")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-full text-xs font-semibold transition-all ${
              role === "TEACHER"
                ? "bg-primary-container text-on-primary-container shadow-sm"
                : "text-on-surface-variant hover:bg-surface-container-high"
            }`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
            Teacher
          </button>
          <button
            type="button"
            onClick={() => setRole("STUDENT")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-full text-xs font-semibold transition-all ${
              role === "STUDENT"
                ? "bg-primary-container text-on-primary-container shadow-sm"
                : "text-on-surface-variant hover:bg-surface-container-high"
            }`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
            Student
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          {/* Full Name */}
          <div className="group md:col-span-2">
            <label htmlFor="signup-name" className="block text-[0.65rem] font-bold uppercase tracking-[0.1em] text-on-surface-variant mb-1">
              Full Name <span className="text-error">*</span>
            </label>
            <input
              id="signup-name"
              type="text"
              name="name"
              required
              placeholder={role === "TEACHER" ? "E.g. Dr. Ananya Rao" : "E.g. Aarav Patel"}
              className="w-full px-0 py-2 text-sm transition-all duration-300 border-0 border-b bg-surface-container-highest border-outline-variant focus:ring-0 focus:border-primary text-on-surface placeholder:text-outline"
            />
          </div>

          {/* School */}
          <div className="md:col-span-2">
            <SearchableSchoolDropdown value={school} onChange={setSchool} />
          </div>

          {/* Board - Teacher Only */}
          {role === "TEACHER" && (
            <div className="group md:col-span-2">
              <label htmlFor="signup-board" className="block text-[0.65rem] font-bold uppercase tracking-[0.1em] text-on-surface-variant mb-1">
                Board <span className="text-error">*</span>
              </label>
              <select
                id="signup-board"
                value={board}
                onChange={(e) => setBoard(e.target.value)}
                required
                className="w-full px-0 py-2 text-sm transition-all duration-300 border-0 border-b cursor-pointer bg-surface-container-highest border-outline-variant focus:ring-0 focus:border-primary text-on-surface"
              >
                <option value="">Select Board</option>
                {boardOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Student-Only Fields */}
          {role === "STUDENT" && (
            <div className="grid grid-cols-3 gap-4 p-3 rounded-lg md:col-span-2 bg-surface-container-low">
              <div className="group">
                <label htmlFor="signup-class" className="block text-[0.6rem] font-bold uppercase tracking-[0.1em] text-on-surface-variant mb-1">
                  Class <span className="text-error">*</span>
                </label>
                <select
                  id="signup-class"
                  name="studentClass"
                  required
                  className="w-full px-0 py-2 text-xs transition-all duration-300 border-0 border-b cursor-pointer bg-surface-container-highest border-outline-variant focus:ring-0 focus:border-primary text-on-surface"
                >
                  <option value="">Select</option>
                  {Array.from({ length: 8 }, (_, i) => (
                    <option key={i + 5} value={String(i + 5)}>
                      Class {i + 5}
                    </option>
                  ))}
                </select>
              </div>
              <div className="group">
                <label htmlFor="signup-section" className="block text-[0.6rem] font-bold uppercase tracking-[0.1em] text-on-surface-variant mb-1">
                  Section <span className="text-error">*</span>
                </label>
                <input
                  id="signup-section"
                  type="text"
                  name="section"
                  required
                  placeholder="e.g. A"
                  maxLength={2}
                  className="w-full px-0 py-2 text-xs transition-all duration-300 border-0 border-b bg-surface-container-highest border-outline-variant focus:ring-0 focus:border-primary text-on-surface placeholder:text-outline"
                />
              </div>
              <div className="group">
                <label htmlFor="signup-roll" className="block text-[0.6rem] font-bold uppercase tracking-[0.1em] text-on-surface-variant mb-1">
                  Roll No <span className="text-error">*</span>
                </label>
                <input
                  id="signup-roll"
                  type="text"
                  name="rollNumber"
                  required
                  placeholder="e.g. 24"
                  className="w-full px-0 py-2 text-xs transition-all duration-300 border-0 border-b bg-surface-container-highest border-outline-variant focus:ring-0 focus:border-primary text-on-surface placeholder:text-outline"
                />
              </div>
            </div>
          )}

          {/* Phone */}
          <div className="group">
            <label htmlFor="signup-phone" className="block text-[0.65rem] font-bold uppercase tracking-[0.1em] text-on-surface-variant mb-1">
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
              className={`w-full bg-surface-container-highest border-0 border-b px-0 py-2 text-sm text-on-surface placeholder:text-outline transition-all duration-300 ${
                phoneError ? "border-error focus:border-error" : "border-outline-variant focus:border-primary"
              }`}
            />
            {phoneError && (
              <p className="mt-1 text-[0.6rem] text-error">{phoneError}</p>
            )}
          </div>

          {/* Email */}
          <div className="group">
            <label htmlFor="signup-email" className="block text-[0.65rem] font-bold uppercase tracking-[0.1em] text-on-surface-variant mb-1">
              Email Address
            </label>
            <input
              id="signup-email"
              type="email"
              name="email"
              placeholder={role === "TEACHER" ? "ananya@school.edu" : "aarav@student.edu"}
              className="w-full px-0 py-2 text-sm transition-all duration-300 border-0 border-b bg-surface-container-highest border-outline-variant focus:ring-0 focus:border-primary text-on-surface placeholder:text-outline"
            />
          </div>

          {/* Password */}
          <div className="group md:col-span-2">
            <label htmlFor="signup-password" className="block text-[0.65rem] font-bold uppercase tracking-[0.1em] text-on-surface-variant mb-1">
              Password <span className="text-error">*</span>
            </label>
            <div className="relative">
              <input
                id="signup-password"
                type={showPassword ? "text" : "password"}
                name="password"
                required
                placeholder="••••••••"
                className="w-full px-0 py-2 text-sm transition-all duration-300 border-0 border-b bg-surface-container-highest border-outline-variant focus:ring-0 focus:border-primary text-on-surface placeholder:text-outline pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-on-surface-variant hover:text-primary transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-3 px-6 font-bold text-xs tracking-wide rounded-lg shadow-md hover:shadow-xl active:scale-[0.98] transition-all duration-300 uppercase disabled:opacity-75 disabled:pointer-events-none"
          style={{ background: "linear-gradient(145deg, var(--color-primary), var(--color-primary-dim))", color: "var(--color-on-primary)" }}
        >
          {isPending ? (
            <Loader size="sm" color="currentColor" label="Creating Account…" />
          ) : (
            `Create ${role === "TEACHER" ? "Teacher" : "Student"} Account`
          )}
        </button>
      </form>
    </AuthShell>
  );
}
