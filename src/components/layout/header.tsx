import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Trophy } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="mr-4 flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <Trophy className="w-8 h-8 text-primary" />
            <span className="font-bold text-lg">ScoreCast</span>
          </Link>
        </div>
        <nav className="flex items-center gap-4">
           <Link href="/login" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">Login</Link>
           <Button asChild>
            <Link href="#">Sign Up</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
