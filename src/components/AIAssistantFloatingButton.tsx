import React from 'react';
import { AIAssistantIcon } from './AIAssistantIcon';
import { Sparkles, Mic } from 'lucide-react';

interface AIAssistantFloatingButtonProps {
  onClick: () => void;
  isOpen?: boolean;
}

export const AIAssistantFloatingButton: React.FC<AIAssistantFloatingButtonProps> = ({
  onClick,
  isOpen = false
}) => {
  if (isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3 group animate-bounce-subtle">
      {/* Elderly-friendly Speech Bubble Hint */}
      <div 
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        className="hidden md:flex flex-col items-end cursor-pointer bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-xl border border-red-100 hover:border-red-300 transition-all transform hover:-translate-x-1"
      >
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#be111a]">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin-slow" />
          <span>TRỢ LÝ AI MỘT CỬA</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
        </div>
        <p className="text-xs font-medium text-slate-700 mt-0.5">
          Bác cần làm thủ tục gì? <strong className="text-red-700 underline underline-offset-2">Chạm để nói</strong>
        </p>
      </div>

      {/* Main Circular Floating Robot Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        aria-label="Mở Trợ lý AI Một Cửa hỗ trợ thủ tục bằng giọng nói"
        className="relative flex items-center justify-center w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-gradient-to-tr from-[#990e15] via-[#be111a] to-[#d9232d] text-white shadow-2xl hover:shadow-red-500/40 hover:scale-105 active:scale-95 transition-all duration-300 ring-4 ring-white/90 focus:outline-none focus:ring-4 focus:ring-amber-400 group cursor-pointer"
      >
        {/* Ambient Pulsing Aura */}
        <span className="absolute -inset-1.5 rounded-full bg-red-600/30 animate-ping pointer-events-none"></span>
        <span className="absolute -inset-3 rounded-full bg-amber-400/20 blur-sm pointer-events-none animate-pulse"></span>

        {/* Central Icon */}
        <div className="relative z-10 flex flex-col items-center justify-center">
          <AIAssistantIcon className="w-8 h-8 sm:w-9 sm:h-9 text-white group-hover:scale-110 transition-transform" />
          <div className="flex items-center gap-0.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-pulse"></span>
            <span className="text-[9px] font-black tracking-widest text-amber-200">AI</span>
          </div>
        </div>

        {/* Small microphone badge on the edge */}
        <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-md font-bold text-xs border-2 border-white">
          <Mic className="w-3.5 h-3.5 text-slate-900 animate-pulse" />
        </span>
      </button>
    </div>
  );
};
