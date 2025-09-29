"use client";

import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { usePathname } from "next/navigation";

export function Header() {
  const pathname = usePathname();

  // Don't render header on builder pages since they have their own header
  if (pathname?.startsWith("/app/builder")) {
    return null;
  }

  return (
    <header className="flex justify-end items-center p-4 gap-4 h-16 border-b">
      <SignedOut>
        <SignInButton>
          <Button size="sm" variant="ghost">Sign In</Button>
        </SignInButton>
        <SignUpButton>
          <Button size="sm">Sign Up</Button>
        </SignUpButton>
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
      <ThemeToggle />
    </header>
  );
}
