import type { SummaryCounts } from "@/lib/dashboard/queries";

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-zinc-200 bg-white p-4">
      <span className="text-2xl font-semibold text-zinc-900">{value}</span>
      <span className="text-xs font-medium text-zinc-500">{label}</span>
    </div>
  );
}

export function SummaryCards({ needsReview, processedToday, postedToday }: SummaryCounts) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <StatCard label="Needs Review" value={needsReview} />
      <StatCard label="Processed Today" value={processedToday} />
      <StatCard label="Posted Today" value={postedToday} />
    </div>
  );
}
