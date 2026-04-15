"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { getCookie } from "cookies-next";
import { PencilSquareIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface Student {
  id: string;
  name: string;
  phone?: string;
  rollNumber?: string;
  birthDate?: string;
}

interface EditStudentFormProps {
  student: Student;
}

export default function EditStudentForm({ student }: EditStudentFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpdate(formData: FormData) {
    setLoading(true);
    setError(null);
    const rollNumber = formData.get("rollNumber") as string;
    const birthDate = formData.get("birthDate") as string;
    
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
    const token = getCookie('auth-token') as string | undefined;

    try {
      const res = await fetch(`${API_URL}/classes/students/${student.id}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          name: formData.get("name"),
          phone: formData.get("phone"),
          rollNumber: rollNumber && rollNumber.trim() ? rollNumber.trim() : null,
          birthDate: birthDate && birthDate.trim() ? birthDate.trim() : null,
        }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || data.message || "Failed to update student");
        return;
      }
      
      router.refresh();
      router.push(window.location.pathname);
    } catch (error) {
      console.error("Failed to update student:", error);
      setError("Failed to update student");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-[#12423f] to-[#2d5a56] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
              <PencilSquareIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white m-0 font-manrope">Edit Student</h3>
              <p className="text-xs text-white/70 m-0">Update student details</p>
            </div>
          </div>
        </div>
        
        <form action={handleUpdate} className="p-6 space-y-5">
          {error && (
            <div className="bg-[#ffdad6] border border-[#ba1a1a]/20 text-[#ba1a1a] text-sm px-4 py-3 rounded-lg flex items-center gap-2">
              <span className="text-lg">⚠</span>
              {error}
            </div>
          )}
          
          <div className="relative">
            <label className="block text-xs font-semibold text-[#404847] mb-1.5 uppercase tracking-wide">Name</label>
            <input
              name="name"
              defaultValue={student.name}
              required
              className="w-full bg-[#f6f3ef] border-none rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#12423f] transition-all duration-200 shadow-sm"
            />
          </div>
          
          <div className="relative">
            <label className="block text-xs font-semibold text-[#404847] mb-1.5 uppercase tracking-wide">Phone</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#707977] text-sm font-medium">+91</span>
              <input
                name="phone"
                defaultValue={student.phone}
                required
                maxLength={10}
                className="w-full bg-[#f6f3ef] border-none rounded-lg pl-14 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-[#12423f] transition-all duration-200 shadow-sm"
              />
            </div>
          </div>

          <div className="relative">
            <label className="block text-xs font-semibold text-[#404847] mb-1.5 uppercase tracking-wide">Date of Birth</label>
            <input
              name="birthDate"
              defaultValue={student.birthDate || ""}
              placeholder="DD-MM-YYYY"
              pattern="\d{2}-\d{2}-\d{4}"
              className="w-full bg-[#f6f3ef] border-none rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#12423f] transition-all duration-200 shadow-sm"
            />
          </div>
          
          <div className="relative">
            <label className="block text-xs font-semibold text-[#404847] mb-1.5 uppercase tracking-wide">Roll Number</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#707977]">#</span>
              <input
                name="rollNumber"
                defaultValue={student.rollNumber || ""}
                placeholder="e.g. 1, 2, 3..."
                className="w-full bg-[#f6f3ef] border-none rounded-lg pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-[#12423f] transition-all duration-200 shadow-sm"
              />
            </div>
          </div>
          
          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={() => router.push(window.location.pathname)}
              className="flex-1 py-2.5 rounded-lg border border-[#c0c8c6] text-[#404847] font-medium text-sm hover:bg-[#f6f3ef] transition-all duration-200 flex items-center justify-center gap-2"
            >
              <XMarkIcon className="w-4 h-4" />
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-[#12423f] to-[#2d5a56] text-white font-medium text-sm hover:opacity-90 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
