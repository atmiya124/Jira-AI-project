"use client";

import { useState } from "react";

export function PageFeedback() {
  const [choice, setChoice] = useState<"yes" | "no" | null>(null);

  if (choice) {
    return <p className="text-sm text-zinc-500">Thanks for your feedback!</p>;
  }

  return (
    <div className="flex flex-col gap-2 text-sm text-zinc-600">
      <span>Is this page helpful?</span>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setChoice("yes")}
          className="rounded-md border border-zinc-300 px-3 py-1 hover:bg-zinc-50"
        >
          Yes
        </button>
        <button
          type="button"
          onClick={() => setChoice("no")}
          className="rounded-md border border-zinc-300 px-3 py-1 hover:bg-zinc-50"
        >
          No
        </button>
      </div>
    </div>
  );
}
