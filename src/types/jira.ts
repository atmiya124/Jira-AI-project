export type AdfMark = {
  type: string;
  attrs?: Record<string, unknown>;
};

export type AdfNode = {
  type: string;
  text?: string;
  content?: AdfNode[];
  marks?: AdfMark[];
  attrs?: Record<string, unknown>;
};

export type AdfDoc = {
  type: "doc";
  version: 1;
  content: AdfNode[];
};

export type JiraIssue = {
  key: string;
  fields: {
    summary: string;
    description: AdfDoc | null;
    status: { name: string } | null;
    issuetype: { name: string } | null;
  };
};
