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

  const VIET_CHARS = 'a-zA-Z0-9àáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđÀÁẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬÈÉẺẼẸÊẾỀỂỄỆÌÍỈĨỊÒÓỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÙÚỦŨỤƯỨỪỬỮỰỲÝỶỸỴĐ';

  let text = rawText
    // Remove URLs
    .replace(/https?:\/\/\S+/g, '')
    // Remove markdown symbols: asterisks, hashtags, backticks, underscores, brackets
    .replace(/[*_#`~[\]]/g, ' ')
    .replace(/\s+/g, ' ');

  // 0. Expand time and numeric ranges BEFORE removing dashes:
  // e.g. "07h30 - 11h30" -> "từ 7 giờ 30 đến 11 giờ 30", "15 - 30 ngày" -> "từ 15 đến 30 ngày"
  text = text
    .replace(/\b0?(\d{1,2})h00\b/gi, '$1 giờ')
    .replace(/\b0?(\d{1,2})h(\d{2})\b/gi, '$1 giờ $2')
    .replace(/(Thứ\s+\d)\s*[-–—]\s*(Thứ\s+\d)/gi, '$1 đến $2')
    // Range already preceded by "từ" or "từ đủ" -> only convert dash to "đến"
    .replace(/(từ\s+(?:đủ\s+)?)(\d+(?:\s*giờ(?:\s*\d+)?)?)\s*[-–—]\s*(\d+(?:\s*giờ(?:\s*\d+)?)?)/gi, '$1$2 đến $3')
    // Standalone range like "15 - 30 ngày", "10-15 phút", "15 - 30 phút" -> "từ 15 đến 30 ..."
    .replace(/(\d+(?:\s*giờ(?:\s*\d+)?)?)\s*[-–—]\s*(\d+(?:\s*giờ(?:\s*\d+)?)?)/gi, 'từ $1 đến $2');

  // Now normalize remaining standalone dashes
  text = text
    .replace(/[-–—]/g, ' ')
    .replace(/\s+/g, ' ');

  // 1. Expand "Đ/c" / "đ/c" to "đồng chí" (handle Đ without ASCII \b boundary)
  text = text
    .replace(/[Đđ]\/c\.?\s*/gi, 'đồng chí ')
    .replace(/(?:\b|^)[Đđ]c\.?\s+(?=[A-ZÀ-Ỹ])/g, 'đồng chí ');

  // 2. Slashes between alternatives: "Bệnh viện / Trạm y tế" -> "Bệnh viện hoặc Trạm y tế"
  text = text.replace(new RegExp('([' + VIET_CHARS + ']+)\\s*\\/\\s*([' + VIET_CHARS + ']+)', 'g'), '$1 hoặc $2');
  text = text.replace(/\//g, ' ');
  text = text.replace(/\s+/g, ' ');

  // 3. Expand "AI" to "Ây ai" (ensuring exactly "Ây ai", never duplicate "Ây Ây ai", while preserving Vietnamese pronoun "ai")
  text = text
    .replace(/Ây\s+Ây\s+ai/gi, 'Ây ai')
    .replace(/Ây-Ây-ai/gi, 'Ây ai')
    .replace(/Ây-ai/gi, 'Ây ai');

  text = text.replace(/(?<!(?:Ây|ây|Vi\s+En|vi\s+en)\s*)\bA\.?I\.?\b/g, 'Ây ai');
  text = text.replace(/\b(trợ lý|người máy|công nghệ|hệ thống)\s+ai\b/gi, '$1 Ây ai');

  text = text
    .replace(/Ây\s+Ây\s+ai/gi, 'Ây ai')
    .replace(/ây\s+ây\s+ai/gi, 'ây ai')
    .replace(/Ây\s+Ây/gi, 'Ây');

  // 4. Administrative Acronym Expansion
  text = text
    .replace(/\bUBND\b/g, 'Ủy ban nhân dân')
    .replace(/\bTTHC\b/gi, 'thủ tục hành chính')
    .replace(/\bCCCD\b/g, 'Căn cước công dân')
    // BHYT: read as "bảo hiểm i tế" so voice engine does not pronounce "y dài"
    .replace(/\bBHYT\b/g, 'bảo hiểm i tế')
    .replace(/\bVNe-?ID\b/gi, 'Vi En Ai đi')
    .replace(/\bvneid\b/gi, 'Vi En Ai đi')
    .replace(/\bTP\.?\s*Đà Nẵng\b/gi, 'Thành phố Đà Nẵng')
    .replace(/\bP\.?\s*Sơn Trà\b/gi, 'Phường Sơn Trà');

  // 5. Ensure letter "y" is read as vowel sound "i", never spelled out as "y dài"
  text = text.replace(new RegExp('(?<![' + VIET_CHARS + '])[Yy]\\s+tế(?![' + VIET_CHARS + '])', 'g'), 'i tế');
  text = text.replace(new RegExp('(?<![' + VIET_CHARS + '])[Yy](?![' + VIET_CHARS + '])', 'g'), 'i');

  // 6. Numbers and Currency normalization
  text = text
    // 01, 02, 03... ngày / tháng / phút / giờ
    .replace(/\b01\s+(ngày|tháng|năm|phút|giờ|bản|lần)\b/gi, 'một $1')
    .replace(/\b02\s+(ngày|tháng|năm|phút|giờ|bản|lần)\b/gi, 'hai $1')
    .replace(/\b03\s+(ngày|tháng|năm|phút|giờ|bản|lần)\b/gi, 'ba $1')
    .replace(/\b04\s+(ngày|tháng|năm|phút|giờ|bản|lần)\b/gi, 'bốn $1')
    .replace(/\b05\s+(ngày|tháng|năm|phút|giờ|bản|lần)\b/gi, 'năm $1')
    .replace(/\b0([6-9])\s+(ngày|tháng|năm|phút|giờ|bản|lần)\b/gi, '$1 $2')
    .replace(/\b0(\d)\s+đến\b/gi, '$1 đến')
    .replace(/\bđến\s+0(\d)\b/gi, 'đến $1')
    // Currency: 10.000 VNĐ, 20.000 VNĐ...
    .replace(/(\d+)\.000\s*(?:VNĐ|vnd|đ|đồng)?/gi, '$1 nghìn đồng')
    .replace(/\bVNĐ\b|\bVND\b/gi, 'đồng')
    // Clean up residual parentheses
    .replace(/[()]/g, ', ');

  // 7. Deduplicate repeated consecutive administrative phrases & words (e.g. "thủ tục Thủ tục" -> "thủ tục", "từ từ 15" -> "từ 15")
  const DUP_PHRASES = '(?:thủ tục hành chính|thủ tục|hồ sơ|giấy tờ|lệ phí|chi phí|đăng ký|chứng thực|xác nhận|đồng chí|bảo hiểm|căn cước|trợ lý|tờ khai|bản chính|bản sao|thời hạn|thời gian|kết quả|bệnh viện|trạm i tế|ủy ban|miễn phí|bắt buộc|bước|bàn|ô|số|mã|trang|lần)';
  text = text
    .replace(new RegExp('(?<![' + VIET_CHARS + '])miễn\\s+phí\\s+lệ\\s+phí(?![' + VIET_CHARS + '])', 'gi'), 'miễn phí')
    .replace(new RegExp('(?<![' + VIET_CHARS + '])từ\\s+từ(?=\\s+(?:đủ\\s+)?\\d)', 'gi'), 'từ')
    .replace(new RegExp('(?<![' + VIET_CHARS + '])(' + DUP_PHRASES + ')\\s+\\1(?![' + VIET_CHARS + '])', 'gi'), '$1')
    // Run a second pass in case triple repetition occurred
    .replace(new RegExp('(?<![' + VIET_CHARS + '])(' + DUP_PHRASES + ')\\s+\\1(?![' + VIET_CHARS + '])', 'gi'), '$1')
    // Remove duplicate/stray punctuation and spaces
    .replace(/,\s*([.!?])/g, '$1')
    .replace(/,\s*,+/g, ',')
    .replace(/\s+,/g, ',')
    .replace(/,\s*$/g, '')
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
