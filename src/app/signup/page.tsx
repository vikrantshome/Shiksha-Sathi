"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/api/auth";
import { saveStudentIdentity } from "@/lib/api/students";
import { trackEvent } from "@/lib/analytics";
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
  const [board, setBoard] = useState("CBSE");
  const [boardOther, setBoardOther] = useState("");
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const boardOptions = ["CBSE", "ICSE", "State Board", "IB", "IGCSE", "Other"];

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
    if (role === "TEACHER" && board === "Other" && !boardOther.trim()) {
      setError("Please enter your board name");
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
        board: role === "TEACHER" ? (board === "Other" ? boardOther : board) : undefined,
        rollNumber: role === "STUDENT" ? rollNumber : undefined,
        studentClass: role === "STUDENT" ? studentClass : undefined,
        section: role === "STUDENT" ? section : undefined,
        role,
      });

      // Set cookie using native document.cookie for reliable client-side handling
      document.cookie = `auth-token=${response.token}; Path=/; Max-Age=${30 * 24 * 60 * 60}; SameSite=Lax`;

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
        {/* Role Toggle — M3 Segmented Button */}
        <div className="flex gap-2 p-1 bg-surface-container rounded-full">
          <button
            type="button"
            onClick={() => setRole("TEACHER")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-full text-sm font-semibold transition-all ${
              role === "TEACHER"
                ? "bg-primary-container text-on-primary-container shadow-sm"
                : "text-on-surface-variant hover:bg-surface-container-high"
            }`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
            Teacher
          </button>
          <button
            type="button"
            onClick={() => setRole("STUDENT")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-full text-sm font-semibold transition-all ${
              role === "STUDENT"
                ? "bg-primary-container text-on-primary-container shadow-sm"
                : "text-on-surface-variant hover:bg-surface-container-high"
            }`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
            Student
          </button>
        </div>

        {/* Full Name */}
        <div className="group">
          <label htmlFor="signup-name" className="block text-[0.75rem] font-medium uppercase tracking-[0.05em] text-on-surface-variant mb-2">
            Full Name <span className="text-error">*</span>
          </label>
          <input
            id="signup-name"
            type="text"
            name="name"
            required
            placeholder={role === "TEACHER" ? "E.g. Dr. Ananya Rao" : "E.g. Aarav Patel"}
            className="w-full bg-surface-container-highest border-0 border-b border-outline-variant focus:ring-0 focus:border-primary px-0 py-3 text-on-surface placeholder:text-outline transition-all duration-300"
          />
        </div>

        {/* School */}
        <SearchableSchoolDropdown value={school} onChange={setSchool} />

        {/* Board - Teacher Only */}
        {role === "TEACHER" && (
          <div className="group">
            <label className="block text-[0.75rem] font-medium uppercase tracking-[0.05em] text-on-surface-variant mb-2">
              Board <span className="text-error">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {boardOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setBoard(option)}
                  className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all cursor-pointer ${
                    board === option
                      ? "bg-secondary-container text-primary font-semibold"
                      : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
            {board === "Other" && (
              <input
                type="text"
                value={boardOther}
                onChange={(e) => setBoardOther(e.target.value)}
                placeholder="Enter your board name"
                className="w-full mt-3 bg-surface-container-highest border-0 border-b border-outline-variant focus:ring-0 focus:border-primary px-0 py-3 text-on-surface placeholder:text-outline transition-all duration-300"
              />
            )}
          </div>
        )}

        {/* Student-Only Fields */}
        {role === "STUDENT" && (
          <div className="space-y-4 p-4 rounded-lg bg-surface-container-low">
            <p className="text-[0.75rem] font-medium uppercase tracking-[0.05em] text-on-surface-variant mb-2">
              Student Details
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="group">
                <label htmlFor="signup-class" className="block text-[0.75rem] font-medium uppercase tracking-[0.05em] text-on-surface-variant mb-2">
                  Class / Grade <span className="text-error">*</span>
                </label>
                <select
                  id="signup-class"
                  name="studentClass"
                  required
                  className="w-full bg-surface-container-highest border-0 border-b border-outline-variant focus:ring-0 focus:border-primary px-0 py-3 text-on-surface cursor-pointer transition-all duration-300"
                >
                  <option value="">Select</option>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={String(i + 1)}>
                      Class {i + 1}
                    </option>
                  ))}
                </select>
              </div>
              <div className="group">
                <label htmlFor="signup-section" className="block text-[0.75rem] font-medium uppercase tracking-[0.05em] text-on-surface-variant mb-2">
                  Section <span className="text-error">*</span>
                </label>
                <input
                  id="signup-section"
                  type="text"
                  name="section"
                  required
                  placeholder="e.g. A"
                  maxLength={2}
                  className="w-full bg-surface-container-highest border-0 border-b border-outline-variant focus:ring-0 focus:border-primary px-0 py-3 text-on-surface placeholder:text-outline transition-all duration-300"
                />
              </div>
            </div>
            <div className="group">
              <label htmlFor="signup-roll" className="block text-[0.75rem] font-medium uppercase tracking-[0.05em] text-on-surface-variant mb-2">
                Roll Number <span className="text-error">*</span>
              </label>
              <input
                id="signup-roll"
                type="text"
                name="rollNumber"
                required
                placeholder="e.g. 24"
                className="w-full bg-surface-container-highest border-0 border-b border-outline-variant focus:ring-0 focus:border-primary px-0 py-3 text-on-surface placeholder:text-outline transition-all duration-300"
              />
            </div>
          </div>
        )}

        {/* Phone */}
        <div className="group">
          <label htmlFor="signup-phone" className="block text-[0.75rem] font-medium uppercase tracking-[0.05em] text-on-surface-variant mb-2">
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

        {/* Email */}
        <div className="group">
          <label htmlFor="signup-email" className="block text-[0.75rem] font-medium uppercase tracking-[0.05em] text-on-surface-variant mb-2">
            Email Address
          </label>
          <input
            id="signup-email"
            type="email"
            name="email"
            placeholder={role === "TEACHER" ? "ananya@school.edu" : "aarav@student.edu"}
            className="w-full bg-surface-container-highest border-0 border-b border-outline-variant focus:ring-0 focus:border-primary px-0 py-3 text-on-surface placeholder:text-outline transition-all duration-300"
          />
        </div>

        {/* Password */}
        <div className="group">
          <label htmlFor="signup-password" className="block text-[0.75rem] font-medium uppercase tracking-[0.05em] text-on-surface-variant mb-2">
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
          className="w-full mt-4 py-4 px-6 font-bold text-sm tracking-wide rounded-lg shadow-md hover:shadow-xl active:scale-[0.98] transition-all duration-300 uppercase disabled:opacity-75 disabled:pointer-events-none"
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
