/**
 * Centralized pt-BR voice selection utility.
 * Ensures strict Brazilian Portuguese voices with proper gender filtering.
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
    // Some browsers load voices asynchronously
    const handler = () => {
      const v = loadVoices();
      resolve(v);
      window.speechSynthesis.removeEventListener("voiceschanged", handler);
    };
    window.speechSynthesis.addEventListener("voiceschanged", handler);
    // Fallback timeout
    setTimeout(() => {
      const v = loadVoices();
      resolve(v);
    }, 2000);
  });
}

// Preferred voice names by gender (priority order)
const FEMALE_PREFERRED = [
  "google português do brasil",
  "microsoft francisca",
  "francisca",
  "maria",
  "luciana",
  "thalita",
  "fernanda",
  "vitória",
  "google",
];

const MALE_PREFERRED = [
  "google português do brasil",
  "microsoft daniel",
  "daniel",
  "rodrigo",
  "felipe",
  "antonio",
  "ricardo",
];

const FEMALE_HINTS = ["female", "feminina", "mulher", "francisca", "maria", "luciana", "thalita", "fernanda", "vitória"];
const MALE_HINTS = ["male", "masculin", "homem", "daniel", "rodrigo", "felipe", "antonio", "ricardo"];

/**
 * Get the best pt-BR voice for the given gender.
 * Strict: only returns voices with lang exactly "pt-BR" or starting with "pt-BR".
 * Falls back to any "pt" voice, then null.
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

  // 1. Try preferred names in pt-BR voices
  for (const pref of preferred) {
    const match = ptBRVoices.find(v => v.name.toLowerCase().includes(pref));
    if (match) {
      // Make sure it's not the opposite gender
      const isOpposite = oppositeHints.some(h => match.name.toLowerCase().includes(h));
      // Skip "Google Português do Brasil" for male if we can find a real male voice
      if (pref === "google português do brasil" && gender === "male") continue;
      if (!isOpposite) return match;
    }
  }

  // 2. Try gender hint matching in pt-BR voices
  const genderMatch = ptBRVoices.find(v => 
    genderHints.some(h => v.name.toLowerCase().includes(h))
  );
  if (genderMatch) return genderMatch;

  // 3. For female: prefer first pt-BR voice (usually female by default)
  // For male: try to find one that's NOT female-hinted
  if (gender === "female" && ptBRVoices.length > 0) {
    return ptBRVoices[0];
  }
  if (gender === "male") {
    const notFemale = ptBRVoices.find(v => 
      !FEMALE_HINTS.some(h => v.name.toLowerCase().includes(h))
    );
    if (notFemale) return notFemale;
  }

  // 4. Fallback to broader pt voices
  if (ptVoices.length > 0) {
    const ptGender = ptVoices.find(v => genderHints.some(h => v.name.toLowerCase().includes(h)));
    if (ptGender) return ptGender;
    return ptVoices[0];
  }

  return null;
}

/**
 * Create a properly configured SpeechSynthesisUtterance for pt-BR.
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
  
  // Default rates optimized for calm, reflective Brazilian speech
  const defaultRate = gender === "female" ? 0.9 : 0.88;
  const defaultPitch = gender === "female" ? 1.1 : 0.85;
  
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
