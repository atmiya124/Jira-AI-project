"use client";

import { useState } from "react";
import type { Analysis } from "@/lib/claude/schema";
import type { VersionInfo } from "@/lib/db/analysisVersions";
import { ComplexityBadge } from "./ComplexityBadge";
import { PostCommentButton } from "./PostCommentButton";
import { TicketVersionLabel } from "./TicketVersionLabel";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
        {title}
      </h3>
      {children}
    </section>
  );
}

function BulletList({ items }: { items: string[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-zinc-500">None</p>;
  }
  return (
    <ul className="list-disc space-y-1 pl-5 text-sm">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

export function AnalysisResult({
  id,
  ticketKey,
  ticketUrl,
  analysis,
  initialCommentPosted,
  initialCommentPostedAt,
  versionInfo,
}: {
  id: string;
  ticketKey: string;
  ticketUrl: string;
  analysis: Analysis;
  initialCommentPosted: boolean;
  initialCommentPostedAt: string | null;
  versionInfo?: VersionInfo;
}) {
  const [draftComment, setDraftComment] = useState(analysis.draftJiraComment);
  const [commentPosted, setCommentPosted] = useState(initialCommentPosted);
  const [commentPostedAt, setCommentPostedAt] = useState<string | null>(initialCommentPostedAt);

  return (
    <div className="flex flex-col gap-6 rounded-lg border border-zinc-200 bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <a
          href={ticketUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-lg font-semibold text-zinc-900 hover:underline"
        >
          <TicketVersionLabel ticketKey={ticketKey} versionInfo={versionInfo} />
        </a>
        <ComplexityBadge complexity={analysis.estimatedComplexity} rationale={analysis.complexityRationale} />
      </div>

      <Section title="Summary">
        <p className="text-sm">{analysis.summary}</p>
      </Section>

      <Section title="Unclear Requirements">
        <BulletList items={analysis.ambiguities} />
      </Section>

      <Section title="Acceptance Criteria">
        <BulletList items={analysis.acceptanceCriteria} />
      </Section>

      <Section title="Subtasks">
        <ol className="list-decimal space-y-2 pl-5 text-sm">
          {analysis.subtasks
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((task) => (
              <li key={task.order}>
                <span className="font-medium">{task.title}</span>
                {task.description && (
                  <p className="text-zinc-600">{task.description}</p>
                )}
              </li>
            ))}
        </ol>
      </Section>

      <Section title="Suggested Files / Components">
        <BulletList items={analysis.suggestedFilesOrComponents} />
      </Section>

      <Section title="Implementation Approach">
        <p className="whitespace-pre-wrap text-sm">{analysis.implementationApproach}</p>
      </Section>

      <Section title="Test Cases">
        <div className="flex flex-col gap-3">
          {analysis.testCases.map((tc, i) => (
            <div
              key={i}
              className="rounded-md border border-zinc-200 p-3 text-sm"
            >
              <p className="font-medium">{tc.title}</p>
              <ol className="list-decimal space-y-1 pl-5 text-zinc-600">
                {tc.steps.map((step, j) => (
                  <li key={j}>{step}</li>
                ))}
              </ol>
              <p className="mt-1">
                <span className="font-medium">Expected:</span> {tc.expectedResult}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="QA Checklist">
        <ul className="space-y-1 text-sm">
          {analysis.qaChecklist.map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <input type="checkbox" className="mt-1" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Draft Jira Completion Comment">
        <textarea
          value={draftComment}
          onChange={(e) => setDraftComment(e.target.value)}
          disabled={commentPosted}
          rows={6}
          className="w-full rounded-md border border-zinc-300 bg-white p-2 text-sm disabled:opacity-60"
        />
        <PostCommentButton
          analysisId={id}
          commentText={draftComment}
          disabled={commentPosted}
          postedAt={commentPostedAt}
          onPosted={(postedAt) => {
            setCommentPosted(true);
            setCommentPostedAt(postedAt);
          }}
        />
      </Section>
    </div>
  );
}
