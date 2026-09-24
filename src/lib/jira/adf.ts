import type { AdfDoc, AdfNode } from "@/types/jira";

function nodeText(node: AdfNode): string {
  if (node.type === "text") {
    const linkMark = node.marks?.find((m) => m.type === "link");
    const href = linkMark?.attrs?.href;
    return href ? `${node.text ?? ""} (${href})` : node.text ?? "";
  }
  if (node.type === "hardBreak") return "\n";
  if (node.type === "mention") {
    const attrs = node.attrs as { text?: string; id?: string } | undefined;
    return `@${attrs?.text ?? attrs?.id ?? "mention"}`;
  }
  return (node.content ?? []).map(nodeText).join("");
}

function listToText(node: AdfNode, ordered: boolean): string {
  const items = node.content ?? [];
  return items
    .map((item, i) => {
      const prefix = ordered ? `${i + 1}. ` : "- ";
      const text = (item.content ?? []).map(blockToText).join(" ").trim();
      return `${prefix}${text}`;
    })
    .join("\n");
}

function blockToText(node: AdfNode): string {
  switch (node.type) {
    case "paragraph":
      return (node.content ?? []).map(nodeText).join("");
    case "heading": {
      const level = (node.attrs as { level?: number } | undefined)?.level ?? 1;
      return `${"#".repeat(level)} ${(node.content ?? []).map(nodeText).join("")}`;
    }
    case "bulletList":
      return listToText(node, false);
    case "orderedList":
      return listToText(node, true);
    case "codeBlock":
      return `\`\`\`\n${(node.content ?? []).map(nodeText).join("")}\n\`\`\``;
    case "blockquote":
    case "panel":
      return (node.content ?? [])
        .map(blockToText)
        .join("\n")
        .split("\n")
        .map((line) => `> ${line}`)
        .join("\n");
    case "table":
      return (node.content ?? []).map(blockToText).join("\n");
    case "tableRow":
      return (node.content ?? []).map(blockToText).join(" | ");
    case "tableCell":
    case "tableHeader":
      return (node.content ?? []).map(blockToText).join(" ").trim();
    case "rule":
      return "---";
    default: {
      if (node.content) {
        return node.content.map(blockToText).join("\n");
      }
      if (typeof globalThis !== "undefined" && process.env.NODE_ENV !== "production") {
        console.warn(`adfToPlainText: unhandled ADF node type "${node.type}"`);
      }
      return "";
    }
  }
}

export function adfToPlainText(doc: AdfDoc | null | undefined): string {
  if (!doc || !doc.content) return "";
  return doc.content
    .map(blockToText)
    .filter((block) => block.trim().length > 0)
    .join("\n\n")
    .trim();
}

export function plainTextToMinimalAdf(text: string): AdfDoc {
  const blocks = text
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);

  const content: AdfNode[] =
    blocks.length > 0
      ? blocks.map((block) => ({
          type: "paragraph",
          content: [{ type: "text", text: block }],
        }))
      : [{ type: "paragraph", content: [] }];

  return {
    type: "doc",
    version: 1,
    content,
  };
}
