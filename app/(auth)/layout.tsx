import Link from "next/link";
import { GraduationCap } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Link href="/" className="flex items-center gap-2 mb-8 text-2xl font-bold text-primary">
        <GraduationCap className="h-8 w-8" />
        StatMaster
      </Link>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
