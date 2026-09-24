const PHASE_TEXT: Record<"fetching" | "analyzing", string> = {
  fetching: "Fetching ticket from Jira…",
  analyzing: "Analyzing with Claude…",
};

function ShimmerBlock({ className = "" }: { className?: string }) {
  return <div className={`shimmer rounded-md ${className}`} />;
}

function ShimmerSection({ lines }: { lines: number }) {
  return (
    <div className="flex flex-col gap-2">
      <ShimmerBlock className="h-3 w-32" />
      <div className="flex flex-col gap-1.5">
        {Array.from({ length: lines }).map((_, i) => (
          <ShimmerBlock key={i} className={`h-3 ${i === lines - 1 ? "w-2/3" : "w-full"}`} />
        ))}
      </div>
    </div>
  );
}

export function AnalysisResultSkeleton({ phase }: { phase: "fetching" | "analyzing" }) {
  return (
    <div className="flex flex-col gap-6 rounded-lg border border-zinc-200 bg-white p-6">
      <p className="text-sm font-medium text-zinc-500">{PHASE_TEXT[phase]}</p>

      <div className="flex items-center justify-between gap-2">
        <ShimmerBlock className="h-6 w-24" />
        <ShimmerBlock className="h-6 w-28 rounded-full" />
      </div>

      <ShimmerSection lines={2} />
      <ShimmerSection lines={3} />
      <ShimmerSection lines={3} />
      <ShimmerSection lines={4} />
      <ShimmerSection lines={2} />
      <ShimmerSection lines={3} />
      <ShimmerSection lines={2} />
      <ShimmerBlock className="h-24 w-full" />
    </div>
  );
}
