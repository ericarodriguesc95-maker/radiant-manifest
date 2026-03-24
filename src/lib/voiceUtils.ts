/**
 * Centralized pt-BR voice selection utility.
 * Elite voice prioritization with meditative speech configuration.
 * Includes SSML-like pause engineering for guided meditation.
 */

let voicesLoaded = false;
let cachedVoices: SpeechSynthesisVoice[] = [];

function loadVoices(): SpeechSynthesisVoice[] {
  cachedVoices = window.speechSynthesis.getVoices();
  if (cachedVoices.length > 0) voicesLoaded = true;
  return cachedVoices;
}

/** Ensures voices are loaded before use. Returns a promise that resolves when ready. */
export function ensureVoicesLoaded(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const voices = loadVoices();
    if (voices.length > 0) {
      resolve(voices);
      return;
    }
    const handler = () => {
      const v = loadVoices();
      resolve(v);
      window.speechSynthesis.removeEventListener("voiceschanged", handler);
    };
    window.speechSynthesis.addEventListener("voiceschanged", handler);
    setTimeout(() => {
      const v = loadVoices();
      resolve(v);
    }, 2000);
  });
}

// Elite voice names — prioritize Natural/Neural/Premium quality voices
const FEMALE_PREFERRED = [
  // Microsoft Neural voices (highest quality on Windows/Edge)
  "microsoft francisca online",
  "microsoft francisca",
  // Apple premium voices
  "luciana",
  "vitória",
  "vitoria",
  // Google Neural
  "google português do brasil",
  // Other high-quality
  "francisca",
  "maria",
  "thalita",
  "fernanda",
  "google",
];

const MALE_PREFERRED = [
  // Microsoft Neural voices
  "microsoft antonio online",
  "microsoft antonio",
  // Apple premium voices
  "felipe",
  // Google Neural
  "google português do brasil masculino",
  // Other
  "daniel",
  "rodrigo",
  "antonio",
  "ricardo",
];

const FEMALE_HINTS = ["female", "feminina", "mulher", "francisca", "maria", "luciana", "thalita", "fernanda", "vitória", "vitoria"];
const MALE_HINTS = ["male", "masculin", "homem", "daniel", "rodrigo", "felipe", "antonio", "ricardo"];

// Quality indicators — prefer voices with these tags
const QUALITY_TAGS = ["online", "neural", "natural", "premium", "enhanced"];

/**
 * Get the best pt-BR voice for the given gender.
 * Prioritizes Neural/Natural/Premium quality voices for a meditative experience.
 */
export function getBrazilianVoice(gender: "female" | "male"): SpeechSynthesisVoice | null {
  const allVoices = loadVoices();
  
  // Strict pt-BR filter
  const ptBRVoices = allVoices.filter(v => v.lang === "pt-BR" || v.lang === "pt_BR");
  // Broader pt filter as fallback
  const ptVoices = allVoices.filter(v => v.lang.startsWith("pt"));

  const preferred = gender === "female" ? FEMALE_PREFERRED : MALE_PREFERRED;
  const genderHints = gender === "female" ? FEMALE_HINTS : MALE_HINTS;
  const oppositeHints = gender === "female" ? MALE_HINTS : FEMALE_HINTS;

  // Helper: check if voice has quality indicators
  const isHighQuality = (v: SpeechSynthesisVoice) =>
    QUALITY_TAGS.some(tag => v.name.toLowerCase().includes(tag));

  // 1. Try preferred names in pt-BR voices, preferring high-quality
  for (const pref of preferred) {
    const match = ptBRVoices.find(v => v.name.toLowerCase().includes(pref));
    if (match) {
      const isOpposite = oppositeHints.some(h => match.name.toLowerCase().includes(h));
      if (pref === "google português do brasil" && gender === "male") continue;
      if (!isOpposite) return match;
    }
  }

  // 2. Try high-quality pt-BR voices with gender hints
  const highQualityGender = ptBRVoices.find(v =>
    isHighQuality(v) && genderHints.some(h => v.name.toLowerCase().includes(h))
  );
  if (highQualityGender) return highQualityGender;

  // 3. Try any pt-BR voice with gender hints
  const genderMatch = ptBRVoices.find(v =>
    genderHints.some(h => v.name.toLowerCase().includes(h))
  );
  if (genderMatch) return genderMatch;

  // 4. For female: prefer first pt-BR voice (usually female by default)
  if (gender === "female" && ptBRVoices.length > 0) {
    return ptBRVoices[0];
  }
  if (gender === "male") {
    const notFemale = ptBRVoices.find(v =>
      !FEMALE_HINTS.some(h => v.name.toLowerCase().includes(h))
    );
    if (notFemale) return notFemale;
  }

  // 5. Fallback to broader pt voices
  if (ptVoices.length > 0) {
    const ptGender = ptVoices.find(v => genderHints.some(h => v.name.toLowerCase().includes(h)));
    if (ptGender) return ptGender;
    return ptVoices[0];
  }

  return null;
}

