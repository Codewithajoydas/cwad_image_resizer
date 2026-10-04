"use client";

import {
  createContext,
  PropsWithChildren,
  useEffect,
  useState,
} from "react";
import { DAILY_IMAGE_LIMIT } from "@/config/rate-limit";

type AppHeaderContextType = {
  dailyLimit: number;
  remaining: number;
  setRemaining: (value: number, resetAt?: number) => void;
};

export const AppHeaderContext =
  createContext<AppHeaderContextType>({
    dailyLimit: DAILY_IMAGE_LIMIT,
    remaining: DAILY_IMAGE_LIMIT,
    setRemaining: () => {},
  });

export function AppHeaderProvider({
  children,
}: PropsWithChildren) {
  const [remaining, setRemainingState] = useState(DAILY_IMAGE_LIMIT);
  const [resetAt, setResetAt] = useState<number | null>(null);

  useEffect(() => {
    const storedRemaining =
      localStorage.getItem("rateLimitRemaining");
    const storedResetAt = Number(
      localStorage.getItem("rateLimitResetAt"),
    );

    if (
      storedRemaining === null ||
      !Number.isFinite(storedResetAt) ||
      storedResetAt <= Date.now()
    ) {
      localStorage.removeItem("rateLimitRemaining");
      localStorage.removeItem("rateLimitResetAt");
      return;
    }

    const value = Number(storedRemaining);

    if (Number.isInteger(value) && value >= 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRemainingState(Math.min(value, DAILY_IMAGE_LIMIT));
      setResetAt(storedResetAt);
    } else {
      localStorage.removeItem("rateLimitRemaining");
      localStorage.removeItem("rateLimitResetAt");
    }
  }, []);

  const setRemaining = (value: number, nextResetAt?: number) => {
    if (!Number.isFinite(value)) return;

    const safeValue = Math.min(
      DAILY_IMAGE_LIMIT,
      Math.max(0, Math.floor(value)),
    );
    const safeResetAt =
      nextResetAt !== undefined && Number.isFinite(nextResetAt)
        ? nextResetAt < 1_000_000_000_000
          ? nextResetAt * 1000
          : nextResetAt
        : resetAt;

    setRemainingState(safeValue);
    setResetAt(safeResetAt);
    localStorage.setItem(
      "rateLimitRemaining",
      safeValue.toString(),
    );
    if (safeResetAt !== null) {
      localStorage.setItem(
        "rateLimitResetAt",
        safeResetAt.toString(),
      );
    }
  };

  useEffect(() => {
    if (resetAt === null) return;

    const timeout = window.setTimeout(() => {
      setRemainingState(DAILY_IMAGE_LIMIT);
      setResetAt(null);
      localStorage.removeItem("rateLimitRemaining");
      localStorage.removeItem("rateLimitResetAt");
    }, Math.max(0, resetAt - Date.now()));

    return () => window.clearTimeout(timeout);
  }, [resetAt]);

  return (
    <AppHeaderContext.Provider
      value={{
        dailyLimit: DAILY_IMAGE_LIMIT,
        remaining,
        setRemaining,
      }}
    >
      {children}
    </AppHeaderContext.Provider>
  );
}