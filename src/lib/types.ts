import { z } from "zod";

const CategorySchema = z.object({
  score: z.number().int().min(0).max(100),
  label: z.string(),
  findings: z.string().max(500), // Increased from 300 to allow for more detailed findings
});

export const AnalysisResultSchema = z.object({
  overallScore: z.number().int().min(0).max(100),
  verdict: z.enum(["Strong Match", "Good Match", "Partial Match", "Weak Match"]),
  summary: z.string().max(500),
  categories: z.object({
    technicalSkills: CategorySchema,
    experience: CategorySchema,
    education: CategorySchema,
    softSkills: CategorySchema,
  }),
  strengths: z.array(z.string()).min(0).max(5), // Allow empty array if no valid strengths found
  gaps: z.array(z.string()).min(0).max(5), // Allow empty array if no gaps found
  recommendedAction: z.enum([
    "Invite to Interview",
    "Consider",
    "Keep on File",
    "Pass",
  ]),
  credibilityFlags: z.array(z.string()).optional(), // Flags for credibility issues detected
});

export const RequestSchema = z.object({
  jobDescription: z.string().min(50).max(5000).trim(),
});

export interface CVAnalysis extends z.infer<typeof AnalysisResultSchema> {
  fileName: string;
  processingTimeMs: number;
  error?: string;
}

export type AnalysisStatus = "idle" | "uploading" | "analyzing" | "done" | "error";

