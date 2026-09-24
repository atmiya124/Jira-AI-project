import { parse } from "node-html-parser";
import type { HTMLElement } from "node-html-parser";
import type { NormalizedDocument, Section } from "./types";

const HEADING_TAGS = new Set(["H1", "H2", "H3", "H4", "H5", "H6"]);
const BLOCK_SELECTOR = "h1, h2, h3, h4, h5, h6, p, ul, ol, table, pre, blockquote";

function textOf(el: HTMLElement): string {
  return el.textContent.replace(/\s+/g, " ").trim();
}

function sectionsToDoc(title: string, sections: Section[]): NormalizedDocument {
  const plainText = sections
    .map((s) => (s.heading ? `${s.heading}\n${s.text}` : s.text))
    .join("\n\n");
  return { title, sections, plainText };
}

export function extractFromHtml(html: string, title: string): NormalizedDocument {
  const root = parse(html);
  const allBlocks = root.querySelectorAll(BLOCK_SELECTOR);
  const blockSet = new Set(allBlocks);

  // Keep only top-level matches so a <ul> and its nested <li>/<p> content
  // (if the source HTML nests block tags inside list items) don't get
  // extracted twice - textContent on the outer element already captures it.
  const topLevelBlocks = allBlocks.filter((el) => {
    let parent = el.parentNode as HTMLElement | null;
    while (parent) {
      if (blockSet.has(parent)) return false;
      parent = parent.parentNode as HTMLElement | null;
    }
    return true;
  });

  const sections: Section[] = [];
  let currentHeading: string | null = null;
  let currentParts: string[] = [];

  function flush() {
    const text = currentParts.join("\n\n").trim();
    if (text) sections.push({ heading: currentHeading, text });
    currentParts = [];
  }

  for (const block of topLevelBlocks) {
    if (HEADING_TAGS.has(block.tagName)) {
      flush();
      currentHeading = textOf(block);
    } else {
      const text = textOf(block);
      if (text) currentParts.push(text);
    }
  }
  flush();

  return sectionsToDoc(title, sections);
}

export function extractFromMarkdown(markdown: string, title: string): NormalizedDocument {
  const lines = markdown.split(/\r?\n/);
  const sections: Section[] = [];
  let currentHeading: string | null = null;
  let currentLines: string[] = [];

  function flush() {
    const text = currentLines.join("\n").trim();
    if (text) sections.push({ heading: currentHeading, text });
    currentLines = [];
  }

  for (const line of lines) {
    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      flush();
      currentHeading = headingMatch[2].trim();
    } else {
      currentLines.push(line);
    }
  }
  flush();

  return sectionsToDoc(title, sections);
}
