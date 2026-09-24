export type KnowledgeSource = "confluence" | "local-markdown";

export type Section = {
  heading: string | null;
  text: string;
};

export type NormalizedDocument = {
  title: string;
  sections: Section[];
  plainText: string;
};

export type AcquiredDocument = {
  source: KnowledgeSource;
  sourceId: string;
  title: string;
  sourceUrl: string | null;
  updatedAt: string | null; // ISO string
  rawContent: string;
  contentFormat: "html" | "markdown";
};

export type Chunk = {
  chunkIndex: number;
  section: string | null;
  text: string;
  tokenCount: number;
};
