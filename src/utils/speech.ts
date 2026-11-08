// Web Speech Synthesis (TTS) and Web Speech Recognition (STT) for Vietnamese

let activeUtterance: SpeechSynthesisUtterance | null = null;

export const isSpeechSynthesisSupported = (): boolean => {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
};

export const isSpeechRecognitionSupported = (): boolean => {
  return typeof window !== 'undefined' && 
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
};

export const getVietnameseVoice = (): SpeechSynthesisVoice | null => {
  if (!isSpeechSynthesisSupported()) return null;
  const voices = window.speechSynthesis.getVoices();
  // Try finding a Vietnamese voice
  const viVoice = voices.find(v => v.lang.toLowerCase().startsWith('vi') || v.lang.toLowerCase().includes('vn'));
  return viVoice || (voices.length > 0 ? voices[0] : null);
};

export const stopSpeaking = () => {
  if (isSpeechSynthesisSupported()) {
    window.speechSynthesis.cancel();
    activeUtterance = null;
  }
};

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

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  // Clean text of markdown or URLs
  const cleanText = text
    .replace(/[*_#`~[\]]/g, ' ')
    .replace(/https?:\/\/\S+/g, '')
    .trim();

  if (!cleanText) return;

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = 'vi-VN';
  utterance.rate = Math.max(0.7, Math.min(1.5, speed));
  utterance.pitch = 1.0;

  const voice = getVietnameseVoice();
  if (voice) {
    utterance.voice = voice;
  }

  utterance.onstart = () => {
    onStart?.();
  };

  utterance.onend = () => {
    activeUtterance = null;
    onEnd?.();
  };

  utterance.onerror = (e) => {
    activeUtterance = null;
    console.error('Speech synthesis error:', e);
    onError?.(e);
  };

  activeUtterance = utterance;
  window.speechSynthesis.speak(utterance);
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
      console.error('Error starting recognition:', e);
    }
  }

  public stop() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        console.error('Error stopping recognition:', e);
      }
    }
  }
}
