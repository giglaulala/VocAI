"use client";

import type { Platform } from "./types";

export function PlatformBadge({ platform }: { platform: Platform }) {
  const isIg = platform === "instagram";
  return (
    <span
      className={
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border " +
        (isIg
          ? "border-fuchsia-200 bg-gradient-to-r from-fuchsia-50 via-pink-50 to-amber-50 text-fuchsia-700"
          : "border-blue-200 bg-blue-50 text-blue-700")
      }
    >
      {isIg ? "Instagram" : "Facebook"}
    </span>
  );
}

