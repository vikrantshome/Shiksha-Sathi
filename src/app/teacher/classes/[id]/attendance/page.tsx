"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { ClassItem, User, AttendanceRecord } from "@/lib/api/types";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function AttendancePage() {
  const { id } = useParams() as { id: string };
  const [classData, setClassData] = useState<ClassItem | null>(null);
  const [students, setStudents] = useState<User[]>([]);
  const [attendance, setAttendance] = useState<Record<string, string>>({}); // studentId -> status
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [cls, stds, att] = await Promise.all([
          api.classes.getClass(id),
          api.classes.getStudents(id),
          api.classes.getAttendance(id, date)
        ]);
        
        setClassData(cls);
        setStudents(stds);
        
        // Map existing attendance records
        const attMap: Record<string, string> = {};
        att.forEach(record => {
          attMap[record.studentId] = record.status;
        });
        setAttendance(attMap);
      } catch (error) {
        console.error("Failed to load attendance data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id, date]);

  const handleStatusChange = async (studentId: string, status: string) => {
    setSaving(studentId);
    try {
      await api.classes.markAttendance(id, studentId, date, status);
      setAttendance(prev => ({ ...prev, [studentId]: status }));
    } catch (error) {
      console.error("Failed to mark attendance:", error);
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!classData) return <div>Class not found</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <nav className="text-sm font-medium text-gray-500 mb-2">
            <Link href="/teacher/classes" className="hover:text-blue-600 transition-colors">Classes</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">{classData.name}</span>
          </nav>
          <h1 className="text-2xl font-bold text-gray-900">Attendance Register</h1>
          <p className="text-gray-500">{classData.section} • {students.length} Students</p>
        </div>

        <div className="bg-white p-2 rounded-lg border border-gray-200 shadow-sm flex items-center gap-2">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2">Select Date</label>
          <input 
            type="date" 
            value={date} 
            onChange={(e) => setDate(e.target.value)}
            className="outline-none text-gray-900 font-medium px-2 py-1"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Student Name</th>
              <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {students.map((student) => {
              const currentStatus = attendance[student.id];
              return (
                <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs mr-3">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{student.name}</div>
                        <div className="text-xs text-gray-500">{student.email}</div>
                      </div>
                      {saving === student.id && (
                        <span className="ml-3 text-[10px] text-blue-500 animate-pulse font-bold uppercase tracking-tighter">Saving...</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex justify-center gap-2">
                      <button 
                        onClick={() => handleStatusChange(student.id, 'PRESENT')}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                          currentStatus === 'PRESENT' 
                          ? 'bg-green-600 text-white shadow-lg shadow-green-200 scale-105' 
                          : 'bg-green-50 text-green-700 hover:bg-green-100'
                        }`}
                      >
                        Present
                      </button>
                      <button 
                        onClick={() => handleStatusChange(student.id, 'ABSENT')}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                          currentStatus === 'ABSENT' 
                          ? 'bg-red-600 text-white shadow-lg shadow-red-200 scale-105' 
                          : 'bg-red-50 text-red-700 hover:bg-red-100'
                        }`}
                      >
                        Absent
                      </button>
                      <button 
                        onClick={() => handleStatusChange(student.id, 'LATE')}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                          currentStatus === 'LATE' 
                          ? 'bg-amber-600 text-white shadow-lg shadow-amber-200 scale-105' 
                          : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                        }`}
                      >
                        Late
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
