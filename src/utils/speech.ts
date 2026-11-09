// Web Speech Synthesis (TTS) and Web Speech Recognition (STT) for Vietnamese
// Optimized for senior citizens: High naturalness, correct pronunciation ("AI" -> "Ây-ai", "Đ/c" -> "đồng chí"), 
// robust sentence queueing that never cuts off mid-speech, and automatic voice enhancement.

let activeUtterances: SpeechSynthesisUtterance[] = [];
let speechQueue: string[] = [];
let isQueuePlaying = false;
let heartbeatInterval: any = null;
let currentOnEndCallback: (() => void) | null = null;
let currentOnErrorCallback: ((err: any) => void) | null = null;
let cachedVoices: SpeechSynthesisVoice[] = [];

// Ensure voices are cached as soon as available in browser
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  const updateVoices = () => {
    try {
      cachedVoices = window.speechSynthesis.getVoices();
    } catch {
      // Ignore
    }
  };
  updateVoices();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = updateVoices;
  }
}

export const isSpeechSynthesisSupported = (): boolean => {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
};

export const isSpeechRecognitionSupported = (): boolean => {
  return typeof window !== 'undefined' && 
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
};

/**
 * Phonetically and prosodically prepares Vietnamese text for natural, human-like TTS:
 * - Pronounces "AI" as "Ây-ai" (while preserving Vietnamese word "ai" like "gặp ai", "ai đó")
 * - Expands "Đ/c" or "đ/c" to "đồng chí"
 * - Expands administrative acronyms: UBND -> Ủy ban nhân dân, TTHC -> thủ tục hành chính, CCCD -> Căn cước công dân...
 * - Expands numbers and currency: 02 ngày -> hai ngày, 10.000 VNĐ -> mười nghìn đồng
 * - Removes markdown, URLs, brackets, and awkward symbols
 */
