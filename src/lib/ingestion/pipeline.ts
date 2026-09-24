import { acquireConfluencePage, listConfluenceSpacePageIds } from "./sources/confluence";
import { acquireMarkdownFile } from "./sources/localMarkdown";
import { extractFromHtml, extractFromMarkdown } from "./extract";
import { chunkDocument } from "./chunk";
import { upsertDocument, type IngestResult } from "./store";

export async function ingestConfluencePage(pageIdOrUrl: string): Promise<IngestResult> {
  const doc = await acquireConfluencePage(pageIdOrUrl);
  const normalized = extractFromHtml(doc.rawContent, doc.title);
  const chunks = chunkDocument(normalized);
  return upsertDocument(doc, chunks, normalized.plainText);
}

export async function ingestConfluenceSpace(spaceKey: string): Promise<IngestResult[]> {
  const pageIds = await listConfluenceSpacePageIds(spaceKey);
  const results: IngestResult[] = [];
  for (const id of pageIds) {
    results.push(await ingestConfluencePage(id));
  }
  return results;
}

export async function ingestMarkdownFile(filePath: string): Promise<IngestResult> {
  const doc = await acquireMarkdownFile(filePath);
  const normalized = extractFromMarkdown(doc.rawContent, doc.title);
  const chunks = chunkDocument(normalized);
  return upsertDocument(doc, chunks, normalized.plainText);
}
