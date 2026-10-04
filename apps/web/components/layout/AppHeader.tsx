"use client";

import Link from "next/link";
import { useContext } from "react";

import { Progress } from "@/components/ui/progress";
import { AppHeaderContext } from "@/store/components/AppHeader";
import Image from "next/image";

export function Header() {
  const { dailyLimit, remaining } = useContext(AppHeaderContext);

  const safeRemaining = Math.max(0, Math.min(remaining, dailyLimit));
  const used = Math.max(0, dailyLimit - safeRemaining);

  const percentage =
    dailyLimit > 0 ? (used / dailyLimit) * 100 : 0;

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        {/* Logo */}
        <Link
          href="/"
          className="group flex shrink-0 items-center gap-2.5"
        >
          <div className="flex size-9 items-center justify-center transition-transform duration-200 group-hover:scale-105">
            <Image src={"/icon-192.png"} width={34} height={34} alt="logo" />
          </div>

          <span className="hidden text-sm font-semibold tracking-tight sm:inline">
            CWAD Image
          </span>
        </Link>

        {/* Usage */}
        <div className="ml-auto">
          <div className="flex w-48 items-center gap-3 px-3.5 py-2  transition-shadow duration-200 hover:shadow-md sm:w-56">
            <div className="min-w-0 flex-1 space-y-1.5">
              {/* Header */}
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-medium text-muted-foreground">
                  Daily use
                </span>

                <span className="shrink-0 text-xs font-semibold tabular-nums">
                  {used}/{dailyLimit}
                </span>
              </div>

              {/* Progress */}
              <Progress
                value={percentage}
                className="h-1.5"
              />

              {/* Remaining */}
              <p className="truncate text-[11px] leading-none text-muted-foreground">
                {safeRemaining} remaining today
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}