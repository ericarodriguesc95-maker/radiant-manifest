/**
 * Centralized pt-BR voice selection utility.
 * Elite voice prioritization with meditative speech configuration.
 * Includes SSML-like pause engineering for guided meditation.
 * Persists user voice preferences across sessions.
 */

let voicesLoaded = false;
let cachedVoices: SpeechSynthesisVoice[] = [];

// Safe accessor, avoids "Cannot read properties of undefined (reading 'getVoices')"
// on SSR, web workers, or older browsers without Web Speech API.
function getSynth(): SpeechSynthesis | null {
  if (typeof window === "undefined") return null;
  return window.speechSynthesis ?? null;
}

function loadVoices(): SpeechSynthesisVoice[] {
  const synth = getSynth();
  if (!synth) return [];
  cachedVoices = synth.getVoices();
  if (cachedVoices.length > 0) voicesLoaded = true;
  return cachedVoices;
}

/** Safely cancel any in-flight speech. */
export function cancelSpeech(): void {
  const synth = getSynth();
  if (synth) {
    try { synth.cancel(); } catch {}
  }
}

/** Ensures voices are loaded before use. Returns a promise that resolves when ready. */
export function ensureVoicesLoaded(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const synth = getSynth();
    if (!synth) { resolve([]); return; }

    const voices = loadVoices();
    if (voices.length > 0) {
      resolve(voices);
      return;
    }
    const handler = () => {
      const v = loadVoices();
      resolve(v);
      synth.removeEventListener?.("voiceschanged", handler);
    };
    synth.addEventListener?.("voiceschanged", handler);
    setTimeout(() => {
      const v = loadVoices();
      resolve(v);
    }, 2000);
  });
}

// ---------- Persisted voice preferences ----------

const PREFS_KEY = "voice-prefs-v1";

export interface VoicePrefs {
  gender: "female" | "male";
  enabled: boolean;
  voiceName?: string; // exact voice.name chosen by user (optional)
}

const DEFAULT_PREFS: VoicePrefs = { gender: "female", enabled: true };

export function loadVoicePrefs(): VoicePrefs {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return { ...DEFAULT_PREFS };
    const parsed = JSON.parse(raw);
    return {
      gender: parsed.gender === "male" ? "male" : "female",
      enabled: parsed.enabled !== false,
      voiceName: typeof parsed.voiceName === "string" ? parsed.voiceName : undefined,
    };
  } catch {
    return { ...DEFAULT_PREFS };
  }
}

export function saveVoicePrefs(patch: Partial<VoicePrefs>): VoicePrefs {
  const current = loadVoicePrefs();
  const next = { ...current, ...patch };
  try { localStorage.setItem(PREFS_KEY, JSON.stringify(next)); } catch {}
  return next;
}

// Elite voice names, prioritize Natural/Neural/Premium quality voices
const FEMALE_PREFERRED = [
  "microsoft francisca online",
  "microsoft francisca",
  "luciana",
  "vitória",
  "vitoria",
  "google português do brasil",
  "francisca",
  "maria",
  "thalita",
  "fernanda",
  "google",
];

const MALE_PREFERRED = [
  "microsoft antonio online",
  "microsoft antonio",
  "felipe",
  "google português do brasil masculino",
  "daniel",
  "rodrigo",
  "antonio",
  "ricardo",
];

const FEMALE_HINTS = ["female", "feminina", "mulher", "francisca", "maria", "luciana", "thalita", "fernanda", "vitória", "vitoria"];
const MALE_HINTS = ["male", "masculin", "homem", "daniel", "rodrigo", "felipe", "antonio", "ricardo"];

const QUALITY_TAGS = ["online", "neural", "natural", "premium", "enhanced"];

/**
 * Get the best pt-BR voice for the given gender.
 * If the user has saved a specific voiceName preference (and it's still installed),
 * that voice wins automatically.
 */
export function getBrazilianVoice(gender: "female" | "male"): SpeechSynthesisVoice | null {
  const allVoices = loadVoices();
  if (allVoices.length === 0) return null;

  // 0. Honor the user's saved preferred voice (if still available and pt-*)
  const prefs = loadVoicePrefs();
  if (prefs.voiceName) {
    const saved = allVoices.find(
      v => v.name === prefs.voiceName && v.lang?.toLowerCase().startsWith("pt")
    );
    if (saved) return saved;
  }

  const ptBRVoices = allVoices.filter(v => v.lang === "pt-BR" || v.lang === "pt_BR");
  const ptVoices = allVoices.filter(v => v.lang.startsWith("pt"));

  const preferred = gender === "female" ? FEMALE_PREFERRED : MALE_PREFERRED;
  const genderHints = gender === "female" ? FEMALE_HINTS : MALE_HINTS;
  const oppositeHints = gender === "female" ? MALE_HINTS : FEMALE_HINTS;

  const isHighQuality = (v: SpeechSynthesisVoice) =>
    QUALITY_TAGS.some(tag => v.name.toLowerCase().includes(tag));

  for (const pref of preferred) {
    const match = ptBRVoices.find(v => v.name.toLowerCase().includes(pref));
    if (match) {
      const isOpposite = oppositeHints.some(h => match.name.toLowerCase().includes(h));
      if (pref === "google português do brasil" && gender === "male") continue;
      if (!isOpposite) return match;
    }
  }

  const highQualityGender = ptBRVoices.find(v =>
    isHighQuality(v) && genderHints.some(h => v.name.toLowerCase().includes(h))
  );
  if (highQualityGender) return highQualityGender;

  const genderMatch = ptBRVoices.find(v =>
    genderHints.some(h => v.name.toLowerCase().includes(h))
  );
  if (genderMatch) return genderMatch;

  if (gender === "female" && ptBRVoices.length > 0) {
    return ptBRVoices[0];
  }
  if (gender === "male") {
    const notFemale = ptBRVoices.find(v =>
      !FEMALE_HINTS.some(h => v.name.toLowerCase().includes(h))
    );
    if (notFemale) return notFemale;
  }

  if (ptVoices.length > 0) {
    const ptGender = ptVoices.find(v => genderHints.some(h => v.name.toLowerCase().includes(h)));
    if (ptGender) return ptGender;
    return ptVoices[0];
  }

  return null;
}