/**
 * Insert SSML-like pauses into text for meditative speech.
 * Splits text at sentence/comma boundaries and returns chunks with pause durations.
 */
export function splitTextWithPauses(text: string): Array<{ text: string; pauseAfterMs: number }> {
  const chunks: Array<{ text: string; pauseAfterMs: number }> = [];
  
  // Split by sentences (period, exclamation, question mark)
  const sentences = text.split(/(?<=[.!?])\s+/);
  
  for (const sentence of sentences) {
    if (!sentence.trim()) continue;
    
    // Split each sentence by commas for sub-pauses
    const parts = sentence.split(/(?<=,)\s*/);
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i].trim();
      if (!part) continue;
      
      const isLastPart = i === parts.length - 1;
      // Sentence end = 2s pause, comma = 1s pause
      const endsWithSentence = /[.!?]$/.test(part);
      const endsWithComma = /,$/.test(part);
      
      let pauseMs = 500; // default small pause
      if (endsWithSentence) pauseMs = 2000;
      else if (endsWithComma || !isLastPart) pauseMs = 1000;
      
      chunks.push({ text: part, pauseAfterMs: pauseMs });
    }
  }
  
  return chunks.length > 0 ? chunks : [{ text, pauseAfterMs: 1000 }];
}

/**
 * Speak text with meditative pauses between sentences/clauses.
 * Returns a cleanup function to cancel speech.
 */
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

    if (currentIndex === 0) {
      options?.onStart?.();
    }

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

    window.speechSynthesis.speak(utterance);
  };

  speakNext();

  return () => {
    cancelled = true;
    if (timeoutId) clearTimeout(timeoutId);
    window.speechSynthesis.cancel();
  };
}

/**
 * Create a properly configured SpeechSynthesisUtterance for pt-BR.
 * Meditative defaults: rate 0.8, pitch 0.9 (female) / 0.8 (male)
 */
export function createBrazilianUtterance(
  text: string,
  gender: "female" | "male",
  options?: {
    rate?: number;
    pitch?: number;
    volume?: number;
  }
): SpeechSynthesisUtterance {
  const utterance = new SpeechSynthesisUtterance(text);
  const voice = getBrazilianVoice(gender);
  
  if (voice) {
    utterance.voice = voice;
  }
  
  utterance.lang = "pt-BR";
  
  // Meditative defaults: slow, calm, reflective
  const defaultRate = 0.8;
  const defaultPitch = gender === "female" ? 0.9 : 0.8;
  
  utterance.rate = options?.rate ?? defaultRate;
  utterance.pitch = options?.pitch ?? defaultPitch;
  utterance.volume = options?.volume ?? 1;
  
  return utterance;
}

/**
 * Check if a real male pt-BR voice is available.
 */
export function hasMaleVoice(): boolean {
  const allVoices = loadVoices();
  const ptBR = allVoices.filter(v => v.lang === "pt-BR" || v.lang === "pt_BR");
  return ptBR.some(v => MALE_HINTS.some(h => v.name.toLowerCase().includes(h)));
}

/**
 * Get the display name of the current voice for transparency.
 */
export function getVoiceDisplayName(gender: "female" | "male"): string {
  const voice = getBrazilianVoice(gender);
  if (!voice) return "Voz padrão do sistema";
  // Clean up name for display
  return voice.name.replace(/Microsoft |Google |Apple /gi, "").trim();
}
