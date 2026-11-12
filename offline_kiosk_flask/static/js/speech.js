// Web Speech Synthesis (TTS) & Recognition (STT) cho Kiosk Offline
// Chuẩn hóa phát âm tiếng Việt: "AI" -> "Ây ai", "Đ/c" -> "đồng chí", "BHYT" -> "bảo hiểm i tế", "VNeID" -> "Vi En Ai đi"

let activeUtterances = [];
let speechQueue = [];
let isQueuePlaying = false;
let heartbeatInterval = null;
let currentOnEndCallback = null;
let currentOnErrorCallback = null;
let cachedVoices = [];

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  const updateVoices = () => {
    try {
      cachedVoices = window.speechSynthesis.getVoices();
    } catch (e) {
      // Ignore
    }
  };
  updateVoices();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = updateVoices;
  }
}

export function isSpeechSynthesisSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function isSpeechRecognitionSupported() {
  return typeof window !== 'undefined' && 
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
}

export function prepareVietnameseSpokenText(rawText) {
  if (!rawText) return '';

  let text = rawText
    .replace(/https?:\/\/\S+/g, '')
    .replace(/[*_#`~[\]]/g, ' ')
    .replace(/[-–—]/g, ' ');

  // 1. Mở rộng "Đ/c" / "đ/c" thành "đồng chí"
  text = text
    .replace(/[Đđ]\/c\.?\s*/gi, 'đồng chí ')
    .replace(/(?:\b|^)[Đđ]c\.?\s+(?=[A-ZÀ-Ỹ])/g, 'đồng chí ');

  // 2. Dấu gạch chéo lựa chọn: "Bệnh viện / Trạm y tế" -> "Bệnh viện hoặc Trạm y tế"
  const VIET_CHARS = 'a-zA-Z0-9àáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđÀÁẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬÈÉẺẼẸÊẾỀỂỄỆÌÍỈĨỊÒÓỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÙÚỦŨỤƯỨỪỬỮỰỲÝỶỸỴĐ';
  text = text.replace(new RegExp('([' + VIET_CHARS + ']+)\\s*\\/\\s*([' + VIET_CHARS + ']+)', 'g'), '$1 hoặc $2');
  text = text.replace(/\//g, ' ');
  text = text.replace(/\s+/g, ' ');

  // 3. Chuẩn hóa "AI" thành duy nhất "Ây ai"
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

  // 4. Mở rộng từ viết tắt hành chính
  text = text
    .replace(/\bUBND\b/g, 'Ủy ban nhân dân')
    .replace(/\bTTHC\b/gi, 'thủ tục hành chính')
    .replace(/\bCCCD\b/g, 'Căn cước công dân')
    // BHYT: đọc là bảo hiểm i tế (nghe đúng là bảo hiểm y tế, không bị đọc chữ "y dài")
    .replace(/\bBHYT\b/gi, 'bảo hiểm i tế')
    // VNeID: đọc là "Vi En Ai đi"
    .replace(/\bVNe-?ID\b/gi, 'Vi En Ai đi')
    .replace(/\bvneid\b/gi, 'Vi En Ai đi')
    .replace(/\bTP\.?\s*Đà Nẵng\b/gi, 'Thành phố Đà Nẵng')
    .replace(/\bP\.?\s*Sơn Trà\b/gi, 'Phường Sơn Trà');

  // 5. Chuẩn hóa chữ "y" đơn lẻ thành âm "i", không đọc "y dài"
  text = text.replace(new RegExp('(?<![' + VIET_CHARS + '])[Yy]\\s+tế(?![' + VIET_CHARS + '])', 'g'), 'i tế');
  text = text.replace(new RegExp('(?<![' + VIET_CHARS + '])[Yy](?![' + VIET_CHARS + '])', 'g'), 'i');

  // 6. Số ngày và tiền tệ
  text = text
    .replace(/\b01\s+ngày\b/gi, 'một ngày')
    .replace(/\b02\s+ngày\b/gi, 'hai ngày')
    .replace(/\b03\s+ngày\b/gi, 'ba ngày')
    .replace(/\b05\s+ngày\b/gi, 'năm ngày')
    .replace(/(\d+)\.000\s*(?:VNĐ|vnd|đ|đồng)?/gi, '$1 nghìn đồng')
    .replace(/\bVNĐ\b|\bVND\b/gi, 'đồng')
    .replace(/[()]/g, ', ');

  return text.trim();
}

export function getVietnameseVoice() {
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

  const viVoices = voices.filter(v => 
    v.lang.toLowerCase().startsWith('vi') || 
    v.lang.toLowerCase().includes('vn') ||
    v.name.toLowerCase().includes('vietnam')
  );

  if (viVoices.length === 0) return voices[0] || null;

  // Ưu tiên Microsoft Natural / Online / Google Tiếng Việt
  const natural = viVoices.find(v => 
    v.name.toLowerCase().includes('natural') || 
    v.name.toLowerCase().includes('online') || 
    v.name.toLowerCase().includes('neural')
  );
  if (natural) return natural;

  const google = viVoices.find(v => v.name.toLowerCase().includes('google'));
  if (google) return google;

  return viVoices[0];
}

export function stopSpeaking() {
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
      console.warn('Speech cancel error:', e);
    }
  }

  if (currentOnEndCallback) {
    const cb = currentOnEndCallback;
    currentOnEndCallback = null;
    cb();
  }
}

function splitIntoSentences(text) {
  const normalized = text.replace(/([.!?;\n])\s+/g, '$1|');
  const rawParts = normalized.split('|');
  const sentences = [];

  for (let part of rawParts) {
    part = part.trim();
    if (!part) continue;

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
}

export function speakText(text, speed = 0.90, onStart, onEnd, onError) {
  if (!isSpeechSynthesisSupported()) {
    onError && onError('Trình duyệt không hỗ trợ đọc giọng nói');
    return;
  }

  stopSpeaking();
  const preparedText = prepareVietnameseSpokenText(text);
  if (!preparedText) return;

  const sentences = splitIntoSentences(preparedText);
  if (sentences.length === 0) return;

  speechQueue = [...sentences];
  isQueuePlaying = true;
  currentOnEndCallback = onEnd || null;
  currentOnErrorCallback = onError || null;

  onStart && onStart();

  if (heartbeatInterval) clearInterval(heartbeatInterval);
  heartbeatInterval = setInterval(() => {
    if (isQueuePlaying && window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      try {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      } catch (e) {}
    }
  }, 7000);

  const playNext = () => {
    if (!isQueuePlaying) return;

    if (speechQueue.length === 0) {
      isQueuePlaying = false;
      if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
        heartbeatInterval = null;
      }
      activeUtterances = [];
      const cb = currentOnEndCallback;
      currentOnEndCallback = null;
      cb && cb();
      return;
    }

    const currentSentence = speechQueue.shift();
    const utterance = new SpeechSynthesisUtterance(currentSentence);
    utterance.lang = 'vi-VN';
    utterance.rate = Math.max(0.75, Math.min(1.2, speed || 0.90));
    utterance.pitch = 1.0;

    const voice = getVietnameseVoice();
    if (voice) {
      utterance.voice = voice;
    }

    activeUtterances.push(utterance);
    window.__activeSpeechUtterance = utterance;

    utterance.onend = () => {
      setTimeout(() => {
        if (isQueuePlaying) {
          playNext();
        }
      }, 140);
    };

    utterance.onerror = (e) => {
      if (e.error === 'interrupted' || e.error === 'canceled') return;
      setTimeout(() => {
        if (isQueuePlaying) {
          playNext();
        }
      }, 100);
    };

    try {
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      currentOnErrorCallback && currentOnErrorCallback(err);
    }
  };

  playNext();
}

export class VoiceRecognizer {
  constructor(handlers) {
    this.handlers = handlers;
    this.recognition = null;
    this.isListening = false;

    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.lang = 'vi-VN';
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.maxAlternatives = 3;

        this.recognition.onstart = () => {
          this.isListening = true;
          this.handlers.onStart && this.handlers.onStart();
        };

        this.recognition.onresult = (event) => {
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

        this.recognition.onerror = (event) => {
          this.isListening = false;
          let errorMessage = 'Không nhận diện được giọng nói';
          if (event.error === 'not-allowed') {
            errorMessage = 'Vui lòng cho phép truy cập micro để thu âm';
          } else if (event.error === 'no-speech') {
            errorMessage = 'Chưa nghe thấy giọng nói, xin thử lại';
          }
          this.handlers.onError && this.handlers.onError(errorMessage);
        };

        this.recognition.onend = () => {
          this.isListening = false;
          this.handlers.onEnd && this.handlers.onEnd();
        };
      }
    }
  }

  start() {
    if (!this.recognition) {
      this.handlers.onError && this.handlers.onError('Trình duyệt chưa hỗ trợ nhận diện giọng nói trực tiếp');
      return;
    }
    if (this.isListening) return;
    try {
      this.recognition.start();
    } catch (e) {
      console.warn('Error starting recognition:', e);
    }
  }

  stop() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        console.warn('Error stopping recognition:', e);
      }
    }
  }
}
