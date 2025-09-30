"use client";

import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import { Button } from "@inferpipe/ui/components/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { usePathname } from "next/navigation";
import { Zap } from "lucide-react";
import Link from "next/link";

const marketingUrl = process.env.NEXT_PUBLIC_MARKETING_URL!;

export function Header() {
  const pathname = usePathname();

  // Don't render header on builder pages since they have their own header
  if (pathname?.startsWith("/app/builder")) {
    return null;
  }

  const isSignIn = pathname === "/sign-in";
  const isSignUp = pathname === "/sign-up";

  return (
    <header className="border-b border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <SignedOut>
            <div className="flex items-center space-x-4">
              <a href={marketingUrl} className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold">inferpipe</span>
              </a>
            </div>
          </SignedOut>
          <SignedIn>
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold">inferpipe</span>
              </Link>
            </div>
          </SignedIn>
          <div className="flex items-center space-x-4">
            <SignedOut>
              {isSignUp && (
                <SignInButton>
                  <Button size="sm">Sign In</Button>
                </SignInButton>
              )}
              {isSignIn && (
                <SignUpButton>
                  <Button size="sm">Sign Up</Button>
                </SignUpButton>
              )}
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
