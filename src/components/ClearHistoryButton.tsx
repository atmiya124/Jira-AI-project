"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ClearHistoryButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (!window.confirm("Clear all saved analyses? This cannot be undone.")) return;

    setLoading(true);
    try {
      await fetch("/api/history", { method: "DELETE" });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="text-xs font-medium text-zinc-500 transition-colors hover:text-red-600 disabled:opacity-50"
    >
      {loading ? "Clearing…" : "Clear history"}
    </button>
  );
}
