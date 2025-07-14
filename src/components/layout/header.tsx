import Link from "next/link";
import Image from "next/image";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="mr-4 flex items-center">
          <Link href="/" className="flex items-center gap-4">
            <Image
              src="https://firebasestorage.googleapis.com/v0/b/egspec-website.appspot.com/o/egspec%2Fenergy-2025%2Fenergy-egspgoi-logo.png?alt=media&token=b401f7dd-c3ed-4a30-84b7-8222ba965250"
              alt="EGS Pillay Group of Institutions Logo"
              width={160}
              height={40}
              className="h-10 w-auto"
            />
             <Image
              src="https://firebasestorage.googleapis.com/v0/b/egspec-website.appspot.com/o/egspec%2Fenergy-2025%2Fenergy-logo.png?alt=media&token=49e75a63-950b-4ed2-a0f7-075ba54ace2e"
              alt="Energy 2025 Logo"
              width={100}
              height={40}
              className="h-10 w-auto"
            />
          </Link>
        </div>
        <nav className="flex items-center gap-4">
           <Link href="/login" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">Login</Link>
        </nav>
      </div>
    </header>
  );
}
