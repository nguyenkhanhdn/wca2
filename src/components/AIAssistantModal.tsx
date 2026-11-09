import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  X, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Clock, 
  CreditCard, 
  FileText, 
  CheckCircle2, 
  UserCheck, 
  ArrowRight, 
  Sparkles, 
  Printer, 
  RotateCcw,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Building2,
  Check
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AIAssistantIcon } from './AIAssistantIcon';
import { VoiceRecognizer, speakText, stopSpeaking } from '../utils/speech';
import { analyzeCitizenSpeech, AIAnalysisResult } from '../utils/aiAssistant';
import { PublicService } from '../types';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const INACTIVITY_TIMEOUT_SECONDS = 25;

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose
}) => {
  const { 
    currentWardServices, 
    currentWardCounters, 
    currentWardOfficers, 
    selectedWard,
    selectService,
    selectCounter,
    setCurrentScreen 
  } = useApp();

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [customInput, setCustomInput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSpeakingState, setIsSpeakingState] = useState(false);
  
  // Current conversational state
  const [currentResult, setCurrentResult] = useState<AIAnalysisResult | null>(null);
  const [isConfirmedGoodbye, setIsConfirmedGoodbye] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(INACTIVITY_TIMEOUT_SECONDS);

  const recognizerRef = useRef<VoiceRecognizer | null>(null);
  const countdownTimerRef = useRef<any>(null);
  const goodbyeTimerRef = useRef<any>(null);
  const isSpeakingStateRef = useRef<boolean>(false);
  const isListeningRef = useRef<boolean>(false);

  // Suggested spoken phrases for quick elderly citizen tapping
  const POPULAR_QUERIES = [
    'Làm giấy khai sinh cho cháu',
    'Đăng ký kết hôn',
    'Sao y công chứng căn cước',
    'Chứng thực chữ ký sơ yếu lý lịch',
    'Xác nhận độc thân để mua đất',
    'Mở quán ăn buôn bán nhỏ',
    'Trợ cấp cho người 80 tuổi',
    'Lấy số thứ tự ở đâu?'
  ];

  // Reset inactivity timer back on user interaction
  const resetInactivityTimer = useCallback(() => {
    setSecondsRemaining(INACTIVITY_TIMEOUT_SECONDS);
  }, []);

  // Safe wrapper for voice synthesis: ensures microphone does not pick up self-audio
  // and prevents inactivity timer from interrupting speech playback
  const speakAI = useCallback((text: string, onEndCallback?: () => void) => {
    // 1. Mute microphone while system is speaking to eliminate acoustic echo loop
    if (recognizerRef.current) {
      recognizerRef.current.stop();
    }
    setIsListening(false);
    isListeningRef.current = false;

    // 2. Mark speaking state
    isSpeakingStateRef.current = true;
    setIsSpeakingState(true);
    setSecondsRemaining(INACTIVITY_TIMEOUT_SECONDS);

    speakText(
      text,
      0.90, // Optimal respectful, warm speed for Vietnamese citizens
      () => {
        isSpeakingStateRef.current = true;
        setIsSpeakingState(true);
      },
      () => {
        isSpeakingStateRef.current = false;
        setIsSpeakingState(false);
        // Reset countdown timer so citizen has full time to respond AFTER speech finishes
        setSecondsRemaining(INACTIVITY_TIMEOUT_SECONDS);
        onEndCallback?.();
      },
      (err) => {
        console.warn('Speech synthesis warning:', err);
        isSpeakingStateRef.current = false;
        setIsSpeakingState(false);
        setSecondsRemaining(INACTIVITY_TIMEOUT_SECONDS);
      }
    );
  }, []);

  // Process query text through AI
  const handleProcessQuery = useCallback((query: string) => {
    if (!query.trim()) return;
    resetInactivityTimer();

    const result = analyzeCitizenSpeech(
      query,
      currentWardServices,
      currentWardCounters,
      currentWardOfficers,
      selectedWard
    );

    setCurrentResult(result);

    // If citizen confirmed they understood ("đã rõ", "cảm ơn cháu")
    if (result.isConfirmation) {
      setIsConfirmedGoodbye(true);
      speakAI(result.spokenResponse, () => {
        // Automatically close and return to standby screen after saying goodbye
        goodbyeTimerRef.current = setTimeout(() => {
          stopSpeaking();
          onClose();
          setCurrentScreen('standby');
        }, 1500);
      });
      return;
    }

    // Normal service guidance response
    speakAI(result.spokenResponse);
  }, [
    currentWardServices,
    currentWardCounters,
    currentWardOfficers,
    selectedWard,
    resetInactivityTimer,
    speakAI,
    onClose,
    setCurrentScreen
  ]);

  // Handle User Confirmation Button ("Tôi đã hiểu rõ, cảm ơn cháu!")
  const handleConfirmUnderstood = () => {
    resetInactivityTimer();
    setIsConfirmedGoodbye(true);
    const goodbyeText = `Dạ vâng, cháu rất vui vì đã hỗ trợ được Bác! Kính chúc Bác luôn dồi dào sức khỏe và một ngày thật nhiều niềm vui. Cháu xin phép trở về màn hình chờ Kiosk nhé ạ!`;
    speakAI(goodbyeText, () => {
      goodbyeTimerRef.current = setTimeout(() => {
        stopSpeaking();
        onClose();
        setCurrentScreen('standby');
      }, 1500);
    });
  };

  // Handle Ask Another Service
  const handleAskAnother = () => {
    resetInactivityTimer();
    stopSpeaking();
    isSpeakingStateRef.current = false;
    setIsSpeakingState(false);
    setCurrentResult(null);
    setTranscript('');
    setCustomInput('');
    setIsConfirmedGoodbye(false);
    
    speakAI('Dạ thưa Bác! Bác cần cháu hỗ trợ thêm thủ tục gì nữa ạ? Bác nói vào micro nhé!', () => {
      // Re-trigger mic if possible after prompt ends
      if (recognizerRef.current && !isSpeakingStateRef.current) {
        recognizerRef.current.start();
      }
    });
  };

  // Handle View Detail and Print Guide
  const handleViewDetailAndPrint = (service: PublicService) => {
    stopSpeaking();
    isSpeakingStateRef.current = false;
    selectService(service);
    if (currentResult?.counter) {
      selectCounter(currentResult.counter);
    }
    onClose();
    setCurrentScreen('service_detail');
  };

  // Handle View Counter on Mindmap
  const handleViewCounterLocation = () => {
    stopSpeaking();
    isSpeakingStateRef.current = false;
    if (currentResult?.counter) {
      selectCounter(currentResult.counter);
    }
    onClose();
    setCurrentScreen('mindmap_view');
  };

  // Toggle Voice Recognition
  const toggleListening = () => {
    resetInactivityTimer();
    if (!recognizerRef.current) return;
    if (isListening) {
      recognizerRef.current.stop();
      isListeningRef.current = false;
      setIsListening(false);
    } else {
      stopSpeaking();
      isSpeakingStateRef.current = false;
      setIsSpeakingState(false);
      setTranscript('');
      recognizerRef.current.start();
    }
  };

  // Initialize Speech Recognizer and Initial Greeting
  useEffect(() => {
    if (!isOpen) {
      stopSpeaking();
      isSpeakingStateRef.current = false;
      isListeningRef.current = false;
      if (recognizerRef.current) {
        recognizerRef.current.stop();
      }
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
      if (goodbyeTimerRef.current) {
        clearTimeout(goodbyeTimerRef.current);
      }
      setIsListening(false);
      setTranscript('');
      setCustomInput('');
      setCurrentResult(null);
      setIsConfirmedGoodbye(false);
      setIsSpeakingState(false);
      return;
    }

    // Set initial countdown
    setSecondsRemaining(INACTIVITY_TIMEOUT_SECONDS);

    // Initial polite spoken greeting (TTS will automatically speak "AI" as "Ây-ai")
    const welcomeGreeting = `Kính chào Bác! Cháu là Trợ lý AI Một cửa Phường Sơn Trà. Bác cần tìm hiểu thủ tục gì hôm nay ạ? Bác hãy bấm vào micro và nói cho cháu nghe nhé!`;
    speakAI(welcomeGreeting, () => {
      // After speaking welcome greeting, activate listening
      if (recognizerRef.current && !isSpeakingStateRef.current) {
        recognizerRef.current.start();
      }
    });

    // Create Speech Recognizer instance
    const recognizer = new VoiceRecognizer({
      onStart: () => {
        isListeningRef.current = true;
        setIsListening(true);
        setErrorMessage(null);
      },
      onResult: (text, isFinal) => {
        setTranscript(text);
        resetInactivityTimer();
        if (isFinal && text.trim().length > 2) {
          handleProcessQuery(text);
        }
      },
      onError: (err) => {
        isListeningRef.current = false;
        setIsListening(false);
        setErrorMessage(err);
      },
      onEnd: () => {
        isListeningRef.current = false;
        setIsListening(false);
      }
    });

    recognizerRef.current = recognizer;

    return () => {
      recognizer.stop();
      stopSpeaking();
      isSpeakingStateRef.current = false;
      isListeningRef.current = false;
    };
  }, [isOpen]);

  // Countdown timer effect: guarantees the system never cuts off while instructions are being read aloud!
  useEffect(() => {
    if (!isOpen) return;

    countdownTimerRef.current = setInterval(() => {
      // CRITICAL: NEVER decrement timer or cut off while the AI is speaking!
      if (isSpeakingStateRef.current) {
        setSecondsRemaining(INACTIVITY_TIMEOUT_SECONDS);
        return;
      }

      setSecondsRemaining(prev => {
        if (prev <= 1) {
          // Timeout expired without interaction -> return to standby
          clearInterval(countdownTimerRef.current);
          stopSpeaking();
          onClose();
          setCurrentScreen('standby');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
    };
  }, [isOpen, onClose, setCurrentScreen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-md animate-fade-in"
      onClick={resetInactivityTimer}
      onTouchStart={resetInactivityTimer}
    >
      <div 
        className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] transition-all"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 sm:px-7 py-4 bg-gradient-to-r from-[#990e15] via-[#be111a] to-[#8f0d13] text-white shadow-md">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-white shadow-inner">
                <AIAssistantIcon className="w-7 h-7 text-white" />
              </div>
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-[#be111a] animate-pulse"></span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-extrabold tracking-tight">
                  TRỢ LÝ AI MỘT CỬA
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full shadow-xs">
                  {selectedWard.name}
                </span>
              </div>
              <p className="text-xs text-amber-100 flex items-center gap-1.5 mt-0.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Hướng dẫn quy trình, hồ sơ, mức phí & ô tiếp nhận bằng giọng nói</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio Toggle Button */}
            <button
              onClick={() => {
                if (isSpeakingState) {
                  stopSpeaking();
                  setIsSpeakingState(false);
                } else if (currentResult?.spokenResponse) {
                  speakAI(currentResult.spokenResponse);
                }
              }}
              className={`p-2.5 rounded-xl border transition-all ${
                isSpeakingState 
                  ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md animate-pulse' 
                  : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
              }`}
              title={isSpeakingState ? 'Tắt giọng nói' : 'Đọc lại nội dung'}
              aria-label="Điều khiển đọc âm thanh"
            >
              {isSpeakingState ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5 text-amber-200" />}
            </button>

            {/* Close Button */}
            <button
              onClick={() => {
                stopSpeaking();
                onClose();
              }}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors"
              aria-label="Đóng trợ lý AI"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-[#fafbfd]">
          {/* Confirmed Goodbye Screen */}
          {isConfirmedGoodbye ? (
            <div className="py-12 px-6 text-center space-y-4 max-w-lg mx-auto bg-white rounded-3xl border border-emerald-200 shadow-sm">
              <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <Check className="w-10 h-10 animate-bounce" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800">
                Cảm ơn Bác đã sử dụng dịch vụ!
              </h3>
              <p className="text-base text-slate-600 leading-relaxed">
                Kính chúc Bác luôn dồi dào sức khỏe, thủ tục hoàn tất nhanh chóng và thuận tiện tại UBND {selectedWard.name}.
              </p>
              <div className="pt-2">
                <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-3.5 py-1.5 rounded-full inline-flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  Đang chuyển về màn hình chờ Kiosk...
                </span>
              </div>
            </div>
          ) : (
            <>
              {/* Robot Assistant Interaction Header */}
              <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50/50 border border-amber-200 shadow-sm flex flex-col md:flex-row items-center gap-5">
                {/* Large Interactive Microphone Button */}
                <div className="relative shrink-0 flex flex-col items-center">
                  {isListening && (
                    <>
                      <span className="absolute inset-0 rounded-full bg-red-500/30 animate-ping"></span>
                      <span className="absolute -inset-3 rounded-full bg-red-600/20 animate-pulse"></span>
                    </>
                  )}
                  <button
                    onClick={toggleListening}
                    className={`relative z-10 w-20 h-20 sm:w-22 sm:h-22 rounded-full flex flex-col items-center justify-center transition-all shadow-xl cursor-pointer ${
                      isListening
                        ? 'bg-gradient-to-tr from-red-600 to-rose-500 text-white scale-105 ring-4 ring-red-200'
                        : 'bg-gradient-to-tr from-slate-900 to-slate-800 hover:from-[#be111a] hover:to-red-600 text-white hover:scale-105'
                    }`}
                    aria-label={isListening ? 'Dừng lắng nghe' : 'Bấm để nói'}
                  >
                    {isListening ? (
                      <>
                        <Mic className="w-8 h-8 animate-pulse text-white" />
                        <span className="text-[10px] font-bold mt-1 tracking-wider uppercase text-amber-200">
                          Đang nghe...
                        </span>
                      </>
                    ) : (
                      <>
                        <MicOff className="w-8 h-8 text-amber-300" />
                        <span className="text-[10px] font-bold mt-1 tracking-wider uppercase text-slate-200">
                          Chạm để nói
                        </span>
                      </>
                    )}
                  </button>
                </div>

                {/* Speech Bubble / Dialogue */}
                <div className="flex-1 w-full space-y-2 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-200/70 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-amber-700" />
                      Trợ lý AI đang giao tiếp
                    </span>
                    {isSpeakingState && (
                      <span className="text-xs font-semibold text-red-700 bg-red-100 px-2 py-0.5 rounded-full animate-pulse flex items-center gap-1">
                        <Volume2 className="w-3 h-3" />
                        Đang phát giọng đọc...
                      </span>
                    )}
                  </div>

                  {/* AI Speech Bubble */}
                  <div className="p-3.5 bg-white rounded-2xl border border-amber-200/80 shadow-xs">
                    <p className="text-base sm:text-lg font-medium text-slate-800 leading-relaxed">
                      {currentResult 
                        ? currentResult.spokenResponse 
                        : '“Kính chào Bác! Cháu là Trợ lý AI Một cửa Phường Sơn Trà. Bác cần làm thủ tục gì hôm nay ạ? Bác bấm vào Micro và nói cho cháu nghe nhé!”'}
                    </p>
                  </div>

                  {/* Real-time transcribed text */}
                  {transcript && (
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-white/80 py-1.5 px-3 rounded-xl border border-slate-200">
                      <span className="text-red-700 font-bold shrink-0">Bác vừa nói:</span>
                      <span className="italic text-slate-900 truncate">"{transcript}"</span>
                    </div>
                  )}

                  {errorMessage && (
                    <p className="text-xs text-red-600 bg-red-50 py-1 px-2.5 rounded-lg border border-red-200 inline-block">
                      {errorMessage}
                    </p>
                  )}
                </div>
              </div>

              {/* Quick Sample Questions (if no service matched yet, or for suggestions) */}
              {(!currentResult || !currentResult.service) && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Bác có thể chạm nhanh vào các thủ tục phổ biến sau:
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {POPULAR_QUERIES.map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setTranscript(q);
                          handleProcessQuery(q);
                        }}
                        className="p-2.5 text-xs font-semibold bg-white hover:bg-red-50 hover:border-red-300 text-slate-700 hover:text-red-900 rounded-xl border border-slate-200 shadow-xs transition-all text-left flex items-center justify-between group cursor-pointer"
                      >
                        <span className="line-clamp-2">{q}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-600 shrink-0 ml-1 transition-transform group-hover:translate-x-0.5" />
                      </button>
                    ))}
                  </div>

                  {/* Text Input Fallback if microphone is unavailable */}
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleProcessQuery(customInput);
                    }}
                    className="flex gap-2 pt-2"
                  >
                    <input
                      type="text"
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      placeholder="Hoặc gõ tên thủ tục cần tra cứu (ví dụ: khai sinh, kết hôn, công chứng...)"
                      className="flex-1 text-sm bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-slate-900"
                    />
                    <button
                      type="submit"
                      disabled={!customInput.trim()}
                      className="px-5 py-2.5 text-sm font-bold bg-[#be111a] hover:bg-red-700 disabled:opacity-50 text-white rounded-xl shadow-sm transition-colors cursor-pointer"
                    >
                      Hỏi AI
                    </button>
                  </form>
                </div>
              )}

              {/* Service Detailed Guidance Breakdown */}
              {currentResult && currentResult.service && (
                <div className="space-y-4 animate-fade-in">
                  {/* Service Title Banner */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-red-700 bg-red-100 px-2.5 py-0.5 rounded-md">
                          Mã thủ tục: {currentResult.service.code}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">
                          Dịch vụ công Một cửa
                        </span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                        {currentResult.service.name}
                      </h3>
                      <p className="text-xs text-slate-600 mt-0.5">
                        {currentResult.service.summary}
                      </p>
                    </div>

                    <button
                      onClick={() => handleViewDetailAndPrint(currentResult.service!)}
                      className="shrink-0 flex items-center gap-1.5 px-4 py-2.5 bg-[#be111a] hover:bg-red-700 text-white rounded-xl font-bold text-xs shadow-md transition-colors cursor-pointer"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Xem & In phiếu nộp</span>
                    </button>
                  </div>

                  {/* 4 Essential Guidance Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {/* 1. Đến Ô Số Mấy - Gặp Cán Bộ Nào */}
                    <div className="p-4 rounded-2xl bg-amber-50/70 border-2 border-amber-300/80 shadow-xs space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-extrabold text-sm shadow-xs">
                            <Building2 className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider block">
                              VỊ TRÍ TIẾP NHẬN
                            </span>
                            <h4 className="text-base font-extrabold text-amber-950">
                              {currentResult.counter?.code} · Bàn số {currentResult.counter?.positionNumber}
                            </h4>
                          </div>
                        </div>

                        <button
                          onClick={handleViewCounterLocation}
                          className="text-xs font-bold text-amber-900 hover:text-red-700 bg-white hover:bg-amber-100 px-2.5 py-1.5 rounded-lg border border-amber-300 transition-colors flex items-center gap-1"
                        >
                          <span>Sơ đồ</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-amber-200 space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Bộ phận:</span>
                          <span className="font-bold text-slate-800 text-right">{currentResult.counter?.name}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Cán bộ phụ trách:</span>
                          <span className="font-extrabold text-[#be111a] text-sm">
                            {currentResult.counter?.officerName.replace(/\bĐ\/c\.?\s*/i, 'Đồng chí ')}
                          </span>
                        </div>
                        {currentResult.officer && (
                          <div className="flex items-center justify-between text-slate-600">
                            <span>Hotline bàn:</span>
                            <span className="font-mono font-bold text-slate-700">{currentResult.officer.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 2. Lệ phí & Thời gian hoàn thành */}
                    <div className="p-4 rounded-2xl bg-emerald-50/70 border-2 border-emerald-300/80 shadow-xs space-y-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-extrabold text-sm shadow-xs">
                          <CreditCard className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider block">
                            CHI PHÍ & THỜI HẠN
                          </span>
                          <h4 className="text-base font-extrabold text-emerald-950">
                            {currentResult.service.fee}
                          </h4>
                        </div>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-emerald-200 space-y-2 text-xs">
                        <div className="flex items-start gap-2">
                          <Clock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-slate-500 block">Thời gian giải quyết:</span>
                            <span className="font-bold text-slate-800 text-sm">
                              {currentResult.service.processingDuration}
                            </span>
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-500 border-t border-slate-100 pt-1.5">
                          Nộp phí trực tiếp tại Quầy Thủ quỹ cơ quan hoặc thanh toán qua Cổng Dịch vụ công quốc gia.
                        </p>
                      </div>
                    </div>

                    {/* 3. Hồ sơ gồm có (Giấy tờ cần mang theo) */}
                    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-red-700" />
                          <h4 className="text-sm font-bold text-slate-900 uppercase">
                            Hồ sơ cần chuẩn bị ({currentResult.service.requiredDocuments.length} loại giấy tờ)
                          </h4>
                        </div>
                        <span className="text-[11px] font-semibold text-slate-500">Người dân mang theo</span>
                      </div>

                      <div className="space-y-2">
                        {currentResult.service.requiredDocuments.map((doc) => (
                          <div 
                            key={doc.id}
                            className="p-2.5 bg-slate-50 hover:bg-red-50/40 rounded-xl border border-slate-200 text-xs flex items-start justify-between gap-2"
                          >
                            <div>
                              <span className="font-bold text-slate-800 block">{doc.name}</span>
                              <span className="text-slate-500 text-[11px]">{doc.note}</span>
                            </div>
                            <div className="shrink-0 flex items-center gap-1">
                              {doc.isRequired && (
                                <span className="text-[10px] font-bold text-red-700 bg-red-100 px-1.5 py-0.5 rounded">
                                  Bắt buộc
                                </span>
                              )}
                              <span className="text-[10px] font-medium text-slate-600 bg-slate-200 px-1.5 py-0.5 rounded">
                                {doc.isOriginal ? 'Bản chính' : 'Bản sao'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 4. Quy trình thực hiện các bước */}
                    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2.5">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-blue-700" />
                        <h4 className="text-sm font-bold text-slate-900 uppercase">
                          Quy trình 4 bước thực hiện
                        </h4>
                      </div>

                      <div className="space-y-2">
                        {currentResult.service.steps.map((step) => (
                          <div 
                            key={step.stepNumber}
                            className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-start gap-2.5"
                          >
                            <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-extrabold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                              {step.stepNumber}
                            </span>
                            <div>
                              <span className="font-bold text-slate-800 block">{step.title}</span>
                              <p className="text-slate-600 text-[11px] line-clamp-2 mt-0.5">
                                {step.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Citizen Confirmation Actions */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-red-50 via-amber-50 to-emerald-50 border border-slate-200 shadow-sm space-y-3">
                    <div className="text-center">
                      <p className="text-base font-bold text-slate-900">
                        Bác đã nắm rõ các thông tin trên chưa ạ?
                      </p>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Bác có thể nói vào Micro: <strong className="text-emerald-700 font-bold">"Tôi đã hiểu rõ"</strong> hoặc chạm vào nút bên dưới:
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                      {/* Button: Đã hiểu rõ */}
                      <button
                        onClick={handleConfirmUnderstood}
                        className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 hover:scale-102 cursor-pointer"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        <span>Tôi đã hiểu rõ, cảm ơn cháu!</span>
                      </button>

                      {/* Button: Hỏi thêm thủ tục khác */}
                      <button
                        onClick={handleAskAnother}
                        className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white hover:bg-blue-50 text-blue-800 border-2 border-blue-300 font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <RotateCcw className="w-4 h-4 text-blue-600" />
                        <span>Hỏi thêm thủ tục khác</span>
                      </button>

                      {/* Button: Xem chi tiết & In phiếu */}
                      <button
                        onClick={() => handleViewDetailAndPrint(currentResult.service!)}
                        className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <ExternalLink className="w-4 h-4 text-amber-300" />
                        <span>Chi tiết & Nộp online</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Bottom Inactivity Countdown Bar */}
        <div className="px-5 sm:px-7 py-3 bg-slate-100 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          {isSpeakingState ? (
            <div className="flex items-center gap-2 text-xs font-bold text-red-700 bg-red-50 py-1 px-3 rounded-full border border-red-200 shadow-xs">
              <Volume2 className="w-3.5 h-3.5 animate-pulse text-red-600" />
              <span>Trợ lý AI đang đọc hướng dẫn chi tiết cho Bác... (Tạm dừng đếm ngược)</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
              <span>
                Tự động trở về màn hình chờ Kiosk sau:{' '}
                <strong className="text-red-700 font-bold text-sm font-mono">
                  {secondsRemaining}s
                </strong>{' '}
                (Chạm vào màn hình để tiếp tục)
              </span>
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                stopSpeaking();
                onClose();
                setCurrentScreen('standby');
              }}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 underline underline-offset-2 transition-colors cursor-pointer"
            >
              Về màn hình chờ ngay
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={() => {
                stopSpeaking();
                onClose();
              }}
              className="px-4 py-1.5 text-xs font-bold bg-white hover:bg-slate-200 text-slate-800 rounded-lg border border-slate-300 transition-colors cursor-pointer"
            >
              Đóng cửa sổ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
