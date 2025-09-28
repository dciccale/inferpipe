"use client";

import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="flex justify-end items-center p-4 gap-4 h-16 border-b">
      <SignedOut>
        <SignInButton>
          <Button variant="outline" size="sm">
            Sign In
          </Button>
        </SignInButton>
        <SignUpButton>
          <Button size="sm">
            Sign Up
          </Button>
        </SignUpButton>
      </SignedOut>
      <SignedIn>
        <UserButton afterSignOutUrl="/app" />
      </SignedIn>
    </header>
  );
}
