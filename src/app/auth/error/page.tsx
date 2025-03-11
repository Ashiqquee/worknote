import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-600">Authentication Error</h1>
          <p className="mt-2 text-gray-600">
            There was a problem authenticating your account. This might be due to:
          </p>
          <ul className="mt-4 text-left text-gray-600 space-y-2">
            <li>• Invalid credentials</li>
            <li>• Session expired</li>
            <li>• Server configuration issues</li>
          </ul>
        </div>

        <div className="mt-8 space-y-4">
          <Button
            className="w-full"
            asChild
          >
            <Link href="/auth/signin">
              Try Again
            </Link>
          </Button>
          
          <Button
            variant="outline"
            className="w-full"
            asChild
          >
            <Link href="/">
              Go to Home
            </Link>
          </Button>
        </div>

        <p className="mt-4 text-center text-sm text-gray-500">
          If the problem persists, please contact your system administrator
        </p>
      </div>
    </div>
  );
}
