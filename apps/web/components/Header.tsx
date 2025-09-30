"use client";

import { Button } from "@inferpipe/ui/components/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Zap } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Header() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">inferpipe</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              href="/docs"
              className={`text-sm transition-colors ${
                pathname === "/docs"
                  ? "font-medium text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}>
              Docs
            </Link>
            <Link
              href="/pricing"
              className={`text-sm transition-colors ${
                pathname === "/pricing"
                  ? "font-medium text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}>
              Pricing
            </Link>
            <ThemeToggle />
            <Button asChild>
              <a href="/app">Dashboard</a>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