/** List all installed pt-* voices (useful for a future "pick your voice" UI). */
export function listPortugueseVoices(): SpeechSynthesisVoice[] {
  return loadVoices().filter(v => v.lang?.toLowerCase().startsWith("pt"));
}

/**
 * Insert SSML-like pauses into text for meditative speech.
 */
export function splitTextWithPauses(text: string): Array<{ text: string; pauseAfterMs: number }> {
  const chunks: Array<{ text: string; pauseAfterMs: number }> = [];
  const sentences = text.split(/(?<=[.!?])\s+/);

  for (const sentence of sentences) {
    if (!sentence.trim()) continue;
    const parts = sentence.split(/(?<=,)\s*/);

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i].trim();
      if (!part) continue;

      const isLastPart = i === parts.length - 1;
      const endsWithSentence = /[.!?]$/.test(part);
      const endsWithComma = /,$/.test(part);

      let pauseMs = 500;
      if (endsWithSentence) pauseMs = 2000;
      else if (endsWithComma || !isLastPart) pauseMs = 1000;

      chunks.push({ text: part, pauseAfterMs: pauseMs });
    }
  }

  return chunks.length > 0 ? chunks : [{ text, pauseAfterMs: 1000 }];
}

export function speakWithPauses(
  text: string,
  gender: "female" | "male",
  options?: {
    rate?: number;
    pitch?: number;
    volume?: number;
    onStart?: () => void;
    onEnd?: () => void;
    onSpeaking?: (speaking: boolean) => void;
  }
): () => void {
  const synth = getSynth();
  if (!synth) {
    options?.onEnd?.();
    return () => {};
  }

  const chunks = splitTextWithPauses(text);
  let cancelled = false;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let currentIndex = 0;

  const speakNext = () => {
    if (cancelled || currentIndex >= chunks.length) {
      options?.onSpeaking?.(false);
      options?.onEnd?.();
      return;
    }

    const chunk = chunks[currentIndex];
    const utterance = createBrazilianUtterance(chunk.text, gender, {
      rate: options?.rate,
      pitch: options?.pitch,
      volume: options?.volume,
    });

    if (currentIndex === 0) options?.onStart?.();

    utterance.onstart = () => options?.onSpeaking?.(true);
    utterance.onend = () => {
      options?.onSpeaking?.(false);
      currentIndex++;
      if (!cancelled && currentIndex < chunks.length) {
        timeoutId = setTimeout(speakNext, chunk.pauseAfterMs);
      } else {
        options?.onEnd?.();
      }
    };
    utterance.onerror = () => {
      options?.onSpeaking?.(false);
      currentIndex++;
      if (!cancelled && currentIndex < chunks.length) {
        timeoutId = setTimeout(speakNext, 500);
      } else {
        options?.onEnd?.();
      }
    };

    synth.speak(utterance);
  };

  speakNext();

  return () => {
    cancelled = true;
    if (timeoutId) clearTimeout(timeoutId);
    cancelSpeech();
  };
}

export function createBrazilianUtterance(
  text: string,
  gender: "female" | "male",
  options?: { rate?: number; pitch?: number; volume?: number }
): SpeechSynthesisUtterance {
  const utterance = new SpeechSynthesisUtterance(text);
  const voice = getBrazilianVoice(gender);

  if (voice) {
    utterance.voice = voice;
  } else {
    const anyPt = loadVoices().find(v => v.lang?.toLowerCase().startsWith("pt"));
    if (anyPt) utterance.voice = anyPt;
  }

  utterance.lang = "pt-BR";

  const defaultRate = 0.75;
  const defaultPitch = gender === "female" ? 0.88 : 0.78;
  const defaultVolume = 0.85;

  utterance.rate = options?.rate ?? defaultRate;
  utterance.pitch = options?.pitch ?? defaultPitch;
  utterance.volume = options?.volume ?? defaultVolume;

  return utterance;
}

export function hasMaleVoice(): boolean {
  const allVoices = loadVoices();
  const ptBR = allVoices.filter(v => v.lang === "pt-BR" || v.lang === "pt_BR");
  return ptBR.some(v => MALE_HINTS.some(h => v.name.toLowerCase().includes(h)));
}

export function hasPtVoice(): boolean {
  return loadVoices().some(v => v.lang?.toLowerCase().startsWith("pt"));
}

export function getVoiceDisplayName(gender: "female" | "male"): string {
  const voice = getBrazilianVoice(gender);
  if (!voice) return "Voz padrão do sistema";
  return voice.name.replace(/Microsoft |Google |Apple /gi, "").trim();
}
