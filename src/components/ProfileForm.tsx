"use client";

import { useTransition, useState } from "react";
import { updateProfileAction } from "@/app/actions/profile";

export default function ProfileForm({ initialData }: { initialData: { name?: string; school?: string; board?: string } | null }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      await updateProfileAction(formData);
      setMessage("Profile saved successfully.");
      setTimeout(() => setMessage(""), 3000);
    });
  };

  return (
    <form action={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-5">
      {message && <div className="p-3 bg-green-50 text-green-700 rounded-md border border-green-200">{message}</div>}
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
        <input 
          name="name" 
          defaultValue={initialData?.name}
          placeholder="e.g. Mr. Sharma" 
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">School Name</label>
        <input 
          name="school" 
          defaultValue={initialData?.school}
          placeholder="e.g. Delhi Public School" 
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Board / Curriculum</label>
        <input 
          name="board" 
          defaultValue={initialData?.board}
          placeholder="e.g. CBSE" 
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <button 
        type="submit" 
        disabled={isPending}
        className="w-full sm:w-auto bg-blue-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-blue-400"
      >
        {isPending ? "Saving..." : "Save Profile"}
      </button>
    </form>
  );
}
