import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import type { AcquiredDocument } from "../types";

export async function acquireMarkdownFile(filePath: string): Promise<AcquiredDocument> {
  const content = await readFile(filePath, "utf8");
  const stats = await stat(filePath);

  const firstHeadingMatch = content.match(/^#\s+(.*)$/m);
  const title = firstHeadingMatch?.[1]?.trim() ?? path.basename(filePath, path.extname(filePath));

  return {
    source: "local-markdown",
    sourceId: path.resolve(filePath),
    title,
    sourceUrl: null,
    updatedAt: stats.mtime.toISOString(),
    rawContent: content,
    contentFormat: "markdown",
  };
}
