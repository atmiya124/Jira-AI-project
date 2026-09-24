import { z } from "zod";

export const ComplexitySchema = z.enum(["Low", "Medium", "High"]);

export const SubtaskSchema = z.object({
  order: z.number().int(),
  title: z.string(),
  description: z.string(),
});

export const TestCaseSchema = z.object({
  title: z.string(),
  steps: z.array(z.string()),
  expectedResult: z.string(),
});

export const AnalysisSchema = z.object({
  summary: z.string().describe("1-3 sentence plain-English summary of the requirement"),
  ambiguities: z
    .array(z.string())
    .describe("Unclear or ambiguous points that should be clarified with the reporter; empty array if none"),
  acceptanceCriteria: z
    .array(z.string())
    .describe("Generated acceptance criteria, Given/When/Then or plain bullet form"),
  subtasks: z.array(SubtaskSchema).describe("Ordered breakdown of implementation subtasks"),
  suggestedFilesOrComponents: z
    .array(z.string())
    .describe(
      "Files/components/areas of the codebase likely needing changes, inferred only from the ticket text",
    ),
  implementationApproach: z
    .string()
    .describe("Narrative/paragraph-or-bulleted description of how to approach the implementation"),
  testCases: z.array(TestCaseSchema).describe("Generated test cases covering the acceptance criteria"),
  qaChecklist: z.array(z.string()).describe("Checklist items for manual QA before closing the ticket"),
  draftJiraComment: z
    .string()
    .describe("A ready-to-post Jira completion/status comment draft, plain text/markdown-ish"),
  estimatedComplexity: ComplexitySchema,
  complexityRationale: z.string().describe("One or two sentences explaining the complexity estimate"),
});

export type Analysis = z.infer<typeof AnalysisSchema>;
