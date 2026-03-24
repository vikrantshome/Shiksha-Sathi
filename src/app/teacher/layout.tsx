import { logoutAction } from "@/app/actions/auth";
import { AssignmentProvider } from "@/components/AssignmentContext";
import Link from "next/link";
import CartIcon from "@/components/CartIcon";

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AssignmentProvider>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Top Navigation */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center">
                <span className="text-xl font-bold text-blue-600">Shiksha Sathi</span>
                <nav className="ml-8 hidden md:flex space-x-4">
                  <Link href="/teacher/dashboard" className="text-gray-900 px-3 py-2 rounded-md font-medium hover:bg-gray-100">
                    Dashboard
                  </Link>
                  <Link href="/teacher/classes" className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md font-medium hover:bg-gray-100">
                    Classes
                  </Link>
                  <Link href="/teacher/question-bank" className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md font-medium hover:bg-gray-100">
                    Question Bank
                  </Link>
                </nav>
              </div>
              <div className="flex items-center space-x-4">
                <CartIcon />
                <Link href="/teacher/profile" className="text-sm font-medium text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-100">
                  Profile
                </Link>
                <form action={logoutAction}>
                  <button
                    type="submit"
                    className="text-sm font-medium text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-100"
                  >
                    Log out
                  </button>
                </form>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </AssignmentProvider>
  );
}