export const prepareVietnameseSpokenText = (rawText: string): string => {
  if (!rawText) return '';

  let text = rawText
    // Remove URLs
    .replace(/https?:\/\/\S+/g, '')
    // Remove markdown symbols: asterisks, hashtags, backticks, underscores, brackets
    .replace(/[*_#`~[\]]/g, ' ')
    // Normalize dashes and slashes
    .replace(/[-–—]/g, ' ')
    .replace(/\s+/g, ' ');

  // 1. Expand "Đ/c" / "đ/c" to "đồng chí"
  text = text
    .replace(/\bĐ\/c\.?\s*/gi, 'đồng chí ')
    .replace(/\bđ\/c\.?\s*/gi, 'đồng chí ')
    .replace(/\bĐc\.?\s+(?=[A-ZÀÁẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬÈÉẺẼẸÊẾỀỂỄỆÌÍỈĨỊÒÓỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÙÚỦŨỤƯỨỪỬỮỰỲÝỶỸỴĐ])/g, 'đồng chí ')
    .replace(/\bđc\.?\s+(?=[A-ZÀÁẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬÈÉẺẼẸÊẾỀỂỄỆÌÍỈĨỊÒÓỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÙÚỦŨỤƯỨỪỬỮỰỲÝỶỸỴĐ])/g, 'đồng chí ');

  // 2. Expand "AI" to "Ây ai" (ensuring exactly "Ây ai", never duplicate "Ây Ây ai", while preserving Vietnamese pronoun "ai")
  // First collapse any existing duplicate "Ây Ây" or "Ây-ai"
  text = text
    .replace(/Ây\s+Ây\s+ai/gi, 'Ây ai')
    .replace(/Ây-Ây-ai/gi, 'Ây ai')
    .replace(/Ây-ai/gi, 'Ây ai');

  // Replace exact uppercase AI, Ai, A.I. with Ây ai (never when preceded by Ây or Vi En)
  text = text.replace(/(?<!(?:Ây|ây|Vi\s+En|vi\s+en)\s*)\bA\.?I\.?\b/g, 'Ây ai');

  // Replace lowercase "ai" only when immediately tied to AI concepts: "trợ lý ai", "người máy ai"
  text = text
    .replace(/\b(trợ lý|người máy|công nghệ|hệ thống)\s+ai\b/gi, '$1 Ây ai');

  // Post-replacement safety deduplication:
  // If "Ây" was followed by another "Ây" or "Ây ai", collapse to single "Ây ai"
  text = text
    .replace(/Ây\s+Ây\s+ai/gi, 'Ây ai')
    .replace(/ây\s+ây\s+ai/gi, 'ây ai')
    .replace(/Ây\s+Ây/gi, 'Ây');

  // 3. Administrative Acronym Expansion for natural listening
  text = text
    .replace(/\bUBND\b/g, 'Ủy ban nhân dân')
    .replace(/\bTTHC\b/gi, 'thủ tục hành chính')
    .replace(/\bCCCD\b/g, 'Căn cước công dân')
    .replace(/\bBHYT\b/g, 'Bảo hiểm y tế')
    .replace(/\bVNe-?ID\b/gi, 'Vi En Ai đi')
    .replace(/\bvneid\b/gi, 'Vi En Ai đi')
    .replace(/\bTP\.?\s*Đà Nẵng\b/gi, 'Thành phố Đà Nẵng')
    .replace(/\bP\.?\s*Sơn Trà\b/gi, 'Phường Sơn Trà');

  // 4. Numbers and Currency normalization
  text = text
    // 01, 02, 03... ngày
    .replace(/\b01\s+ngày\b/gi, 'một ngày')
    .replace(/\b02\s+ngày\b/gi, 'hai ngày')
    .replace(/\b03\s+ngày\b/gi, 'ba ngày')
    .replace(/\b05\s+ngày\b/gi, 'năm ngày')
    // Currency: 10.000 VNĐ, 20.000 VNĐ...
    .replace(/(\d+)\.000\s*(?:VNĐ|vnd|đ|đồng)?/gi, '$1 nghìn đồng')
    .replace(/\bVNĐ\b|\bVND\b/gi, 'đồng')
    // Clean up residual parentheses
    .replace(/[()]/g, ', ');

  // Remove duplicate commas or spaces
  text = text
    .replace(/,\s*,+/g, ',')
    .replace(/\s+/g, ' ')
    .trim();

  return text;
};

/**
 * Finds the highest quality, most natural sounding Vietnamese voice available in the browser.
 * Prioritizes Microsoft Online (Natural) voices, Google Tiếng Việt, and Apple Enhanced voices.
 */
export const getVietnameseVoice = (): SpeechSynthesisVoice | null => {
  if (!isSpeechSynthesisSupported()) return null;
  
  let voices = cachedVoices;
  if (!voices || voices.length === 0) {
    try {
      voices = window.speechSynthesis.getVoices();
      cachedVoices = voices;
    } catch {
      voices = [];
    }
  }

  if (voices.length === 0) return null;

  // Filter Vietnamese voices
  const viVoices = voices.filter(v => 
    v.lang.toLowerCase().startsWith('vi') || 
    v.lang.toLowerCase().includes('vn') ||
    v.name.toLowerCase().includes('vietnam') ||
    v.name.toLowerCase().includes('vietnamese')
  );

  if (viVoices.length === 0) {
    // If no explicit vi voice, try default or first voice
    return voices[0] || null;
  }

  // Rank 1: Microsoft Natural / Online voices (e.g. Microsoft HoaiMy Online (Natural) - Vietnamese)
  const naturalVoice = viVoices.find(v => 
    v.name.toLowerCase().includes('natural') || 
    v.name.toLowerCase().includes('online') ||
    v.name.toLowerCase().includes('neural')
  );
  if (naturalVoice) return naturalVoice;

  // Rank 2: Google Vietnamese (Google Tiếng Việt)
  const googleVoice = viVoices.find(v => v.name.toLowerCase().includes('google'));
  if (googleVoice) return googleVoice;

  // Rank 3: Apple Enhanced / Premium Vietnamese voice
  const appleEnhanced = viVoices.find(v => 
    v.name.toLowerCase().includes('enhanced') || 
    v.name.toLowerCase().includes('premium')
  );
  if (appleEnhanced) return appleEnhanced;

  // Rank 4: Any vi-VN voice
  const standardViVN = viVoices.find(v => v.lang.toLowerCase() === 'vi-vn');
  if (standardViVN) return standardViVN;

  return viVoices[0];
};

/**
 * Clears speech queue and halts all ongoing speech synthesis immediately.
 */
export const stopSpeaking = () => {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
  isQueuePlaying = false;
  speechQueue = [];
  activeUtterances = [];

  if (isSpeechSynthesisSupported()) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {
      console.warn('Error cancelling speech synthesis:', e);
    }
  }

  if (currentOnEndCallback) {
    const cb = currentOnEndCallback;
    currentOnEndCallback = null;
    cb();
  }
};

/**
 * Splits long text into natural sentence-level chunks at punctuation boundaries (. ! ? ; \n).
 * This prevents the browser 15-second speech synthesis cutoff bug and produces
 * human-like pacing with natural breathing pauses between sentences.
 */
const splitIntoSentences = (text: string): string[] => {
  const normalized = text.replace(/([.!?;\n])\s+/g, '$1|');
  const rawParts = normalized.split('|');
  const sentences: string[] = [];

  for (let part of rawParts) {
    part = part.trim();
    if (!part) continue;

    // If a sentence is still unusually long (> 160 chars), break it at commas
    if (part.length > 160) {
      const subParts = part.split(/,\s+/);
      let buffer = '';
      for (const sub of subParts) {
        if ((buffer + ', ' + sub).length > 140) {
          if (buffer) sentences.push(buffer.trim());
          buffer = sub;
        } else {
          buffer = buffer ? `${buffer}, ${sub}` : sub;
        }
      }
      if (buffer.trim()) sentences.push(buffer.trim());
    } else {
      sentences.push(part);
    }
  }

  return sentences.length > 0 ? sentences : [text];
};

/**
 * High-quality, robust Vietnamese speech synthesis.
 * Uses sentence queueing to prevent premature cut-off and applies phonetic expansions.
 */
export const speakText = (
  text: string, 
  speed: number = 0.9, 
  onStart?: () => void, 
  onEnd?: () => void,
  onError?: (err: any) => void
) => {
  if (!isSpeechSynthesisSupported()) {
    console.warn('Speech synthesis not supported in this browser.');
    onError?.('Trình duyệt không hỗ trợ đọc giọng nói');
    return;
  }

  // Stop any previous speech & reset queue
  stopSpeaking();

  const preparedText = prepareVietnameseSpokenText(text);
  if (!preparedText) return;

  const sentences = splitIntoSentences(preparedText);
  if (sentences.length === 0) return;

  speechQueue = [...sentences];
  isQueuePlaying = true;
  currentOnEndCallback = onEnd || null;
  currentOnErrorCallback = onError || null;

  // Signal speech start
  onStart?.();

  // Chromium keep-alive heartbeat: prevents speech engine from pausing indefinitely on long passages
  if (heartbeatInterval) clearInterval(heartbeatInterval);
  heartbeatInterval = setInterval(() => {
    if (isQueuePlaying && window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      try {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      } catch {
        // Ignore
      }
    }
  }, 7000);

  // Play next sentence in queue
  const playNext = () => {
    if (!isQueuePlaying) return;

    if (speechQueue.length === 0) {
      // Completed all sentences
      isQueuePlaying = false;
      if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
        heartbeatInterval = null;
      }
      activeUtterances = [];
      const cb = currentOnEndCallback;
      currentOnEndCallback = null;
      cb?.();
      return;
    }

    const currentSentence = speechQueue.shift()!;
    const utterance = new SpeechSynthesisUtterance(currentSentence);
    utterance.lang = 'vi-VN';
    // Gentle, natural reading speed (0.88 - 0.92 is optimal for elderly citizens)
    utterance.rate = Math.max(0.75, Math.min(1.2, speed || 0.9));
    utterance.pitch = 1.0;

    const voice = getVietnameseVoice();
    if (voice) {
      utterance.voice = voice;
    }

    // Keep global reference so browser garbage collector does not destroy it
    activeUtterances.push(utterance);
    (window as any).__activeSpeechUtterance = utterance;

    utterance.onend = () => {
      // Natural human breathing pause between sentences (120ms - 180ms)
      setTimeout(() => {
        if (isQueuePlaying) {
          playNext();
        }
      }, 140);
    };

    utterance.onerror = (e: any) => {
      console.warn('Utterance error or interrupted:', e);
      if (e.error === 'interrupted' || e.error === 'canceled') {
        // Normal cancel by user
        return;
      }
      // On error, attempt next sentence rather than breaking completely
      setTimeout(() => {
        if (isQueuePlaying) {
          playNext();
        }
      }, 100);
    };

    try {
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error('Error invoking speak:', err);
      currentOnErrorCallback?.(err);
    }
  };

  playNext();
};

