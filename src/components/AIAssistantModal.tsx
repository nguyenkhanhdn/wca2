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
  ArrowRight,
  Printer,
  RotateCcw,
  ExternalLink,
  ChevronRight,
  Building2,
  Check,
  Maximize2,
  Minimize2,
  Send,
  Scale,
  MapPin,
  AlertCircle,
  Loader2,
  MessageSquareText
} from 'lucide-react';
import { useApp, sanitizeServiceNationalPortalUrl } from '../context/AppContext';
import { AIAssistantIcon } from './AIAssistantIcon';
import { VoiceRecognizer, speakText, stopSpeaking } from '../utils/speech';
import { analyzeCitizenSpeech, AIAnalysisResult } from '../utils/aiAssistant';
import { PublicService, Counter, Officer } from '../types';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface GeminiStructuredAnswer {
  answer: string;
  spokenSummary: string;
  matchedServiceId: string;
  counterInfo: string;
  requiredFormsAndDocs: string[];
  stepByStepGuide: string[];
  feeAndDuration: string;
  legalRegulations: string[];
  followUpSuggestions: string[];
}

interface ConversationTurn {
  id: string;
  question: string;
  source: 'gemini' | 'local';
  geminiData?: GeminiStructuredAnswer;
  matchedService?: PublicService | null;
  matchedCounter?: Counter | null;
  matchedOfficer?: Officer | null;
}

const INACTIVITY_TIMEOUT_SECONDS = 45;

