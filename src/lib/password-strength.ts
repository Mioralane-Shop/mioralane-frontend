import zxcvbn, { type ZXCVBNResult } from "zxcvbn";

/**
 * Password strength + policy, shared by the register and reset-password forms.
 *
 * The strength label comes from zxcvbn (character variety, common passwords,
 * sequences and repetitions — not just class counts). The policy checklist
 * mirrors the API's eight-character minimum, so the same rule gates both the
 * form and the server.
 */

export type StrengthLevel = 0 | 1 | 2 | 3;

export interface StrengthMeta {
  level: StrengthLevel;
  label: string;
  /** Text colour of the label. */
  textClass: string;
  /** Fill colour of the bar segments. */
  barClass: string;
}

export const STRENGTH_LEVELS: readonly StrengthMeta[] = [
  { level: 0, label: "Weak", textClass: "text-red-600", barClass: "bg-red-500" },
  { level: 1, label: "Medium", textClass: "text-orange-500", barClass: "bg-orange-400" },
  { level: 2, label: "Strong", textClass: "text-emerald-600", barClass: "bg-emerald-500" },
  { level: 3, label: "Very Strong", textClass: "text-emerald-800", barClass: "bg-emerald-700" },
];

/** zxcvbn 0–4 → our four labels. Scores 0–1 are both "Weak". */
export const levelFromScore = (score: number): StrengthLevel =>
  score <= 1 ? 0 : score === 2 ? 1 : score === 3 ? 2 : 3;

/* ── policy checklist ─────────────────────────────────────────────────────── */

export interface PasswordRequirement {
  id: string;
  label: string;
  test: (password: string) => boolean;
}

/**
 * The API's only password rule is eight characters. Keep this list in sync with
 * `registerUserSchema.password` and `resetPasswordSchema.newPassword`.
 */
export const PASSWORD_REQUIREMENTS: readonly PasswordRequirement[] = [
  { id: "length", label: "At least 8 characters", test: (p) => p.length >= 8 },
];

/** True when every policy requirement passes — the submit gate. */
export const meetsPasswordPolicy = (password: string): boolean =>
  PASSWORD_REQUIREMENTS.every((requirement) => requirement.test(password));

export const PASSWORD_POLICY_HINT = "At least 8 characters.";

/* ── zxcvbn (lazy-loaded once; keeps the big dictionary out of the first paint) ── */

let zxcvbnPromise: Promise<typeof zxcvbn> | null = null;

const loadZxcvbn = (): Promise<typeof zxcvbn> => {
  if (!zxcvbnPromise) {
    zxcvbnPromise = import("zxcvbn").then((module) => module.default);
  }
  return zxcvbnPromise;
};

export interface PasswordStrengthResult {
  score: number;
  level: StrengthLevel;
  meta: StrengthMeta;
  /** Human feedback from zxcvbn, when it has any. */
  suggestion?: string;
}

export const measurePasswordStrength = async (password: string): Promise<PasswordStrengthResult> => {
  const meta = STRENGTH_LEVELS[0];

  if (!password) {
    return { score: -1, level: 0, meta, suggestion: undefined };
  }

  const engine = await loadZxcvbn();
  const result: ZXCVBNResult = engine(password);
  const level = levelFromScore(result.score);
  const suggestion = result.feedback.suggestions[0] ?? result.feedback.warning ?? undefined;

  return { score: result.score, level, meta: STRENGTH_LEVELS[level], suggestion };
};
