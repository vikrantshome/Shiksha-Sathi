"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getStudentIdentity, saveStudentIdentity } from "@/lib/api/students";
import { api } from "@/lib/api";
import { User, StudentIdentity } from "@/lib/api/types";
import StudentEditProfileForm from "./StudentEditProfileForm";

/* ── Icons ── */
const IconUser = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const IconMail = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);
const IconPhone = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.11 10 19.79 19.79 0 0 1 1.08 1.4 2 2 0 0 1 3.05 0h3a2 2 0 0 1 2 1.72c.12.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L7.09 7.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.58 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);
const IconSchool = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 1 2 3 6 3s6-2 6-3v-5"/>
  </svg>
);
const IconClass = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
    <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
  </svg>
);
const IconHash = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/>
    <line x1="10" x2="8" y1="3" y2="21"/><line x1="16" x2="14" y1="3" y2="21"/>
  </svg>
);
const IconShield = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const IconCalendar = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/>
    <line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>
  </svg>
);
const IconSection = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18M3 12h18M3 18h18"/>
  </svg>
);
const IconEdit = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

/* ── Field Row ── */
function ProfileField({
  icon,
  label,
  value,
  mono = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | undefined | null;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 py-4 border-b border-[#e5e2de] last:border-b-0">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
        style={{ background: "#f0ede9", color: "#12423f" }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[0.625rem] font-bold uppercase tracking-[0.08em] text-[#707977] m-0">
          {label}
        </p>
        <p
          className={`text-sm text-[#1c1c1a] m-0 mt-0.5 break-all ${mono ? "font-mono text-xs tracking-wide" : "font-medium"}`}
        >
          {value || (
            <span className="text-[#aaa] font-normal italic">Not set</span>
          )}
        </p>
      </div>
    </div>
  );
}

/* ── Section Card ── */
function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-[#e5e2de] overflow-hidden">
      <div className="px-6 py-4 border-b border-[#f0ede9]">
        <h2 className="text-xs font-black uppercase tracking-[0.12em] text-[#12423f] m-0">
          {title}
        </h2>
      </div>
      <div className="px-6">{children}</div>
    </div>
  );
}

/* ── Skeleton ── */
function Skeleton() {
  return (
    <div className="max-w-4xl mx-auto w-full pb-12 animate-pulse">
      <div className="h-6 w-32 bg-[#e5e2de] rounded mb-2" />
      <div className="h-9 w-48 bg-[#e5e2de] rounded mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
        <div className="h-28 bg-[#ddd] rounded-2xl md:col-span-2" />
        <div className="h-48 bg-[#e5e2de] rounded-2xl" />
        <div className="h-64 bg-[#e5e2de] rounded-2xl" />
        <div className="h-40 bg-[#e5e2de] rounded-2xl" />
      </div>
    </div>
  );
}

export default function StudentProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [identity, setIdentity] = useState<StudentIdentity | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const storedIdentity = getStudentIdentity();
    setIdentity(storedIdentity);

    api.auth
      .getMe()
      .then((u) => {
        setUser(u);
      })
      .catch((err: { status?: number }) => {
        if (err.status === 401) router.replace("/student/login");
      })
      .finally(() => setLoading(false));
  }, [router]);

  const handleUpdateSuccess = (updatedUser: User) => {
    setUser(updatedUser);
    setIsEditing(false);
    
    // Also update identity if roll number/class/section changed or name changed
    if (identity) {
      const newIdentity: StudentIdentity = {
        ...identity,
        studentName: updatedUser.name,
        rollNumber: updatedUser.rollNumber || identity.rollNumber,
        class: updatedUser.studentClass || identity.class,
        section: updatedUser.section || identity.section,
        school: updatedUser.school || identity.school,
      };
      setIdentity(newIdentity);
      saveStudentIdentity(newIdentity);
    }
  };

  if (loading) return <Skeleton />;

  /* ── Derived values ── */
  const displayName =
    identity?.studentName || user?.name || "Unknown Student";
  const initials = displayName
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const school    = identity?.school || user?.school || null;
  const classVal  = identity?.class  || user?.studentClass || null;
  const section   = identity?.section || user?.section || null;
  const email     = user?.email || null;
  const phone     = user?.phone || null;
  const rollNo    = user?.rollNumber || null;
  const birthDate = user?.birthDate || null;
  const userId    = user?.id || null;

  const classDisplay =
    classVal && section
      ? `Class ${classVal} — Section ${section}`
      : classVal
      ? `Class ${classVal}`
      : null;

  return (
    <div className="max-w-4xl pb-12 mx-auto w-full">
      {/* ═══ Page Header ═══ */}
      <header className="mb-6 md:mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <span className="block text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-[#12423f] mb-1">
            Account
          </span>
          <h1 className="text-xl sm:text-2xl md:text-[1.75rem] font-extrabold tracking-tight text-[#12423f] m-0">
            My Profile
          </h1>
          <p className="text-xs sm:text-sm mt-1 text-[#404847] max-w-md">
            Your personal, academic, and account details on Shiksha Sathi.
          </p>
        </div>
        
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all hover:shadow-md active:scale-95 text-white shadow-sm"
            style={{ background: "#12423f" }}
          >
            <IconEdit /> Edit Profile
          </button>
        )}
      </header>

      {isEditing && user ? (
        <div className="max-w-2xl">
          <StudentEditProfileForm 
            user={user} 
            identity={identity}
            onSuccess={handleUpdateSuccess} 
            onCancel={() => setIsEditing(false)} 
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
          {/* ── Avatar + Name Banner ── */}
          <div
            className="rounded-2xl p-6 flex items-center gap-5 md:col-span-2"
            style={{
              background:
                "linear-gradient(135deg, #12423f 0%, #1a5c58 100%)",
            }}
          >
            <div
              className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center shrink-0 text-xl md:text-2xl font-black"
              style={{
                background: "rgba(255,255,255,0.15)",
                color: "#fff",
                letterSpacing: "-0.02em",
              }}
            >
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-base md:text-lg font-extrabold text-white m-0 leading-tight truncate">
                {displayName}
              </p>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span
                  className="inline-flex items-center gap-1 text-[0.6rem] font-bold uppercase tracking-[0.08em] px-2 py-0.5 rounded-full"
                  style={{
                    background: "rgba(255,255,255,0.15)",
                    color: "#bcece6",
                  }}
                >
                  <IconShield /> Student
                </span>
                {classDisplay && (
                  <span
                    className="inline-flex items-center gap-1 text-[0.6rem] font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      background: "rgba(188,236,230,0.18)",
                      color: "rgba(255,255,255,0.8)",
                    }}
                  >
                    {classDisplay}
                  </span>
                )}
              </div>
              {school && (
                <p className="text-[0.7rem] text-white/60 mt-1.5 m-0 truncate">
                  {school}
                </p>
              )}
            </div>
          </div>

          {/* ── Contact Details ── */}
          <SectionCard title="Contact Details">
            <ProfileField icon={<IconUser />}  label="Full Name"    value={displayName} />
            <ProfileField icon={<IconMail />}  label="Email"        value={email} />
            <ProfileField icon={<IconPhone />} label="Phone Number" value={phone} />
          </SectionCard>

          {/* ── Academic Details ── */}
          <SectionCard title="Academic Details">
            <ProfileField icon={<IconSchool />}  label="School / Institution" value={school} />
            <ProfileField icon={<IconClass />}   label="Class / Grade"        value={classVal ? `Class ${classVal}` : null} />
            <ProfileField icon={<IconSection />} label="Section / Division"   value={section} />
            <ProfileField icon={<IconHash />}    label="Roll Number"          value={rollNo} />
            <ProfileField icon={<IconCalendar />}label="Date of Birth"        value={birthDate} />
          </SectionCard>

          {/* ── Account Info ── */}
          <SectionCard title="Account Info">
            <ProfileField icon={<IconShield />} label="Role"       value="Student" />
            <ProfileField icon={<IconHash />}   label="Account ID" value={userId} mono />
          </SectionCard>

          <p className="text-[0.7rem] text-[#707977] text-center md:col-span-2 mt-2">
            To update academic details like school or class, contact your school administrator or teacher.
          </p>
        </div>
      )}
    </div>
  );
}
