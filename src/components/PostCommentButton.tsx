"use client";

import { useEffect, useRef, useState } from "react";
import { ErrorBanner } from "./ErrorBanner";

const SUCCESS_FLASH_MS = 1500;

export function PostCommentButton({
  analysisId,
  commentText,
  disabled,
  postedAt,
  onPosted,
}: {
  analysisId: string;
  commentText: string;
  disabled: boolean;
  postedAt: string | null;
  onPosted: (postedAt: string) => void;
}) {
  const [posting, setPosting] = useState(false);
  const [justPosted, setJustPosted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (flashTimer.current) clearTimeout(flashTimer.current);
    };
  }, []);

  async function handleClick() {
    if (!window.confirm("Post this comment to the real Jira ticket now?")) return;

    setPosting(true);
    setError(null);
    try {
      const res = await fetch(`/api/history/${analysisId}/post-comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentOverride: commentText }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error?.message ?? "Failed to post comment");
      }
      setJustPosted(true);
      onPosted(data.commentPostedAt as string);
      flashTimer.current = setTimeout(() => setJustPosted(false), SUCCESS_FLASH_MS);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post comment");
    } finally {
      setPosting(false);
    }
  }

  if (disabled && postedAt) {
    if (justPosted) {
      return <p className="text-sm font-medium text-green-700">✓ Posted to Jira</p>;
    }
    return (
      <p className="text-sm text-zinc-500">
        Posted to Jira on {new Date(postedAt).toLocaleString()}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={posting}
        className="self-start rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50"
      >
        {posting ? "Posting…" : "Post comment to Jira"}
      </button>
      {error && <ErrorBanner message={error} />}
    </div>
  );
}
