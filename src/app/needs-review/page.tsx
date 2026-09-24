import Link from "next/link";
import { getNeedsReviewSections } from "@/lib/dashboard/queries";
import { NeedsReviewLive } from "@/components/dashboard/NeedsReviewLive";

export const dynamic = "force-dynamic";

export default async function NeedsReviewPage() {
  const { needsReview, reviewedPending } = await getNeedsReviewSections();

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-10">
      <Link href="/" className="text-sm text-zinc-500 hover:underline">
        ← Back
      </Link>

      <NeedsReviewLive initialNeedsReview={needsReview} initialReviewedPending={reviewedPending} />
    </div>
  );
}
