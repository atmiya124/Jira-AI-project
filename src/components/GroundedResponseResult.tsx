"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { GroundedResponse } from "@/lib/generation/schema";
import type { VersionInfo } from "@/lib/db/analysisVersions";
import { ConfidenceBadge } from "./ConfidenceBadge";
import { PostCommentButton } from "./PostCommentButton";
import { TicketVersionLabel } from "./TicketVersionLabel";
import { SourcesUsedSection } from "./SourcesUsedSection";
import { ResponseSections } from "./ResponseSections";
import { SparkleIcon } from "@/components/getting-started/icons";
import { CalloutBox } from "@/components/getting-started/CalloutBox";

function MissingInformationSection({ items }: { items: string[] }) {
  if (items.length === 0) return null;

  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
        Missing Information
      </h3>
      <CalloutBox>
        {items.length === 1 ? (
          items[0]
        ) : (
          <ul className="list-disc space-y-1 pl-4">
            {items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        )}
      </CalloutBox>
    </section>
  );
}

export function GroundedResponseResult({
  id,
  ticketKey,
  ticketUrl,
  groundedResponse,
  initialCommentPosted,
  initialCommentPostedAt,
  versionInfo,
  triggerSource,
}: {
  id: string;
  ticketKey: string;
  ticketUrl: string;
  groundedResponse: GroundedResponse;
  initialCommentPosted: boolean;
  initialCommentPostedAt: string | null;
  versionInfo?: VersionInfo;
  triggerSource?: string;
}) {
  const router = useRouter();
  const [draftResponse, setDraftResponse] = useState(groundedResponse.suggestedResponse);
  const [commentPosted, setCommentPosted] = useState(initialCommentPosted);
  const [commentPostedAt, setCommentPostedAt] = useState<string | null>(initialCommentPostedAt);

  return (
    <div className="flex flex-col gap-6 rounded-xl border border-zinc-200 bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <a
            href={ticketUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-lg font-semibold text-zinc-900 hover:underline"
          >
            <TicketVersionLabel ticketKey={ticketKey} versionInfo={versionInfo} />
          </a>
          {triggerSource === "auto" && (
            <span
              className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700"
              title="Automatically detected and analyzed"
            >
              Auto
            </span>
          )}
        </div>
        <ConfidenceBadge confidence={groundedResponse.confidence} />
      </div>

      <section className="flex flex-col gap-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-zinc-500">
          <SparkleIcon className="size-4 text-zinc-400" />
          AI Response
        </h3>
        <ResponseSections
          initialText={groundedResponse.suggestedResponse}
          disabled={commentPosted}
          onChange={setDraftResponse}
        />
      </section>

      <MissingInformationSection items={groundedResponse.missingInformation} />

      <SourcesUsedSection sources={groundedResponse.sourcesUsed} />

      <PostCommentButton
        analysisId={id}
        commentText={draftResponse}
        disabled={commentPosted}
        postedAt={commentPostedAt}
        onPosted={(postedAt) => {
          setCommentPosted(true);
          setCommentPostedAt(postedAt);
          // Refreshes server-rendered state (Needs Review count/list) without
          // navigating away - the user may want to stay on this ticket.
          router.refresh();
        }}
      />

      {commentPosted && triggerSource === "auto" && (
        <Link
          href="/needs-review"
          className="self-start text-sm text-zinc-500 hover:text-zinc-900 hover:underline"
        >
          ← Back to Needs Review
        </Link>
      )}
    </div>
  );
}
