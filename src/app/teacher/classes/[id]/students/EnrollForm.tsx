"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlusIcon, PencilSquareIcon } from "@heroicons/react/24/outline";

interface EnrollFormProps {
  classId: string;
}

export default function EnrollForm({ classId }: EnrollFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const phone = formData.get("studentPhone") as string;
    const rollNumber = formData.get("rollNumber") as string;

    if (!phone || phone.length !== 10 || !/^\d{10}$/.test(phone)) {
      setError("Phone number must be exactly 10 digits");
      setLoading(false);
      return;
    }

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
      const token = typeof window !== 'undefined' ? sessionStorage.getItem('shiksha-sathi-token') : null;
      const res = await fetch(`${API_URL}/classes/${classId}/enroll`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          name: formData.get("studentName"),
          phone: phone,
          rollNumber: rollNumber.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || data.message || "Failed to enroll student");
        return;
      }

      router.refresh();
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      setError("Failed to enroll student");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-surface-container-low p-5 md:p-6 lg:p-8 rounded-xl h-fit relative overflow-hidden" style={{ borderLeft: '4px solid #12423f' }}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#12423f] to-[#2d5a56] flex items-center justify-center shadow-md">
          <UserPlusIcon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#1c1c1a] m-0 font-manrope">Enroll Student</h2>
          <p className="text-xs text-[#404847] m-0">Add new student to class</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 relative z-10">
        {error && (
          <div className="bg-[#ffdad6] border border-[#ba1a1a]/20 text-[#ba1a1a] text-sm px-4 py-3 rounded-lg flex items-center gap-2">
            <span className="text-lg">⚠</span>
            {error}
          </div>
        )}

        <div className="relative">
          <label className="block text-xs font-semibold text-[#404847] mb-1.5 uppercase tracking-wide">
            Student Name <span className="text-[#ba1a1a]">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#707977]">
              <PencilSquareIcon className="w-4 h-4" />
            </span>
            <input
              name="studentName"
              required
              placeholder="Enter student full name"
              className="w-full bg-white border-none rounded-lg pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-[#12423f] focus:bg-white transition-all duration-200 shadow-sm"
            />
          </div>
        </div>

        <div className="relative">
          <label className="block text-xs font-semibold text-[#404847] mb-1.5 uppercase tracking-wide">
            Phone Number <span className="text-[#ba1a1a]">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#707977] text-sm font-medium">+91</span>
            <input
              name="studentPhone"
              required
              maxLength={10}
              pattern="[0-9]{10}"
              placeholder="9876543210"
              className="w-full bg-white border-none rounded-lg pl-14 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-[#12423f] focus:bg-white transition-all duration-200 shadow-sm"
            />
          </div>
        </div>

        <div className="relative">
          <label className="block text-xs font-semibold text-[#404847] mb-1.5 uppercase tracking-wide">
            Roll Number <span className="text-[#ba1a1a]">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#707977]">#</span>
            <input
              name="rollNumber"
              required
              placeholder="e.g. 1101"
              className="w-full bg-white border-none rounded-lg pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-[#12423f] focus:bg-white transition-all duration-200 shadow-sm"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-lg font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-200 bg-gradient-to-r from-[#12423f] to-[#2d5a56] text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed mt-2 font-manrope"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Enrolling...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <UserPlusIcon className="w-4 h-4" />
              Enroll Student
            </span>
          )}
        </button>
      </form>
    </div>
  );
}
