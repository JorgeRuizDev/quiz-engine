import { z } from 'zod';

export const LocalizedTextSchema = z.record(z.string(), z.string()).and(
  z.object({
    en: z.string(),
    es: z.string().optional(),
  })
);
export type LocalizedText = {
  en: string;
  es?: string;
  [lang: string]: string | undefined;
};

export const STANDARD_QUESTION_TYPES = [
  'single-choice',
  'multiple-choice',
  'interactive-visual',
] as const;

export type StandardQuestionType = (typeof STANDARD_QUESTION_TYPES)[number];

export const QuestionTypeSchema = z.string().min(1);
export type QuestionType = StandardQuestionType | string;

export const DifficultyLevelSchema = z.enum([
  'beginner',
  'intermediate',
  'advanced',
]);
export type DifficultyLevel = z.infer<typeof DifficultyLevelSchema>;

export const NotationFormatSchema = z.enum([
  'letters',
  'solfege',
  'dual',
  'neutral',
]);
export type NotationFormat = z.infer<typeof NotationFormatSchema>;

export const VisualDescriptorSchema = z.object({
  visualType: z.string(),
  visualProps: z.record(z.string(), z.unknown()).optional().default({}),
});
export type VisualDescriptor = z.infer<typeof VisualDescriptorSchema>;

export const QuestionOptionSchema = z.object({
  id: z.string(),
  label: z.record(z.string(), z.string()),
  visualCue: VisualDescriptorSchema.optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export type QuestionOption = z.infer<typeof QuestionOptionSchema>;

export const RemediationSchema = z.object({
  explanation: z.record(z.string(), z.string()),
  hint: z.record(z.string(), z.string()).optional(),
  mnemonic: z.record(z.string(), z.string()).optional(),
  visualExplanation: VisualDescriptorSchema.optional(),
});
export type Remediation = z.infer<typeof RemediationSchema>;

export const QuestionSchema = z.object({
  id: z.string(),
  familyIds: z.array(z.string()).optional(),
  type: QuestionTypeSchema,
  course: z.number().int().min(1),
  difficulty: DifficultyLevelSchema,
  topics: z.array(z.string()),
  notation: NotationFormatSchema,
  prompt: z.record(z.string(), z.string()),
  subPrompt: z.record(z.string(), z.string()).optional(),
  stimulus: VisualDescriptorSchema.optional(),
  options: z.array(QuestionOptionSchema).min(0),
  correctAnswer: z.unknown(),
  remediation: RemediationSchema,
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export type Question = z.infer<typeof QuestionSchema>;

export const QuestionPackSchema = z.object({
  packId: z.string().regex(/^[a-z0-9-]+$/),
  course: z.number().int().min(1),
  topics: z.array(z.string()).optional(),
  questions: z.array(QuestionSchema),
});
export type QuestionPack = z.infer<typeof QuestionPackSchema>;

export const QuestionPackEntrySchema = z.object({
  packId: z.string(),
  filePath: z.string().optional(),
  dirPath: z.string().optional(),
  path: z.string().optional(),
  course: z.number().int().min(1),
  topics: z.array(z.string()),
  questionCount: z.number().int().min(0),
  supportedNotations: z.array(NotationFormatSchema),
});
export type QuestionPackEntry = z.infer<typeof QuestionPackEntrySchema>;

export const QuestionPackManifestSchema = z.object({
  version: z.literal('1.0'),
  packs: z.array(QuestionPackEntrySchema),
});
export type QuestionPackManifest = z.infer<typeof QuestionPackManifestSchema>;
