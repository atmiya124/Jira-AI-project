import type { Chunk, NormalizedDocument } from "./types";

const TARGET_CHUNK_CHARS = 2000; // ~500 tokens at a ~4 chars/token estimate
const OVERLAP_CHARS = 200; // ~10% overlap between adjacent sub-chunks

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

function splitLongSection(text: string): string[] {
  if (text.length <= TARGET_CHUNK_CHARS) return [text];

  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim());
  const parts: string[] = [];
  let current = "";

  for (const para of paragraphs) {
    if (current && (current.length + 2 + para.length) > TARGET_CHUNK_CHARS) {
      parts.push(current.trim());
      const overlap = current.slice(-OVERLAP_CHARS);
      current = `${overlap}\n\n${para}`;
    } else {
      current = current ? `${current}\n\n${para}` : para;
    }
  }
  if (current.trim()) parts.push(current.trim());

  // Last resort: a single paragraph longer than the target on its own gets
  // hard-split at character boundaries rather than left oversized.
  return parts.flatMap((part) => {
    if (part.length <= TARGET_CHUNK_CHARS * 1.5) return [part];
    const hardParts: string[] = [];
    const step = TARGET_CHUNK_CHARS - OVERLAP_CHARS;
    for (let i = 0; i < part.length; i += step) {
      hardParts.push(part.slice(i, i + TARGET_CHUNK_CHARS));
    }
    return hardParts;
  });
}

export function chunkDocument(doc: NormalizedDocument): Chunk[] {
  const chunks: Chunk[] = [];
  let index = 0;

  for (const section of doc.sections) {
    for (const part of splitLongSection(section.text)) {
      chunks.push({
        chunkIndex: index++,
        section: section.heading,
        text: part,
        tokenCount: estimateTokens(part),
      });
    }
  }

  return chunks;
}
