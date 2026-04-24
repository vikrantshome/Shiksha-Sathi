"use client";

import { useState, useTransition } from "react";
import { api } from "@/lib/api";
import { User, StudentIdentity } from "@/lib/api/types";
import Loader from "@/components/Loader";
import SearchableSchoolDropdown from "@/components/SearchableSchoolDropdown";

/* ── Icons ── */
const IconUser = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const IconMail = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);
const IconPhone = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.11 10 19.79 19.79 0 0 1 1.08 1.4 2 2 0 0 1 3.05 0h3a2 2 0 0 1 2 1.72c.12.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L7.09 7.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.58 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);
const IconCalendar = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/>
    <line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>
  </svg>
);
const IconHash = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/>
    <line x1="10" x2="8" y1="3" y2="21"/><line x1="16" x2="14" y1="3" y2="21"/>
  </svg>
);
const IconClass = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
    <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
  </svg>
);
const IconSection = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18M3 12h18M3 18h18"/>
  </svg>
);
const IconSchool = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 1 2 3 6 3s6-2 6-3v-5"/>
  </svg>
);

interface EditProfileFormProps {
  user: User;
  identity: StudentIdentity | null;
  onSuccess: (updatedUser: User) => void;
  onCancel: () => void;
}

export default function StudentEditProfileForm({ user, identity, onSuccess, onCancel }: EditProfileFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const initialName = identity?.studentName || user.name || "";
  const initialSchool = identity?.school || user.school || "";
  const initialClass = identity?.class || user.studentClass || "";
  const initialSection = identity?.section || user.section || "";
  const initialRollNumber = identity?.rollNumber || user.rollNumber || "";

  const [school, setSchool] = useState(initialSchool);

  const handleSubmit = (formData: FormData) => {
    setError("");
    startTransition(async () => {
      try {
        const name = formData.get("name") as string;
        const email = formData.get("email") as string;
        const phone = formData.get("phone") as string;
        const birthDate = formData.get("birthDate") as string;
        const rollNumber = formData.get("rollNumber") as string;
        const studentClass = formData.get("studentClass") as string;
        const section = formData.get("section") as string;
        const submittedSchool = formData.get("school") as string;

        const updated = await api.students.updateProfile({
          name,
          email: email || undefined,
          phone,
          birthDate: birthDate || undefined,
          rollNumber: rollNumber || undefined,
          studentClass: studentClass || undefined,
          section: section || undefined,
          school: submittedSchool || undefined,
        });

        onSuccess(updated);
      } catch (err) {
        console.error("Profile update failed:", err);
        const errorMessage = err instanceof Error ? err.message : "Failed to update profile. Please check your details and try again.";
        setError(errorMessage);
      }
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-[#e5e2de] overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-[#f0ede9] flex justify-between items-center bg-[#fcfbf9]">
        <h2 className="text-xs font-black uppercase tracking-[0.12em] text-[#12423f] m-0">
          Edit Profile
        </h2>
        <button 
          onClick={onCancel}
          className="text-[0.7rem] font-bold uppercase tracking-wider text-[#707977] hover:text-[#12423f] transition-colors bg-transparent border-none cursor-pointer"
        >
          Cancel
        </button>
      </div>

      <form action={handleSubmit} className="p-6 space-y-6">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-xs font-medium">
            {error}
          </div>
        )}

        {/* ── Section: Personal ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-[0.625rem] font-bold uppercase tracking-[0.08em] text-[#707977]">
              <IconUser /> Full Name
            </label>
            <input
              name="name"
              required
              defaultValue={initialName}
              className="w-full px-4 py-2.5 rounded-lg border border-[#e5e2de] text-sm focus:outline-none focus:border-[#12423f] focus:ring-1 focus:ring-[#12423f] transition-all bg-[#fcfbf9]"
              placeholder="Enter your full name"
            />
          </div>

          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-[0.625rem] font-bold uppercase tracking-[0.08em] text-[#707977]">
              <IconCalendar /> Date of Birth
            </label>
            <input
              name="birthDate"
              type="date"
              defaultValue={user.birthDate || ""}
              className="w-full px-4 py-2.5 rounded-lg border border-[#e5e2de] text-sm focus:outline-none focus:border-[#12423f] focus:ring-1 focus:ring-[#12423f] transition-all bg-[#fcfbf9]"
            />
          </div>
        </div>

        {/* ── Section: Contact ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-[0.625rem] font-bold uppercase tracking-[0.08em] text-[#707977]">
              <IconMail /> Email Address
            </label>
            <input
              name="email"
              type="email"
              defaultValue={user.email || ""}
              className="w-full px-4 py-2.5 rounded-lg border border-[#e5e2de] text-sm focus:outline-none focus:border-[#12423f] focus:ring-1 focus:ring-[#12423f] transition-all bg-[#fcfbf9]"
              placeholder="Enter your email address"
            />
          </div>

          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-[0.625rem] font-bold uppercase tracking-[0.08em] text-[#707977]">
              <IconPhone /> Phone Number
            </label>
            <input
              name="phone"
              required
              defaultValue={user.phone}
              className="w-full px-4 py-2.5 rounded-lg border border-[#e5e2de] text-sm focus:outline-none focus:border-[#12423f] focus:ring-1 focus:ring-[#12423f] transition-all bg-[#fcfbf9]"
              placeholder="Enter your phone number"
            />
          </div>
        </div>

        {/* ── Section: Academic ── */}
        <div className="space-y-6">
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-[0.625rem] font-bold uppercase tracking-[0.08em] text-[#707977]">
              <IconSchool /> School / Institution
            </label>
            <SearchableSchoolDropdown value={school} onChange={setSchool} />
            <input type="hidden" name="school" value={school} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-[0.625rem] font-bold uppercase tracking-[0.08em] text-[#707977]">
                <IconClass /> Class
              </label>
              <input
                name="studentClass"
                defaultValue={initialClass}
                className="w-full px-4 py-2.5 rounded-lg border border-[#e5e2de] text-sm focus:outline-none focus:border-[#12423f] focus:ring-1 focus:ring-[#12423f] transition-all bg-[#fcfbf9]"
                placeholder="e.g. 8"
              />
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-[0.625rem] font-bold uppercase tracking-[0.08em] text-[#707977]">
                <IconSection /> Section
              </label>
              <input
                name="section"
                defaultValue={initialSection}
                className="w-full px-4 py-2.5 rounded-lg border border-[#e5e2de] text-sm focus:outline-none focus:border-[#12423f] focus:ring-1 focus:ring-[#12423f] transition-all bg-[#fcfbf9]"
                placeholder="e.g. A"
              />
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-[0.625rem] font-bold uppercase tracking-[0.08em] text-[#707977]">
                <IconHash /> Roll Number
              </label>
              <input
                name="rollNumber"
                defaultValue={initialRollNumber}
                className="w-full px-4 py-2.5 rounded-lg border border-[#e5e2de] text-sm focus:outline-none focus:border-[#12423f] focus:ring-1 focus:ring-[#12423f] transition-all bg-[#fcfbf9]"
                placeholder="e.g. 101"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-lg border border-[#e5e2de] text-sm font-bold text-[#707977] hover:bg-[#fcfbf9] transition-all cursor-pointer bg-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="flex-[2] px-4 py-2.5 rounded-lg font-bold text-white shadow-sm transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            style={{ background: "linear-gradient(135deg, #12423f 0%, #1a5c58 100%)" }}
          >
            {isPending ? <Loader size="sm" color="white" /> : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