// Normalize Vietnamese string for robust fuzzy matching
export const removeVietnameseTones = (str: string): string => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
};

export interface VoiceRecognitionHandlers {
  onResult: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
}

export class VoiceRecognizer {
  private recognition: any = null;
  private isListening: boolean = false;

  constructor(private handlers: VoiceRecognitionHandlers) {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.lang = 'vi-VN';
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.maxAlternatives = 3;

        this.recognition.onstart = () => {
          this.isListening = true;
          this.handlers.onStart?.();
        };

        this.recognition.onresult = (event: any) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }

          if (finalTranscript) {
            this.handlers.onResult(finalTranscript.trim(), true);
          } else if (interimTranscript) {
            this.handlers.onResult(interimTranscript.trim(), false);
          }
        };

        this.recognition.onerror = (event: any) => {
          this.isListening = false;
          let errorMessage = 'Không nhận diện được giọng nói';
          if (event.error === 'not-allowed') {
            errorMessage = 'Vui lòng cho phép truy cập micro để thu âm';
          } else if (event.error === 'no-speech') {
            errorMessage = 'Chưa nghe thấy giọng nói, xin thử lại';
          }
          this.handlers.onError?.(errorMessage);
        };

        this.recognition.onend = () => {
          this.isListening = false;
          this.handlers.onEnd?.();
        };
      }
    }
  }

  public start() {
    if (!this.recognition) {
      this.handlers.onError?.('Trình duyệt chưa hỗ trợ nhận diện giọng nói trực tiếp');
      return;
    }
    if (this.isListening) return;

    try {
      this.recognition.start();
    } catch (e) {
      console.warn('Error starting recognition:', e);
    }
  }

  public stop() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        console.warn('Error stopping recognition:', e);
      }
    }
  }
}