const QUICK_SENIOR_QUESTIONS = [
  {
    title: 'Khai sinh & Mẫu tờ khai',
    question: 'Làm giấy khai sinh cho cháu cần giấy tờ gì, dùng mẫu tờ khai nào và nộp ở đâu?'
  },
  {
    title: 'Trợ cấp Người cao tuổi (70 - 80 tuổi)',
    question: 'Người cao tuổi từ đủ 70 đến 80 tuổi được hưởng trợ cấp xã hội và thẻ bảo hiểm y tế thế nào?'
  },
  {
    title: 'Chế độ Hưu trí & Lương hưu',
    question: 'Thủ tục giải quyết chế độ hưu trí và nộp hồ sơ trực tuyến thực hiện ra sao?'
  },
  {
    title: 'Công chứng, Sao y & Chữ ký',
    question: 'Sao y công chứng căn cước công dân và chứng thực chữ ký mất bao lâu, lệ phí bao nhiêu?'
  },
  {
    title: 'Thủ tục khi có Người thân qua đời',
    question: 'Thủ tục đăng ký khai tử khi có người thân qua đời và liên thông mai táng phí gồm giấy tờ gì?'
  },
  {
    title: 'Hỗ trợ viết hộ đơn & Photo miễn phí',
    question: 'Tôi mắt kém chưa biết viết tờ khai và chưa photo giấy tờ thì ra quầy nào hỗ trợ?'
  }
];

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
    setCurrentScreen,
    accessibility,
    setTextScale,
    setAutoReadAloud,
    aiInitialQuestion,
    clearAiInitialQuestion
  } = useApp();

  const [isListening, setIsListening] = useState(false);
  const [questionInput, setQuestionInput] = useState('');
  const [micError, setMicError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<{ code?: string; message: string; pendingQuestion: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeakingState, setIsSpeakingState] = useState(false);
  const [activeSpokenId, setActiveSpokenId] = useState<string | null>(null);
  const [turns, setTurns] = useState<ConversationTurn[]>([]);
  const [isConfirmedGoodbye, setIsConfirmedGoodbye] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(INACTIVITY_TIMEOUT_SECONDS);
  const [isMaximized, setIsMaximized] = useState(false);

  const recognizerRef = useRef<VoiceRecognizer | null>(null);
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const goodbyeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSpeakingStateRef = useRef<boolean>(false);
  const isLoadingRef = useRef<boolean>(false);
  const bottomAnchorRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const resetInactivityTimer = useCallback(() => {
    setSecondsRemaining(INACTIVITY_TIMEOUT_SECONDS);
  }, []);

  const speakAI = useCallback((text: string, turnId?: string, onEndCallback?: () => void) => {
    if (!text.trim()) return;
    if (recognizerRef.current) {
      recognizerRef.current.stop();
    }
    setIsListening(false);
    isSpeakingStateRef.current = true;
    setIsSpeakingState(true);
    setActiveSpokenId(turnId || 'system');
    setSecondsRemaining(INACTIVITY_TIMEOUT_SECONDS);

    speakText(
      text,
      accessibility.voiceSpeed || 0.9,
      () => {
        isSpeakingStateRef.current = true;
        setIsSpeakingState(true);
      },
      () => {
        isSpeakingStateRef.current = false;
        setIsSpeakingState(false);
        setActiveSpokenId(null);
        setSecondsRemaining(INACTIVITY_TIMEOUT_SECONDS);
        onEndCallback?.();
      },
      () => {
        isSpeakingStateRef.current = false;
        setIsSpeakingState(false);
        setActiveSpokenId(null);
        setSecondsRemaining(INACTIVITY_TIMEOUT_SECONDS);
      }
    );
  }, [accessibility.voiceSpeed]);

  const stopAllSpeech = useCallback(() => {
    stopSpeaking();
    isSpeakingStateRef.current = false;
    setIsSpeakingState(false);
    setActiveSpokenId(null);
  }, []);

  const runLocalCatalogLookup = useCallback((rawQuestion: string) => {
    const localResult: AIAnalysisResult = analyzeCitizenSpeech(
      rawQuestion,
      currentWardServices,
      currentWardCounters,
      currentWardOfficers,
      selectedWard
    );

    const turnId = `local-${Date.now()}`;
    const srv = localResult.service;
    const cnt = localResult.counter;
    const off = localResult.officer;

    const syntheticData: GeminiStructuredAnswer = {
      answer: localResult.spokenResponse,
      spokenSummary: localResult.spokenResponse,
      matchedServiceId: srv?.id || '',
      counterInfo: cnt ? `${cnt.code} · Bàn số ${cnt.positionNumber} — ${cnt.officerName.replace(/\bĐ\/c\.?\s*/i, 'Đồng chí ')}` : 'Quầy Hướng dẫn (Đ/c Phạm Duy Đại)',
      requiredFormsAndDocs: srv ? srv.requiredDocuments.map(d => `${d.name}${d.sampleFormName ? ` (${d.sampleFormName})` : ''}${d.note ? ` — ${d.note}` : ''}`) : [],
      stepByStepGuide: srv ? srv.steps.map(st => `Bước ${st.stepNumber}: ${st.title} — ${st.description}`) : [],
      feeAndDuration: srv ? `Lệ phí: ${srv.fee} · Thời hạn: ${srv.processingDuration}` : 'Hỗ trợ miễn phí tại Bộ phận Một cửa',
      legalRegulations: srv?.legalBasis || [],
      followUpSuggestions: localResult.suggestedQuestions.slice(0, 3)
    };

    const newTurn: ConversationTurn = {
      id: turnId,
      question: rawQuestion,
      source: 'local',
      geminiData: syntheticData,
      matchedService: srv,
      matchedCounter: cnt,
      matchedOfficer: off
    };

    setApiError(null);
    setTurns(prev => [...prev, newTurn]);
    if (accessibility.autoReadAloud) {
      speakAI(syntheticData.spokenSummary, turnId);
    }
  }, [currentWardServices, currentWardCounters, currentWardOfficers, selectedWard, accessibility.autoReadAloud, speakAI]);

  const submitQuestion = useCallback(async (rawQuestion: string) => {
    const cleanQ = rawQuestion.trim();
    if (!cleanQ || isLoadingRef.current) return;

    resetInactivityTimer();
    stopAllSpeech();
    if (recognizerRef.current) {
      recognizerRef.current.stop();
    }
    setIsListening(false);
    setApiError(null);
    setMicError(null);
    setQuestionInput('');

    // Check quick spoken goodbye confirmation
    const localQuick = analyzeCitizenSpeech(
      cleanQ,
      currentWardServices,
      currentWardCounters,
      currentWardOfficers,
      selectedWard
    );
    if (localQuick.isConfirmation) {
      setIsConfirmedGoodbye(true);
      speakAI(localQuick.spokenResponse, 'goodbye', () => {
        goodbyeTimerRef.current = setTimeout(() => {
          stopAllSpeech();
          onClose();
          setCurrentScreen('standby');
        }, 1500);
      });
      return;
    }

    isLoadingRef.current = true;
    setIsLoading(true);

    try {
      const historyPayload = turns.slice(-4).flatMap((t) => ([
        { role: 'user' as const, text: t.question },
        { role: 'assistant' as const, text: t.geminiData?.answer || '' }
      ]));

      const response = await fetch('/api/gemini/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: cleanQ,
          history: historyPayload,
          ward: {
            id: selectedWard.id,
            name: selectedWard.name,
            address: selectedWard.address,
            hotline: selectedWard.hotline,
            workingHours: selectedWard.workingHours,
            supportOfficer: selectedWard.supportOfficer
          },
          counters: currentWardCounters.map(c => ({
            id: c.id,
            code: c.code,
            name: c.name,
            officerName: c.officerName,
            primaryField: c.primaryField,
            positionNumber: c.positionNumber
          })),
          services: currentWardServices.map(s => ({
            id: s.id,
            code: s.code,
            name: s.name,
            category: s.category,
            level: s.level,
            counterId: s.counterId,
            summary: s.summary,
            processingDuration: s.processingDuration,
            fee: s.fee,
            requiredDocuments: s.requiredDocuments.map(d => ({
              name: d.name,
              note: d.note,
              isRequired: d.isRequired,
              isOriginal: d.isOriginal,
              sampleFormName: d.sampleFormName
            })),
            steps: s.steps,
            legalBasis: s.legalBasis,
            faq: s.faq,
            nationalPortalUrl: sanitizeServiceNationalPortalUrl(s)
          }))
        })
      });

      const payload = await response.json();

      if (!response.ok) {
        setApiError({
          code: payload?.code || 'API_ERROR',
          message: payload?.error || 'Không thể kết nối tới trợ lý Gemini lúc này.',
          pendingQuestion: cleanQ
        });
        return;
      }

      const data = payload as GeminiStructuredAnswer;
      const matchedService = data.matchedServiceId
        ? currentWardServices.find(s => s.id === data.matchedServiceId) || null
        : null;
      const matchedCounter = matchedService
        ? currentWardCounters.find(c => c.id === matchedService.counterId) || null
        : null;
      const matchedOfficer = matchedCounter
        ? currentWardOfficers.find(o => o.counterId === matchedCounter.id) ||
          currentWardOfficers.find(o => o.name === matchedCounter.officerName) ||
          null
        : null;

      const turnId = `gemini-${Date.now()}`;
      const newTurn: ConversationTurn = {
        id: turnId,
        question: cleanQ,
        source: 'gemini',
        geminiData: data,
        matchedService,
        matchedCounter,
        matchedOfficer
      };

      setTurns(prev => [...prev, newTurn]);

      if (accessibility.autoReadAloud) {
        speakAI(data.spokenSummary || data.answer, turnId);
      }
    } catch {
      setApiError({
        code: 'NETWORK_ERROR',
        message: 'Không thể kết nối mạng tới máy chủ hỏi đáp. Bác có thể kiểm tra mạng hoặc bấm tra cứu nhanh từ danh mục tại chỗ bên dưới.',
        pendingQuestion: cleanQ
      });
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
      resetInactivityTimer();
    }
  }, [
    resetInactivityTimer,
    stopAllSpeech,
    currentWardServices,
    currentWardCounters,
    currentWardOfficers,
    selectedWard,
    turns,
    accessibility.autoReadAloud,
    speakAI,
    onClose,
    setCurrentScreen
  ]);

  // Auto-scroll when new conversation turns arrive
  useEffect(() => {
    if (turns.length > 0) {
      bottomAnchorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [turns.length, isLoading]);

  // Handle modal open/close lifecycle & optional initial question
  useEffect(() => {
    if (!isOpen) {
      stopAllSpeech();
      isLoadingRef.current = false;
      setIsLoading(false);
      if (recognizerRef.current) {
        recognizerRef.current.stop();
      }
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      if (goodbyeTimerRef.current) clearTimeout(goodbyeTimerRef.current);
      setIsListening(false);
      setQuestionInput('');
      setMicError(null);
      setApiError(null);
      setTurns([]);
      setIsConfirmedGoodbye(false);
      return;
    }

    setSecondsRemaining(INACTIVITY_TIMEOUT_SECONDS);

    const recognizer = new VoiceRecognizer({
      onStart: () => {
        setIsListening(true);
        setMicError(null);
      },
      onResult: (text, isFinal) => {
        setQuestionInput(text);
        resetInactivityTimer();
        if (isFinal && text.trim().length > 2) {
          submitQuestion(text);
        }
      },
      onError: (err) => {
        setIsListening(false);
        setMicError(err);
      },
      onEnd: () => {
        setIsListening(false);
      }
    });
    recognizerRef.current = recognizer;

    if (aiInitialQuestion && aiInitialQuestion.trim()) {
      const q = aiInitialQuestion.trim();
      clearAiInitialQuestion();
      submitQuestion(q);
    } else if (accessibility.autoReadAloud) {
      const welcomeGreeting = `Kính chào Bác! Cháu là Trợ lý AI Một cửa ${selectedWard.name}. Bác cần hỏi về thủ tục, mẫu tờ khai hay quy định nào, Bác chạm vào gợi ý, gõ câu hỏi hoặc bấm nút Nói cho cháu nghe nhé!`;
      speakAI(welcomeGreeting, 'welcome');
    }

    return () => {
      recognizer.stop();
      stopAllSpeech();
    };
  }, [isOpen]);

  // Escape key closes or exits maximize
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isMaximized) {
          setIsMaximized(false);
        } else {
          stopAllSpeech();
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, isMaximized, onClose, stopAllSpeech]);

  // Inactivity timeout: pauses while speaking or loading
  useEffect(() => {
    if (!isOpen) return;

    countdownTimerRef.current = setInterval(() => {
      if (isSpeakingStateRef.current || isLoadingRef.current) {
        setSecondsRemaining(INACTIVITY_TIMEOUT_SECONDS);
        return;
      }

      setSecondsRemaining(prev => {
        if (prev <= 1) {
          if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
          stopAllSpeech();
          onClose();
          setCurrentScreen('standby');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, [isOpen, onClose, setCurrentScreen, stopAllSpeech]);

  const toggleListening = () => {
    resetInactivityTimer();
    if (!recognizerRef.current) return;
    if (isListening) {
      recognizerRef.current.stop();
      setIsListening(false);
    } else {
      stopAllSpeech();
      setMicError(null);
      recognizerRef.current.start();
    }
  };

  const handleConfirmUnderstood = () => {
    resetInactivityTimer();
    setIsConfirmedGoodbye(true);
    const goodbyeText = `Dạ vâng, cháu rất vui vì đã hỗ trợ được Bác! Kính chúc Bác luôn dồi dào sức khỏe và làm thủ tục thật thuận lợi tại UBND ${selectedWard.name}.`;
    speakAI(goodbyeText, 'goodbye', () => {
      goodbyeTimerRef.current = setTimeout(() => {
        stopAllSpeech();
        onClose();
        setCurrentScreen('standby');
      }, 1500);
    });
  };

  const handleStartNewTopic = () => {
    resetInactivityTimer();
    stopAllSpeech();
    setTurns([]);
    setApiError(null);
    setMicError(null);
    setQuestionInput('');
    setIsConfirmedGoodbye(false);
    inputRef.current?.focus();
  };

  const handleOpenServiceDetail = (service: PublicService, counter?: Counter | null) => {
    stopAllSpeech();
    selectService(service);
    if (counter) {
      selectCounter(counter);
    }
    onClose();
    setCurrentScreen('service_detail');
  };

  const handleOpenCounterMap = (counter?: Counter | null) => {
    stopAllSpeech();
    if (counter) {
      selectCounter(counter);
    }
    onClose();
    setCurrentScreen('mindmap_view');
  };

  if (!isOpen) return null;

  const textSizeClass =
    accessibility.textScale === 'xlarge'
      ? 'text-lg sm:text-xl'
      : accessibility.textScale === 'large'
        ? 'text-base sm:text-lg'
        : 'text-sm sm:text-base';

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm transition-all ${
        isMaximized ? 'p-0' : 'p-2 sm:p-4'
      }`}
      onClick={resetInactivityTimer}
      onTouchStart={resetInactivityTimer}
    >
      <div
        className={`bg-[#f8fafc] shadow-2xl overflow-hidden flex flex-col transition-all ${
          isMaximized
            ? 'w-screen h-screen max-w-none max-h-none rounded-none border-0'
            : 'w-[96vw] max-w-6xl h-[94vh] max-h-[94vh] rounded-2xl sm:rounded-3xl border border-slate-200'
        }`}
        onClick={e => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3.5 bg-gradient-to-r from-[#990e15] via-[#be111a] to-[#8f0d13] text-white shrink-0 border-b-2 border-amber-400">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center border border-white/25 text-white shrink-0">
              <AIAssistantIcon className="w-6 h-6 text-amber-200" />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-black tracking-tight text-white">
                HỎI ĐÁP THỦ TỤC HÀNH CHÍNH CÔNG
              </h2>
              <p className="text-xs sm:text-sm text-amber-100">
                UBND {selectedWard.name} · Trả lời theo dữ liệu một cửa & quy định Nhà nước
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Quick Font Size Controls for Seniors */}
            <div className="flex items-center bg-black/20 rounded-xl p-1 border border-white/15">
              <button
                type="button"
                onClick={() => setTextScale('normal')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  accessibility.textScale === 'normal' ? 'bg-white text-slate-900' : 'text-amber-100 hover:bg-white/10'
                }`}
                title="Cỡ chữ vừa"
              >
                A
              </button>
              <button
                type="button"
                onClick={() => setTextScale('large')}
                className={`px-2.5 py-1.5 rounded-lg text-sm font-bold transition-colors cursor-pointer ${
                  accessibility.textScale === 'large' ? 'bg-white text-[#be111a]' : 'text-amber-100 hover:bg-white/10'
                }`}
                title="Cỡ chữ to"
              >
                A+
              </button>
              <button
                type="button"
                onClick={() => setTextScale('xlarge')}
                className={`px-2.5 py-1.5 rounded-lg text-base font-black transition-colors cursor-pointer ${
                  accessibility.textScale === 'xlarge' ? 'bg-amber-300 text-slate-950' : 'text-amber-100 hover:bg-white/10'
                }`}
                title="Cỡ chữ rất to cho người lớn tuổi"
              >
                A++
              </button>
            </div>

            {/* Auto Read Aloud Toggle */}
            <button
              type="button"
              onClick={() => {
                const nextVal = !accessibility.autoReadAloud;
                setAutoReadAloud(nextVal);
                if (!nextVal) stopAllSpeech();
              }}
              className={`min-h-[40px] px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-colors cursor-pointer whitespace-nowrap ${
                accessibility.autoReadAloud
                  ? 'bg-emerald-600 border-emerald-400 text-white'
                  : 'bg-white/10 border-white/20 text-amber-100 hover:bg-white/20'
              }`}
              title="Tự động đọc to câu trả lời cho Bác nghe"
            >
              {accessibility.autoReadAloud ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span className="hidden md:inline">{accessibility.autoReadAloud ? 'Tự động đọc: Bật' : 'Tự động đọc: Tắt'}</span>
            </button>

            {/* Maximize / Restore */}
            <button
              type="button"
              onClick={() => setIsMaximized(prev => !prev)}
              className="min-h-[40px] inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs transition-colors cursor-pointer whitespace-nowrap"
              title={isMaximized ? 'Thu nhỏ cửa sổ' : 'Phóng to toàn màn hình'}
            >
              {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              <span className="hidden sm:inline">{isMaximized ? 'Thu nhỏ' : 'Phóng to'}</span>
            </button>

            {/* Close */}
            <button
              type="button"
              onClick={() => {
                stopAllSpeech();
                onClose();
              }}
              className="min-h-[40px] px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/25 transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold"
              aria-label="Đóng cửa sổ hỏi đáp"
            >
              <X className="w-5 h-5" />
              <span className="hidden sm:inline">Đóng</span>
            </button>
          </div>
        </div>

        {/* Scrollable Conversation & Guidance Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {isConfirmedGoodbye ? (
            <div className="py-12 px-6 text-center space-y-4 max-w-xl mx-auto bg-white rounded-3xl border border-emerald-200 shadow-sm">
              <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <Check className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-slate-900">
                Cảm ơn Bác đã sử dụng dịch vụ!
              </h3>
              <p className="text-base sm:text-lg text-slate-700 leading-relaxed">
                Kính chúc Bác luôn dồi dào sức khỏe, hồ sơ hoàn tất nhanh chóng tại UBND {selectedWard.name}.
              </p>
              <p className="text-sm font-semibold text-slate-500">
                Đang chuyển về màn hình chờ Kiosk...
              </p>
            </div>
          ) : (
            <>
              {/* Welcome & One-Tap Questions (shown before first question or alongside empty state) */}
              {turns.length === 0 && !isLoading && (
                <div className="space-y-5">
                  {/* Friendly Greeting Banner */}
                  <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <h3 className="text-lg sm:text-2xl font-black text-slate-900">
                        Kính chào Bác! Bác cần hỏi thủ tục hay mẫu đơn gì hôm nay ạ?
                      </h3>
                      <p className={`text-slate-700 leading-relaxed ${textSizeClass}`}>
                        Bác có thể <strong>chạm vào một ô gợi ý bên dưới</strong>, <strong>bấm nút Nói màu đỏ</strong> hoặc <strong>gõ câu hỏi</strong> vào khung phía dưới. Cháu sẽ giải thích thật rõ từng bước theo đúng quy định Nhà nước.
                      </p>
                    </div>
                    {isSpeakingState && (
                      <button
                        type="button"
                        onClick={stopAllSpeech}
                        className="shrink-0 min-h-[48px] px-4 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm flex items-center gap-2 cursor-pointer"
                      >
                        <VolumeX className="w-5 h-5" />
                        <span>Dừng đọc</span>
                      </button>
                    )}
                  </div>

                  {/* 6 Big Senior-Friendly One-Tap Question Cards */}
                  <div className="space-y-3">
                    <h4 className="text-sm sm:text-base font-black text-slate-800">
                      Chạm 1 lần vào vấn đề Bác đang quan tâm:
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                      {QUICK_SENIOR_QUESTIONS.map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => submitQuestion(item.question)}
                          className="min-h-[88px] p-4 sm:p-5 rounded-2xl bg-white hover:bg-red-50/70 border border-slate-200 hover:border-[#be111a] text-left transition-all flex flex-col justify-between gap-2 shadow-xs hover:shadow-md cursor-pointer group"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-base sm:text-lg font-extrabold text-slate-900 group-hover:text-[#be111a]">
                              {item.title}
                            </span>
                            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#be111a] shrink-0 mt-0.5" />
                          </div>
                          <p className="text-xs sm:text-sm text-slate-600 leading-snug">
                            "{item.question}"
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Conversation History Turns */}
              {turns.map((turn) => {
                const data = turn.geminiData;
                const isThisTurnSpeaking = isSpeakingState && activeSpokenId === turn.id;

                return (
                  <div key={turn.id} className="space-y-4">
                    {/* Citizen Question Bubble */}
                    <div className="flex justify-end">
                      <div className="max-w-3xl bg-[#be111a] text-white px-5 py-3.5 rounded-2xl rounded-br-sm shadow-xs">
                        <span className="text-xs font-bold text-amber-200 block mb-0.5">
                          Câu hỏi của Bác:
                        </span>
                        <p className={`font-semibold leading-relaxed ${textSizeClass}`}>
                          {turn.question}
                        </p>
                      </div>
                    </div>

                    {/* Assistant Answer Card */}
                    {data && (
                      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-5">
                        {/* Answer Header & Listen Button */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
                          <div className="space-y-0.5">
                            <span className="text-xs font-bold text-[#be111a] uppercase tracking-wide block">
                              {turn.source === 'gemini'
                                ? 'Trả lời từ Trợ lý AI · Căn cứ Dữ liệu Một cửa & Quy định Nhà nước'
                                : 'Tra cứu nhanh từ Danh mục Một cửa tại chỗ'}
                            </span>
                            {turn.matchedService && (
                              <h3 className="text-lg sm:text-xl font-black text-slate-900">
                                {turn.matchedService.name}
                              </h3>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              if (isThisTurnSpeaking) {
                                stopAllSpeech();
                              } else {
                                speakAI(data.answer, turn.id);
                              }
                            }}
                            className={`min-h-[48px] px-4 py-2.5 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0 ${
                              isThisTurnSpeaking
                                ? 'bg-red-600 text-white'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                            }`}
                          >
                            {isThisTurnSpeaking ? (
                              <>
                                <VolumeX className="w-5 h-5" />
                                <span>Dừng đọc</span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-5 h-5" />
                                <span>Nghe đọc câu trả lời</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Main Plain-Language Answer */}
                        <div className={`text-slate-900 leading-relaxed whitespace-pre-line ${textSizeClass}`}>
                          {data.answer}
                        </div>

                        {/* Structured Key Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Counter / Where to go */}
                          {data.counterInfo && (
                            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs sm:text-sm font-black text-amber-950 uppercase flex items-center gap-2">
                                  <Building2 className="w-4 h-4 text-amber-700" />
                                  Đến đâu & Gặp ai
                                </span>
                                {turn.matchedCounter && (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenCounterMap(turn.matchedCounter)}
                                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-amber-100 text-amber-950 border border-amber-300 font-bold text-xs flex items-center gap-1 cursor-pointer"
                                  >
                                    <MapPin className="w-3.5 h-3.5" />
                                    <span>Xem sơ đồ</span>
                                  </button>
                                )}
                              </div>
                              <p className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed">
                                {data.counterInfo}
                              </p>
                              {turn.matchedOfficer && (
                                <p className="text-xs sm:text-sm text-slate-700">
                                  Số điện thoại bàn: <strong className="font-mono text-slate-900">{turn.matchedOfficer.phone}</strong>
                                </p>
                              )}
                            </div>
                          )}

                          {/* Fee & Duration */}
                          {data.feeAndDuration && (
                            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                              <span className="text-xs sm:text-sm font-black text-emerald-950 uppercase flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-emerald-700" />
                                Lệ phí & Thời hạn giải quyết
                              </span>
                              <p className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed">
                                {data.feeAndDuration}
                              </p>
                              <p className="text-xs sm:text-sm text-emerald-900 flex items-center gap-1.5">
                                <Clock className="w-4 h-4 shrink-0" />
                                <span>Giờ làm việc: {selectedWard.workingHours}</span>
                              </p>
                            </div>
                          )}

                          {/* Required Forms & Documents */}
                          {data.requiredFormsAndDocs.length > 0 && (
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                              <span className="text-xs sm:text-sm font-black text-slate-900 uppercase flex items-center gap-2">
                                <FileText className="w-4 h-4 text-[#be111a]" />
                                Giấy tờ & Mẫu tờ khai (Form) quy định
                              </span>
                              <ul className="space-y-2 text-sm sm:text-base text-slate-800">
                                {data.requiredFormsAndDocs.map((doc, i) => (
                                  <li key={i} className="flex items-start gap-2.5 leading-relaxed">
                                    <span className="w-6 h-6 rounded-full bg-red-100 text-[#be111a] font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                                      {i + 1}
                                    </span>
                                    <span>{doc}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Step-by-step guide */}
                          {data.stepByStepGuide.length > 0 && (
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                              <span className="text-xs sm:text-sm font-black text-slate-900 uppercase flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-blue-700" />
                                Cách thức thực hiện từng bước
                              </span>
                              <ul className="space-y-2 text-sm sm:text-base text-slate-800">
                                {data.stepByStepGuide.map((step, i) => (
                                  <li key={i} className="flex items-start gap-2.5 leading-relaxed">
                                    <span className="w-6 h-6 rounded-full bg-blue-700 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                                      {i + 1}
                                    </span>
                                    <span>{step}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        {/* State Legal Basis */}
                        {data.legalRegulations.length > 0 && (
                          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-600">
                            <Scale className="w-4 h-4 text-slate-500 shrink-0" />
                            <span className="font-bold text-slate-700">Căn cứ quy định Nhà nước:</span>
                            <span>{data.legalRegulations.join(' · ')}</span>
                          </div>
                        )}

                        {/* Direct Service Actions if Matched */}
                        {turn.matchedService && (
                          <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center gap-3">
                            <button
                              type="button"
                              onClick={() => handleOpenServiceDetail(turn.matchedService!, turn.matchedCounter)}
                              className="min-h-[48px] px-5 py-2.5 rounded-2xl bg-[#be111a] hover:bg-[#990e15] text-white font-black text-sm flex items-center gap-2 shadow-sm cursor-pointer"
                            >
                              <Printer className="w-4 h-4 text-amber-300" />
                              <span>Xem chi tiết, In phiếu & Nộp trực tuyến</span>
                              <ArrowRight className="w-4 h-4" />
                            </button>

                            {turn.matchedService.nationalPortalUrl && (
                              <a
                                href={sanitizeServiceNationalPortalUrl(turn.matchedService)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="min-h-[48px] px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 font-bold text-sm flex items-center gap-2"
                              >
                                <ExternalLink className="w-4 h-4 text-[#be111a]" />
                                <span>Mở Cổng DVC Quốc gia</span>
                              </a>
                            )}
                          </div>
                        )}

                        {/* Follow-up One-Tap Suggestions */}
                        {data.followUpSuggestions.length > 0 && (
                          <div className="pt-3 border-t border-slate-100 space-y-2">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide block">
                              Bác có thể bấm hỏi tiếp:
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {data.followUpSuggestions.map((sug, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  disabled={isLoading}
                                  onClick={() => submitQuestion(sug)}
                                  className="min-h-[44px] px-4 py-2 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-800 hover:text-[#be111a] border border-slate-200 hover:border-red-300 text-xs sm:text-sm font-bold transition-colors cursor-pointer text-left"
                                >
                                  {sug}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Loading State */}
              {isLoading && (
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#be111a] flex items-center justify-center shrink-0">
                    <Loader2 className="w-7 h-7 animate-spin" />
                  </div>
                  <div>
                    <h4 className="text-base sm:text-lg font-black text-slate-900">
                      Cháu đang tra cứu cơ sở dữ liệu và quy định Nhà nước cho Bác...
                    </h4>
                    <p className="text-sm text-slate-600 mt-0.5">
                      Bác vui lòng đợi vài giây nhé ạ.
                    </p>
                  </div>
                </div>
              )}

              {/* API Error State (Never masked silently) */}
              {apiError && !isLoading && (
                <div className="bg-red-50 rounded-3xl p-5 sm:p-6 border border-red-200 space-y-3">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-6 h-6 text-[#be111a] shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h4 className="text-base sm:text-lg font-black text-red-950">
                        Chưa thể nhận câu trả lời từ Trợ lý Gemini
                      </h4>
                      <p className="text-sm sm:text-base text-red-900 leading-relaxed">
                        {apiError.message}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => submitQuestion(apiError.pendingQuestion)}
                      className="min-h-[44px] px-4 py-2 rounded-xl bg-[#be111a] hover:bg-[#990e15] text-white font-bold text-sm cursor-pointer"
                    >
                      Thử hỏi lại
                    </button>
                    <button
                      type="button"
                      onClick={() => runLocalCatalogLookup(apiError.pendingQuestion)}
                      className="min-h-[44px] px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 font-bold text-sm cursor-pointer"
                    >
                      Tra cứu nhanh từ danh mục tại chỗ
                    </button>
                  </div>
                </div>
              )}

              {/* Bottom Confirmation Actions once an answer exists */}
              {turns.length > 0 && !isLoading && (
                <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <p className="text-sm sm:text-base font-bold text-slate-800 text-center sm:text-left">
                    Bác đã nắm rõ hướng dẫn trên chưa ạ?
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-2.5 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={handleStartNewTopic}
                      className="min-h-[48px] px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm flex items-center gap-2 cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Hỏi thủ tục mới</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmUnderstood}
                      className="min-h-[48px] px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm flex items-center gap-2 cursor-pointer"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Tôi đã hiểu rõ, cảm ơn cháu!</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          <div ref={bottomAnchorRef} />
        </div>

        {/* Sticky Accessible Prompt Input + Giant Voice Mic Bar */}
        {!isConfirmedGoodbye && (
          <div className="px-4 sm:px-6 py-3.5 bg-white border-t border-slate-200 space-y-2.5 shrink-0">
            {micError && (
              <p className="text-xs sm:text-sm text-red-700 bg-red-50 px-3 py-1.5 rounded-xl border border-red-200">
                {micError}
              </p>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitQuestion(questionInput);
              }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5"
            >
              {/* Huge Accessible Voice Button */}
              <button
                type="button"
                onClick={toggleListening}
                disabled={isLoading}
                className={`min-h-[54px] px-5 py-3 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all cursor-pointer shrink-0 ${
                  isListening
                    ? 'bg-red-600 text-white ring-4 ring-red-200'
                    : 'bg-slate-900 hover:bg-[#be111a] text-white'
                }`}
              >
                {isListening ? (
                  <>
                    <Mic className="w-5 h-5 text-amber-300" />
                    <span>Đang nghe... (Bấm dừng)</span>
                  </>
                ) : (
                  <>
                    <MicOff className="w-5 h-5 text-amber-300" />
                    <span>Bấm để nói</span>
                  </>
                )}
              </button>

              {/* Big Text Input */}
              <div className="relative flex-1 flex items-center">
                <MessageSquareText className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
                <input
                  ref={inputRef}
                  type="text"
                  value={questionInput}
                  onChange={(e) => {
                    setQuestionInput(e.target.value);
                    resetInactivityTimer();
                  }}
                  placeholder="Gõ câu hỏi của Bác (ví dụ: Làm giấy khai sinh cần mẫu đơn gì?)"
                  className="w-full min-h-[54px] pl-12 pr-4 py-3 text-base sm:text-lg bg-slate-50 border-2 border-slate-300 focus:border-[#be111a] focus:bg-white rounded-2xl text-slate-900 placeholder:text-slate-500 focus:outline-none"
                />
              </div>

              {/* Big Submit Button */}
              <button
                type="submit"
                disabled={!questionInput.trim() || isLoading}
                className="min-h-[54px] px-6 py-3 rounded-2xl bg-[#be111a] hover:bg-[#990e15] disabled:opacity-45 text-white font-black text-base flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer shrink-0"
              >
                <Send className="w-5 h-5" />
                <span>Gửi câu hỏi</span>
              </button>
            </form>

            {/* Footer Status & Timeout Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 pt-0.5">
              <div>
                {isSpeakingState ? (
                  <span className="font-bold text-[#be111a]">
                    Đang đọc to hướng dẫn cho Bác (Tạm dừng đếm ngược tự động)
                  </span>
                ) : isLoading ? (
                  <span className="font-bold text-slate-700">
                    Đang tra cứu thông tin...
                  </span>
                ) : (
                  <span>
                    Tự động quay về màn hình chờ sau <strong className="font-mono text-slate-900 tabular-nums">{secondsRemaining}s</strong> nếu không thao tác
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    stopAllSpeech();
                    onClose();
                    setCurrentScreen('standby');
                  }}
                  className="font-semibold text-slate-600 hover:text-slate-900 underline underline-offset-2 cursor-pointer"
                >
                  Về màn hình chờ
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
