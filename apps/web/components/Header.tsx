"use client";

import { Button } from "@inferpipe/ui/components/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@inferpipe/ui/components/sheet";
import { Menu, Zap } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

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

          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/docs"
              className={`text-sm transition-colors ${
                pathname === "/docs"
                  ? "font-medium text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Docs
            </Link>
            <Link
              href="/pricing"
              className={`text-sm transition-colors ${
                pathname === "/pricing"
                  ? "font-medium text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Pricing
            </Link>
            <ThemeToggle />
            <Button asChild>
              <a href="/app">Dashboard</a>
            </Button>
          </div>

          <div className="flex items-center md:hidden">
            <ThemeToggle />
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-2"
                  aria-label="Toggle menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 sm:w-80">
                <SheetTitle className="sr-only">Mobile navigation</SheetTitle>
                <div className="flex flex-col gap-6">
                  <Link
                    href="/docs"
                    onClick={() => setOpen(false)}
                    className={`text-base transition-colors ${
                      pathname === "/docs"
                        ? "font-medium text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Docs
                  </Link>
                  <Link
                    href="/pricing"
                    onClick={() => setOpen(false)}
                    className={`text-base transition-colors ${
                      pathname === "/pricing"
                        ? "font-medium text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Pricing
                  </Link>
                  <Button asChild onClick={() => setOpen(false)}>
                    <a href="/app">Dashboard</a>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
