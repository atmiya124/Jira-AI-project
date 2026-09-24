"use client";

import { useEffect, useRef, useState } from "react";

function splitIntoSentences(text: string): string[] {
  const matches = text.match(/[^.!?]+[.!?]*/g);
  if (!matches) return text.trim() ? [text.trim()] : [];
  return matches.map((s) => s.trim()).filter(Boolean);
}

function AutoGrowTextarea({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      rows={1}
      className="w-full resize-none border-0 bg-transparent p-0 text-sm text-zinc-800 focus:outline-none disabled:opacity-60"
    />
  );
}

/**
 * Splits the AI response into per-sentence editable section cards instead of
 * one flat textarea. Edits to any card are rejoined (space-separated) into a
 * single string via onChange - the underlying contract (one comment string
 * posted to Jira) is unchanged, this only changes how it's presented/edited.
 */
export function ResponseSections({
  initialText,
  disabled,
  onChange,
}: {
  initialText: string;
  disabled: boolean;
  onChange: (fullText: string) => void;
}) {
  const [sentences, setSentences] = useState<string[]>(() => splitIntoSentences(initialText));

  function updateSentence(index: number, value: string) {
    const next = [...sentences];
    next[index] = value;
    setSentences(next);
    onChange(next.join(" "));
  }

  if (sentences.length === 0) {
    return <p className="text-sm text-zinc-500">No response generated.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {sentences.map((sentence, i) => (
        <div
          key={i}
          className="flex items-start gap-3 rounded-xl border border-zinc-200 bg-white p-3"
        >
          <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-medium text-zinc-500">
            {i + 1}
          </div>
          <AutoGrowTextarea
            value={sentence}
            onChange={(value) => updateSentence(i, value)}
            disabled={disabled}
          />
        </div>
      ))}
    </div>
  );
}
