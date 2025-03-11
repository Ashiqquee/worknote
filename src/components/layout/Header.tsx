import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="border-b">
      <div className="flex h-16 items-center px-4 container mx-auto">
        <Link href="/" className="font-bold text-xl">
          WorkNotes
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link href="/" passHref>
            <Button variant="ghost">Dashboard</Button>
          </Link>
          <Link href="/notes" passHref>
            <Button variant="ghost">Notes</Button>
          </Link>
          <Link href="/reports" passHref>
            <Button variant="ghost">Reports</Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
