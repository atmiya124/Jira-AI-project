import type { GroundedResponse } from "@/lib/generation/schema";
import { SearchIcon } from "@/components/getting-started/icons";

export function SourcesUsedSection({ sources }: { sources: GroundedResponse["sourcesUsed"] }) {
  if (sources.length === 0) {
    return (
      <p className="text-sm text-zinc-500">
        No internal knowledge sources were used for this response.
      </p>
    );
  }

  return (
    <details className="group rounded-xl border border-zinc-200 bg-white p-3">
      <summary className="flex cursor-pointer items-center gap-2 text-sm font-medium text-zinc-700 hover:text-zinc-900">
        <SearchIcon className="size-4 text-zinc-400" />
        Sources ({sources.length})
      </summary>
      <ul className="mt-3 flex flex-col gap-2 pl-6">
        {sources.map((source, i) => (
          <li key={i} className="rounded-lg border border-zinc-200 p-3 text-sm">
            <div className="font-medium">
              {source.documentTitle}
              {source.section && <span className="text-zinc-500"> &gt; {source.section}</span>}
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500">
              <span className="rounded-full bg-zinc-100 px-2 py-0.5">{source.source}</span>
              {source.sourceUrl && (
                <a
                  href={source.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-600 hover:underline"
                >
                  View source
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>
    </details>
  );
}
