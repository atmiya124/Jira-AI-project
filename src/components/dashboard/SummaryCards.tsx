import { prisma } from "@/lib/db/prisma";

function startOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-zinc-200 bg-white p-4">
      <span className="text-2xl font-semibold text-zinc-900">{value}</span>
      <span className="text-xs font-medium text-zinc-500">{label}</span>
    </div>
  );
}

export async function SummaryCards() {
  const today = startOfToday();

  const [needsReview, processedToday, postedToday] = await Promise.all([
    prisma.analysis.count({
      where: {
        pipelineType: "rag",
        triggerSource: "auto",
        reviewedAt: null,
        commentPosted: false,
      },
    }),
    prisma.analysis.count({
      where: { pipelineType: "rag", triggerSource: "auto", createdAt: { gte: today } },
    }),
    prisma.analysis.count({
      where: { commentPosted: true, commentPostedAt: { gte: today } },
    }),
  ]);

  return (
    <div className="grid grid-cols-3 gap-3">
      <StatCard label="Needs Review" value={needsReview} />
      <StatCard label="Processed Today" value={processedToday} />
      <StatCard label="Posted Today" value={postedToday} />
    </div>
  );
}
