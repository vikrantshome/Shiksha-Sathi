import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-50">
      <main className="flex flex-col items-center max-w-2xl text-center space-y-8">
        <h1 className="text-4xl font-bold text-gray-900">
          Welcome to <span className="text-blue-600">Shiksha Sathi</span>
        </h1>
        <p className="text-xl text-gray-600">
          The teacher-first homework creation and submission platform.
          Create, share, and auto-grade assignments in minutes.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-8 w-full sm:w-auto">
          <Link
            href="/login"
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Teacher Login
          </Link>
          <Link
            href="/signup"
            className="px-8 py-3 bg-white text-blue-600 border border-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
          >
            Create Free Account
          </Link>
        </div>
      </main>
    </div>
  );
}
