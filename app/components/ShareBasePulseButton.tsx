"use client";

import { useEffect, useState } from "react";
import sdk from "@farcaster/miniapp-sdk";

export function ShareBasePulseButton() {
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    sdk.actions.ready().catch(() => undefined);
  }, []);

  async function shareBasePulse() {
    setIsSharing(true);

    try {
      const appUrl =
        process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin;

      await sdk.actions.composeCast({
        text: "Tracking live Base gas with Base Pulse ⚡",
        embeds: [appUrl],
      });
    } finally {
      setIsSharing(false);
    }
  }

  return (
    <button
      className="mt-3 w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-70"
      disabled={isSharing}
      onClick={shareBasePulse}
      type="button"
    >
      {isSharing ? "Opening composer..." : "Share Base Pulse"}
    </button>
  );
}