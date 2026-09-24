"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ErrorBanner } from "./ErrorBanner";
import { TicketNotFoundBanner } from "./TicketNotFoundBanner";
import type { GroundedResponse } from "@/lib/generation/schema";
import type { VersionInfo } from "@/lib/db/analysisVersions";

export type AnalyzeResult = {
  id: string;
  ticketKey: string;
  ticketUrl: string;
  ticketSummary: string;
  createdAt: string;
  groundedResponse: GroundedResponse;
  versionInfo: VersionInfo;
};

type AnalyzeError = { code: string; message: string; ticketKey: string };
export type Phase = "idle" | "fetching" | "analyzing" | "success";

const TICKET_KEY_PATTERN = /^[A-Z][A-Z0-9]+-\d+$/i;
const ANALYZING_LABEL_DELAY_MS = 1200;
const SUCCESS_DISPLAY_MS = 1500;

const PHASE_LABEL: Record<Phase, string> = {
  idle: "Analyze",
  fetching: "Fetching ticket…",
  analyzing: "Analyzing…",
  success: "Analysis complete ✓",
};

export function TicketInputForm({
  onResult,
  onPhaseChange,
}: {
  onResult: (result: AnalyzeResult) => void;
  onPhaseChange?: (phase: Phase) => void;
}) {
  const router = useRouter();
  const [ticketKey, setTicketKey] = useState("");
  const [phase, setPhaseState] = useState<Phase>("idle");
  const [error, setError] = useState<AnalyzeError | null>(null);
  const phaseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function setPhase(next: Phase) {
    setPhaseState(next);
    onPhaseChange?.(next);
  }

  useEffect(() => {
    return () => {
      if (phaseTimer.current) clearTimeout(phaseTimer.current);
    };
  }, []);

  async function runAnalyze(key: string) {
    setPhase("fetching");
    setError(null);
    phaseTimer.current = setTimeout(() => setPhase("analyzing"), ANALYZING_LABEL_DELAY_MS);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketKey: key }),
      });
      const data = await res.json();
      if (phaseTimer.current) clearTimeout(phaseTimer.current);

      if (!res.ok) {
        setPhase("idle");
        setError({
          code: data?.error?.code ?? "UNKNOWN",
          message: data?.error?.message ?? "Failed to analyze ticket",
          ticketKey: key,
        });
        return;
      }

      setPhase("success");
      onResult(data as AnalyzeResult);
      router.refresh();
      phaseTimer.current = setTimeout(() => setPhase("idle"), SUCCESS_DISPLAY_MS);
    } catch (err) {
      if (phaseTimer.current) clearTimeout(phaseTimer.current);
      setPhase("idle");
      setError({
        code: "NETWORK_ERROR",
        message: err instanceof Error ? err.message : "Failed to analyze ticket",
        ticketKey: key,
      });
    }
  }

  async function submitAnalyze() {
    const trimmed = ticketKey.trim().toUpperCase();
    if (!TICKET_KEY_PATTERN.test(trimmed)) {
      setError({
        code: "INVALID_KEY",
        message: 'Enter a ticket key like "WEB-1245"',
        ticketKey: trimmed,
      });
      return;
    }
    await runAnalyze(trimmed);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await submitAnalyze();
  }

  const busy = phase !== "idle";

  return (
    <div className="flex flex-col gap-3">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={ticketKey}
          onChange={(e) => setTicketKey(e.target.value)}
          placeholder="WEB-1245"
          disabled={busy}
          className="flex-1 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={busy}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:opacity-80 ${
            phase === "success" ? "bg-green-600 text-white" : "bg-zinc-900 text-white hover:bg-zinc-700"
          }`}
        >
          {PHASE_LABEL[phase]}
        </button>
      </form>
      {error?.code === "TICKET_NOT_FOUND" ? (
        <TicketNotFoundBanner ticketKey={error.ticketKey} onRetry={submitAnalyze} />
      ) : error ? (
        <ErrorBanner message={error.message} />
      ) : null}
    </div>
  );
}
