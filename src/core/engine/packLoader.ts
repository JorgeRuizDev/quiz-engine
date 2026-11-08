import fs from 'node:fs';
import path from 'node:path';
import yaml from 'yaml';
import {
  QuestionPackSchema,
  QuestionPackManifestSchema,
  QuestionSchema,
  type Question,
  type QuestionPack,
  type QuestionPackManifest,
} from '../types/schema';

// Static registry of packs for browser/client environments
const staticPackRegistry = new Map<string, QuestionPack>();

/**
 * Registers a question pack in-memory (useful for bundling and client-side usage).
 */
export function registerPack(pack: unknown): QuestionPack {
  const parsed = QuestionPackSchema.parse(pack);
  staticPackRegistry.set(parsed.packId, parsed);
  return parsed;
}

/**
 * Validates a single question against the QuestionSchema.
 */
export function validateQuestion(raw: unknown): Question {
  return QuestionSchema.parse(raw);
}

/**
 * Validates an entire question pack against QuestionPackSchema.
 */
export function validateQuestionPack(raw: unknown): QuestionPack {
  return QuestionPackSchema.parse(raw);
}

/**
 * Validates the manifest index against QuestionPackManifestSchema.
 */
export function validateManifest(raw: unknown): QuestionPackManifest {
  return QuestionPackManifestSchema.parse(raw);
}

/**
 * Parses YAML or JSON content into a JavaScript object.
 */
export function parseYamlOrJson<T = unknown>(content: string): T {
  return yaml.parse(content) as T;
}

/**
 * Loads a question pack from a directory containing modular YAML or JSON files.
 * Reads all .yml, .yaml, and .json files in the directory, parses each,
 * aggregates questions, and returns a validated QuestionPack.
 *
 * NOTE: There is intentionally NO limit on the number of files at code level.
 */
export function loadPackFromDir(
  dirPath: string,
  meta?: Partial<QuestionPack>
): QuestionPack {
  if (!fs.existsSync(dirPath)) {
    throw new Error(`Directory not found: ${dirPath}`);
  }

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const files = entries
    .filter((e) => e.isFile() && /\.(ya?ml|json)$/i.test(e.name))
    .map((e) => e.name)
    .sort();

  const questions: Question[] = [];
  let packId = meta?.packId;
  let course = meta?.course;
  let topics = meta?.topics ? [...meta.topics] : [];

  for (const fileName of files) {
    const fullPath = path.join(dirPath, fileName);
    const content = fs.readFileSync(fullPath, 'utf-8');
    const parsed = parseYamlOrJson<any>(content);

    if (!parsed) continue;

    // Check for metadata files or metadata keys
    if (fileName.startsWith('_') || fileName === 'pack.yml' || fileName === 'pack.json') {
      if (parsed.packId && !packId) packId = parsed.packId;
      if (parsed.course !== undefined && course === undefined) course = parsed.course;
      if (parsed.topics && topics.length === 0) topics = [...parsed.topics];
    }

    if (Array.isArray(parsed)) {
      questions.push(...parsed);
    } else if (parsed && typeof parsed === 'object') {
      if (parsed.packId && !packId) packId = parsed.packId;
      if (parsed.course !== undefined && course === undefined) course = parsed.course;
      if (parsed.topics && topics.length === 0) topics = [...parsed.topics];

      if (Array.isArray(parsed.questions)) {
        questions.push(...parsed.questions);
      }
    }
  }

  // Fallbacks if not provided
  if (!packId) {
    packId = path.basename(dirPath);
  }
  if (course === undefined) {
    course = questions[0]?.course ?? 1;
  }
  if (topics.length === 0 && questions[0]?.topics) {
    topics = Array.from(new Set(questions.flatMap((q) => q.topics || [])));
  }

  const rawPack = {
    packId,
    course,
    topics,
    questions,
  };

  return QuestionPackSchema.parse(rawPack);
}

/**
 * Loads a QuestionPack from either a directory or a file (YAML or JSON).
 */
export function loadPack(
  targetPath: string,
  meta?: Partial<QuestionPack>
): QuestionPack {
  if (!fs.existsSync(targetPath)) {
    throw new Error(`Pack path not found: ${targetPath}`);
  }

  const stat = fs.statSync(targetPath);
  if (stat.isDirectory()) {
    return loadPackFromDir(targetPath, meta);
  }

  const content = fs.readFileSync(targetPath, 'utf-8');
  const parsed = parseYamlOrJson<any>(content);
  return QuestionPackSchema.parse(parsed);
}

/**
 * Retrieves a registered pack by its packId.
 */
export function getPack(packId: string): QuestionPack | undefined {
  return staticPackRegistry.get(packId);
}

/**
 * Returns all registered questions across all registered packs.
 */
export function getAllRegisteredQuestions(): Question[] {
  const questions: Question[] = [];
  for (const pack of staticPackRegistry.values()) {
    questions.push(...pack.questions);
  }
  return questions;
}

/**
 * Clears the static pack registry (useful for testing).
 */
export function clearPackRegistry(): void {
  staticPackRegistry.clear();
}
