import Link from "next/link";
import { prisma } from "@/lib/db/prisma";

export async function NeedsReviewNavLink() {
  const count = await prisma.analysis.count({
    where: { pipelineType: "rag", triggerSource: "auto", reviewedAt: null, commentPosted: false },
  });

  return (
    <Link
      href="/needs-review"
      className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
        count > 0
          ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
          : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
      }`}
    >
      Needs Review ({count})
    </Link>
  );
}
