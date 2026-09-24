import Link from "next/link";
import { HomeClient } from "@/components/HomeClient";

export const dynamic = "force-dynamic";

export default function AnalyzePage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-10">
      <div className="flex flex-col gap-1">
        <Link href="/" className="text-sm text-zinc-500 hover:underline">
          ← Back to dashboard
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">Analyze ticket manually</h1>
        <p className="text-sm text-zinc-500">
          Useful for debugging, re-analysis, or tickets outside the watcher&apos;s ingestion
          window. New tickets are normally picked up automatically.
        </p>
      </div>
      <HomeClient />
    </div>
  );
}
