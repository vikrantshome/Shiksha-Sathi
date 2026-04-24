import { redirect } from "next/navigation";
import { api } from "@/lib/api";
import { ProfileResponse, User } from "@/lib/api/types";

export const dynamic = "force-dynamic";

/* ── Icons ── */
const IconUser = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
const IconBook = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
  </svg>
);
const IconShield = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const IconHash = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/>
    <line x1="10" x2="8" y1="3" y2="21"/><line x1="16" x2="14" y1="3" y2="21"/>
  </svg>
);
const IconCheck = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5"/>
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
        style={{ background: "#f0ede9", color: "#536255" }}
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
          {value || <span className="text-[#aaa] font-normal italic">Not set</span>}
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

export default async function ProfilePage() {
  let profile: ProfileResponse | null = null;
  let user: User | null = null;

  try {
    // Run both fetches in parallel
    [user, profile] = await Promise.all([
      api.auth.getMe().catch(() => null),
      api.teachers.getProfile().catch(() => null),
    ]) as [User | null, ProfileResponse | null];

    if (!user) redirect("/login");
  } catch {
    redirect("/login");
  }

  /* ── Derived values ── */
  const displayName = profile?.name || user?.name || "Unknown";
  const initials = displayName
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const school = profile?.school || user?.school || null;
  const board  = profile?.board || null;
  const email  = user?.email || null;
  const phone  = user?.phone || null;
  const role   = user?.role
    ? String(user.role).charAt(0).toUpperCase() + String(user.role).slice(1).toLowerCase()
    : "Teacher";
  const userId = user?.id || null;

  return (
    <div className="max-w-4xl pb-12 mx-auto w-full">
      {/* ═══ Page Header ═══ */}
      <header className="mb-6 md:mb-8">
        <span className="block text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-[#12423f] mb-1">
          Account
        </span>
        <h1 className="text-xl sm:text-2xl md:text-[1.75rem] font-extrabold tracking-tight text-[#12423f] m-0">
          Your Profile
        </h1>
        <p className="text-xs sm:text-sm mt-1 text-[#404847] max-w-md">
          Your account details and school context as configured in Shiksha Sathi.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
        {/* ── Avatar + Name Banner ── */}
        <div
          className="rounded-2xl p-6 flex items-center gap-5 md:col-span-2"
          style={{ background: "linear-gradient(135deg, #12423f 0%, #1a5c58 100%)" }}
        >
          {/* Initials avatar */}
          <div
            className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center shrink-0 text-xl md:text-2xl font-black"
            style={{ background: "rgba(255,255,255,0.15)", color: "#fff", letterSpacing: "-0.02em" }}
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
                style={{ background: "rgba(255,255,255,0.15)", color: "#bcece6" }}
              >
                <IconShield /> {role}
              </span>
              <span
                className="inline-flex items-center gap-1 text-[0.6rem] font-bold uppercase tracking-[0.08em] px-2 py-0.5 rounded-full"
                style={{ background: "rgba(188,236,230,0.2)", color: "#bcece6" }}
              >
                <IconCheck /> Active
              </span>
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
          <ProfileField icon={<IconUser />}  label="Full Name"     value={displayName} />
          <ProfileField icon={<IconMail />}  label="Email Address" value={email} />
          <ProfileField icon={<IconPhone />} label="Phone Number"  value={phone} />
        </SectionCard>

        {/* ── School & Curriculum ── */}
        <SectionCard title="School & Curriculum">
          <ProfileField icon={<IconSchool />} label="School / Institution" value={school} />
          <ProfileField icon={<IconBook />}   label="Board / Curriculum"   value={board} />
        </SectionCard>

        {/* ── Account Info ── */}
        <SectionCard title="Account Info">
          <ProfileField icon={<IconShield />} label="Role"       value={role} />
          <ProfileField icon={<IconHash />}   label="Account ID" value={userId} mono />
        </SectionCard>

        {/* ── Update Profile CTA ── */}
        <p className="text-[0.7rem] text-[#707977] text-center md:col-span-2 mt-2">
          To update your name, school, or board — contact your Naviksha administrator.
        </p>
      </div>
    </div>
  );
}