import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Search, X, Volume2, ArrowRight } from 'lucide-react';
import { VoiceRecognizer, removeVietnameseTones } from '../utils/speech';
import { PublicService } from '../types';
import { useApp } from '../context/AppContext';

interface VoiceSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectService: (service: PublicService) => void;
}

export const VoiceSearchModal: React.FC<VoiceSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectService
}) => {
  const { currentWardServices, readText } = useApp();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [matchedServices, setMatchedServices] = useState<PublicService[]>([]);
  const recognizerRef = useRef<VoiceRecognizer | null>(null);

  // Suggested spoken phrases for quick testing
  const SAMPLE_QUERIES = [
    'Làm giấy khai sinh cho cháu',
    'Đăng ký kết hôn',
    'Sao y công chứng căn cước',
    'Chứng thực chữ ký sơ yếu lý lịch',
    'Mở quán ăn buôn bán',
    'Trợ cấp cho người 80 tuổi',
    'Cài đặt VNeID mức 2'
  ];

  // Initialize SpeechRecognizer
  useEffect(() => {
    if (!isOpen) {
      if (recognizerRef.current) {
        recognizerRef.current.stop();
      }
      setIsListening(false);
      setTranscript('');
      setErrorMessage(null);
      setMatchedServices([]);
      return;
    }

    const recognizer = new VoiceRecognizer({
      onStart: () => {
        setIsListening(true);
        setErrorMessage(null);
      },
      onResult: (text, isFinal) => {
        setTranscript(text);
        if (text) {
          findMatches(text);
        }
      },
      onError: (err) => {
        setIsListening(false);
        setErrorMessage(err);
      },
      onEnd: () => {
        setIsListening(false);
      }
    });

    recognizerRef.current = recognizer;
    recognizer.start();

    return () => {
      recognizer.stop();
    };
  }, [isOpen]);

  const toggleListening = () => {
    if (!recognizerRef.current) return;
    if (isListening) {
      recognizerRef.current.stop();
    } else {
      setTranscript('');
      recognizerRef.current.start();
    }
  };

  const findMatches = (searchText: string) => {
    const normSearch = removeVietnameseTones(searchText);
    if (!normSearch) {
      setMatchedServices([]);
      return;
    }

    const tokens = normSearch.split(/\s+/).filter(t => t.length > 1);

    const scored = currentWardServices.map(service => {
      const normName = removeVietnameseTones(service.name);
      const normSummary = removeVietnameseTones(service.summary);
      const normKeywords = service.searchKeywords.map(k => removeVietnameseTones(k)).join(' ');

      let score = 0;
      if (normName.includes(normSearch)) score += 20;
      if (normKeywords.includes(normSearch)) score += 15;
      if (normSummary.includes(normSearch)) score += 10;

      tokens.forEach(tok => {
        if (normName.includes(tok)) score += 4;
        if (normKeywords.includes(tok)) score += 3;
        if (normSummary.includes(tok)) score += 1;
      });

      return { service, score };
    });

    const filtered = scored
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.service);

    setMatchedServices(filtered);
  };

  const handleSelectSample = (query: string) => {
    setTranscript(query);
    findMatches(query);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-gradient-to-r from-red-700 to-amber-700 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Mic className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Tìm kiếm bằng giọng nói</h2>
              <p className="text-xs text-amber-100">Bác hãy nói thủ tục cần làm, hệ thống sẽ gợi ý ngay</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors text-white"
            aria-label="Đóng"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Microphone animation section */}
        <div className="p-6 text-center bg-slate-50 border-b border-slate-200">
          <div className="relative inline-block mb-4">
            {isListening && (
              <>
                <span className="absolute inset-0 rounded-full bg-red-400/30 animate-ping"></span>
                <span className="absolute -inset-2 rounded-full bg-red-500/20 animate-pulse"></span>
              </>
            )}
            <button
              onClick={toggleListening}
              className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-transform shadow-lg ${
                isListening 
                  ? 'bg-red-600 text-white scale-105' 
                  : 'bg-slate-800 text-white hover:bg-slate-700'
              }`}
              aria-label={isListening ? 'Đang lắng nghe' : 'Bấm để nói'}
            >
              {isListening ? (
                <Mic className="w-12 h-12 animate-pulse" />
              ) : (
                <MicOff className="w-10 h-10 text-slate-300" />
              )}
            </button>
          </div>

          <p className="text-base font-semibold text-slate-800">
            {isListening ? (
              <span className="text-red-700 flex items-center justify-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping"></span>
                Hệ thống đang lắng nghe Bác nói...
              </span>
            ) : (
              'Bác nhấn vào hình chiếc Micro phía trên để nói'
            )}
          </p>

          {transcript ? (
            <div className="mt-3 p-3 bg-white rounded-xl border border-slate-200 shadow-sm max-w-lg mx-auto">
              <span className="text-xs text-slate-500 block mb-1">Nội dung vừa nghe được:</span>
              <p className="text-lg font-bold text-red-900">"{transcript}"</p>
            </div>
          ) : (
            <p className="text-xs text-slate-500 mt-2">
              (Bác có thể nói: "Làm giấy khai sinh", "Chứng thực lý lịch", "Trợ cấp người cao tuổi"...)
            </p>
          )}

          {errorMessage && (
            <div className="mt-2 text-xs text-amber-700 bg-amber-50 py-1.5 px-3 rounded-lg inline-block border border-amber-200">
              {errorMessage}
            </div>
          )}
        </div>

        {/* Quick Click Prompts */}
        <div className="px-6 py-3 bg-amber-50/60 border-b border-amber-100">
          <div className="flex items-center gap-2 mb-2">
            <Volume2 className="w-4 h-4 text-amber-700" />
            <span className="text-xs font-semibold text-amber-900 uppercase tracking-wider">
              Hoặc bấm nhanh câu hỏi mẫu:
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_QUERIES.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectSample(q)}
                className="text-xs font-medium px-3 py-1.5 bg-white hover:bg-amber-100 hover:text-amber-900 text-slate-700 rounded-lg border border-amber-200 transition-colors text-left"
              >
                "{q}"
              </button>
            ))}
          </div>
        </div>

        {/* Search Results list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <span>Kết quả thủ tục phù hợp ({matchedServices.length})</span>
            {transcript && <span>Tìm theo: "{transcript}"</span>}
          </div>

          {matchedServices.length === 0 ? (
            <div className="py-8 text-center text-slate-500">
              <Search className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-sm">Chưa có kết quả. Bác hãy thử nói tên giấy tờ hoặc chọn câu hỏi mẫu ở trên.</p>
            </div>
          ) : (
            matchedServices.map((service) => (
              <div
                key={service.id}
                onClick={() => {
                  onSelectService(service);
                  onClose();
                }}
                className="p-4 rounded-2xl border border-slate-200 hover:border-red-400 hover:bg-red-50/50 transition-all cursor-pointer group shadow-sm bg-white flex items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded">
                      Mã: {service.code}
                    </span>
                    <span className="text-xs text-slate-500">
                      {service.processingDuration} · {service.fee}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-red-700 transition-colors">
                    {service.name}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-1">
                    {service.summary}
                  </p>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  <span className="text-xs font-medium px-3 py-2 bg-slate-100 group-hover:bg-red-600 group-hover:text-white rounded-xl transition-colors flex items-center gap-1">
                    Xem hướng dẫn
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold bg-white hover:bg-slate-200 text-slate-800 rounded-xl border border-slate-300 transition-colors"
          >
            Đóng cửa sổ
          </button>
        </div>
      </div>
    </div>
  );
};
