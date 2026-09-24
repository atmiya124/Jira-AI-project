"use client";

import { useState } from "react";
import { TicketInputForm, type AnalyzeResult, type Phase } from "./TicketInputForm";
import { GroundedResponseResult } from "./GroundedResponseResult";
import { AnalysisResultSkeleton } from "./AnalysisResultSkeleton";

export function HomeClient() {
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");

  function handlePhaseChange(next: Phase) {
    setPhase(next);
    if (next === "fetching") setResult(null);
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <TicketInputForm onResult={setResult} onPhaseChange={handlePhaseChange} />
      {(phase === "fetching" || phase === "analyzing") && (
        <AnalysisResultSkeleton phase={phase} />
      )}
      {result && (
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => setResult(null)}
            className="self-end text-sm text-zinc-500 transition-colors hover:text-zinc-900 hover:underline"
          >
            Clear result
          </button>
          <GroundedResponseResult
            id={result.id}
            ticketKey={result.ticketKey}
            ticketUrl={result.ticketUrl}
            groundedResponse={result.groundedResponse}
            initialCommentPosted={false}
            initialCommentPostedAt={null}
            versionInfo={result.versionInfo}
          />
        </div>
      )}
    </div>
  );
}
