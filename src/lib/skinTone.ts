// Emoji skin tone helper
// Applies Fitzpatrick modifier (U+1F3FB..1F3FF) to toneable emojis app-wide.

export const SKIN_TONES = {
  default: { label: "Padrão", modifier: "", swatch: "🖐️" },
  light: { label: "Clara", modifier: "\u{1F3FB}", swatch: "🖐🏻" },
  mediumLight: { label: "Média clara", modifier: "\u{1F3FC}", swatch: "🖐🏼" },
  medium: { label: "Média", modifier: "\u{1F3FD}", swatch: "🖐🏽" },
  mediumDark: { label: "Média escura", modifier: "\u{1F3FE}", swatch: "🖐🏾" },
  dark: { label: "Escura", modifier: "\u{1F3FF}", swatch: "🖐🏿" },
} as const;

export type SkinToneKey = keyof typeof SKIN_TONES;

// Codepoints that accept a skin-tone modifier (subset — the common person/hand emojis)
const TONEABLE = new Set<number>();
const addRange = (a: number, b: number) => { for (let i = a; i <= b; i++) TONEABLE.add(i); };
[
  0x1F3C2, 0x1F3C3, 0x1F3C4, 0x1F3CA, 0x1F3CB, 0x1F3CC,
  0x1F442, 0x1F443, 0x1F46E, 0x1F470, 0x1F471, 0x1F472, 0x1F473, 0x1F474,
  0x1F475, 0x1F476, 0x1F477, 0x1F478, 0x1F47C,
  0x1F481, 0x1F482, 0x1F483, 0x1F485, 0x1F486, 0x1F487, 0x1F48F, 0x1F491,
  0x1F4AA, 0x1F574, 0x1F575, 0x1F57A, 0x1F590, 0x1F595, 0x1F596,
  0x1F645, 0x1F646, 0x1F647, 0x1F64B, 0x1F64C, 0x1F64D, 0x1F64E, 0x1F64F,
  0x1F6A3, 0x1F6B4, 0x1F6B5, 0x1F6B6, 0x1F6C0, 0x1F6CC,
  0x1F90C, 0x1F90F, 0x1F918, 0x1F919, 0x1F91A, 0x1F91B, 0x1F91C, 0x1F91D, 0x1F91E, 0x1F91F,
  0x1F926, 0x1F930, 0x1F931, 0x1F932, 0x1F933, 0x1F934, 0x1F935, 0x1F936, 0x1F937, 0x1F977,
  0x1F9B5, 0x1F9B6, 0x1F9B8, 0x1F9B9, 0x1F9BB, 0x1F9CD, 0x1F9CE, 0x1F9CF,
].forEach(cp => TONEABLE.add(cp));
addRange(0x1F446, 0x1F450);
addRange(0x1F466, 0x1F469);
addRange(0x1F9D1, 0x1F9DD);

const isModifier = (cp: number) => cp >= 0x1F3FB && cp <= 0x1F3FF;

export function applySkinTone(text: string, tone?: SkinToneKey | string | null): string {
  if (!text) return text;
  const modifier = tone && (SKIN_TONES as any)[tone]?.modifier;
  // Always strip any existing modifiers first so it's idempotent
  const chars = [...text].filter(c => !isModifier(c.codePointAt(0)!));
  if (!modifier) return chars.join("");
  const idx = chars.findIndex(c => TONEABLE.has(c.codePointAt(0)!));
  if (idx === -1) return chars.join("");
  chars.splice(idx + 1, 0, modifier);
  return chars.join("");
}
