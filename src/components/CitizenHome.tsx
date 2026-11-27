import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Mic, 
  FileText, 
  Store, 
  HeartHandshake, 
  ShoppingBag, 
  Smartphone, 
  ArrowRight, 
  Volume2, 
  Clock, 
  Layers, 
  Sparkles,
  HelpCircle,
  MapPin,
  CheckCircle2,
  MessageSquareText,
  Send,
  ClipboardList,
  Plus,
  Check,
  Compass
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { VoiceSearchModal } from './VoiceSearchModal';
import { AIAssistantIcon } from './AIAssistantIcon';
import { removeVietnameseTones } from '../utils/speech';
import {
  getServiceLevelInfo,
  getWardOfficeStatus,
  LIFE_SCENARIOS
} from '../utils/officeHours';

export const CitizenHome: React.FC = () => {
  const { 
    selectedWard, 
    currentWardServices, 
    currentWardCounters, 
    selectService, 
    setCurrentScreen,
    readText,
    openAIAssistant,
    visitPlanIds,
    toggleVisitPlanService,
    addMultipleToVisitPlan,
    setIsVisitPlanModalOpen
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);

  const officeStatus = getWardOfficeStatus();
  const activeScenario = LIFE_SCENARIOS.find((s) => s.id === selectedScenarioId) || null;

  // Quick categories for senior citizens
  const categories: { id: string; label: string; icon: any; color: string; desc: string }[] = [
    {
      id: 'all',
      label: 'Tất cả thủ tục',
      icon: Sparkles,
      color: 'bg-red-700 text-white',
      desc: 'Xem toàn bộ dịch vụ công của phường'
    },
    {
      id: 'tu_phap_ho_tich',
      label: 'Tư pháp và hộ tịch',
      icon: FileText,
      color: 'bg-blue-600 text-white',
      desc: 'Khai sinh, kết hôn, khai tử, công chứng, lý lịch'
    },
    {
      id: 'kinh_doanh_attp',
      label: 'Hộ kinh doanh và an toàn thực phẩm',
      icon: Store,
      color: 'bg-emerald-600 text-white',
      desc: 'Mở cửa hàng, buôn bán, an toàn thực phẩm'
    },
    {
      id: 'van_hoa_giao_duc_y_te',
      label: 'Trợ cấp và chính sách xã hội',
      icon: HeartHandshake,
      color: 'bg-teal-600 text-white',
      desc: 'Trợ cấp 80 tuổi, người khuyết tật, BHYT, học phí'
    },
    {
      id: 'huong_dan_ho_tro',
      label: 'Trợ giúp số và VNeID',
      icon: Smartphone,
      color: 'bg-indigo-600 text-white',
      desc: 'Cài đặt định danh mức 2, nộp hồ sơ trên điện thoại'
    },
    {
      id: 'cong_thuong_khac',
      label: 'Thủ tục khác và công thương',
      icon: ShoppingBag,
      color: 'bg-amber-600 text-white',
      desc: 'Bán lẻ thuốc lá, đồ uống có cồn, xác nhận hành chính'
    }
  ];

  // Filter services by scenario, category, and text search
  const filteredServices = useMemo(() => {
    return currentWardServices.filter(service => {
      if (activeScenario && !activeScenario.serviceIds.includes(service.id)) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && service.category !== selectedCategory) {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const query = removeVietnameseTones(searchQuery);
        const name = removeVietnameseTones(service.name);
        const summary = removeVietnameseTones(service.summary);
        const keywords = service.searchKeywords.map(k => removeVietnameseTones(k)).join(' ');
        const code = service.code.toLowerCase();

        return (
          name.includes(query) ||
          summary.includes(query) ||
          keywords.includes(query) ||
          code.includes(query)
        );
      }

      return true;
    });
  }, [currentWardServices, activeScenario, selectedCategory, searchQuery]);

  // Find counter info for a service
  const getCounterForService = (counterId: string) => {
    return currentWardCounters.find(c => c.id === counterId);
  };

  return (
    <div className="min-h-screen bg-[#f4f6f9] pb-20">
      
      {/* Hero Welcome & Prominent Voice Search Bar (Màu đỏ cờ chuẩn Cổng TTĐT Chính phủ #be111a) */}
      <section className="bg-gradient-to-r from-[#9b0e15] via-[#be111a] to-[#9b0e15] text-white pt-8 pb-12 px-4 sm:px-6 shadow-md border-b-4 border-[#ca8a04]">
        <div className="max-w-6xl mx-auto">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/25 text-amber-300 text-xs font-bold border border-amber-300/30 mb-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                Cổng Dịch vụ công Quốc gia · Bộ phận Một cửa
              </span>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                Kính chào Bác! Hôm nay Bác cần làm giấy tờ gì?
              </h1>
              <p className="text-amber-100 text-sm sm:text-base mt-1">
                Bác có thể chạm chọn các mục bên dưới hoặc bấm vào nút Micro để nói trực tiếp.
              </p>
            </div>

            {/* Quick Actions: Counter Map & Pre-Visit Plan */}
            <div className="shrink-0 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setIsVisitPlanModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs sm:text-sm font-black transition-all shadow-sm cursor-pointer"
              >
                <ClipboardList className="w-4 h-4" />
                <span className="tabular-nums">
                  Kế hoạch chuẩn bị ({visitPlanIds.length})
                </span>
              </button>
              <button
                onClick={() => setCurrentScreen('mindmap_view')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 text-amber-200 border border-amber-300/40 text-xs sm:text-sm font-bold transition-all shadow-sm cursor-pointer"
              >
                <Layers className="w-4 h-4 text-amber-300" />
                <span>Sơ đồ các ô</span>
              </button>
            </div>
          </div>

          {/* Unified Search & AI Q&A Prompt Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (searchQuery.trim()) {
                openAIAssistant(searchQuery);
              } else {
                openAIAssistant();
              }
            }}
            className="relative max-w-5xl mx-auto mt-2"
          >
            <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-white rounded-3xl shadow-xl overflow-hidden p-2.5 text-slate-800 focus-within:ring-4 focus-within:ring-amber-400/50 transition-all">
              
              <div className="flex items-center flex-1 min-w-0">
                <div className="pl-3 text-slate-400 shrink-0">
                  <Search className="w-6 h-6" />
                </div>

                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Gõ tên thủ tục hoặc câu hỏi (ví dụ: Làm khai sinh cần mẫu đơn gì?)"
                  className="w-full px-3 py-3 text-base sm:text-lg font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-hidden bg-transparent"
                />

                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="px-3 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 shrink-0 cursor-pointer"
                  >
                    Xóa
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="submit"
                  className="flex-1 sm:flex-initial min-h-[48px] flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm sm:text-base shadow-sm transition-colors cursor-pointer whitespace-nowrap"
                  title="Gửi câu hỏi để Trợ lý AI giải thích chi tiết theo quy định"
                >
                  <Send className="w-4 h-4 text-amber-300" />
                  <span>Hỏi đáp AI</span>
                </button>

                {/* Big AI Assistant Microphone Button */}
                <button
                  type="button"
                  onClick={() => openAIAssistant(searchQuery.trim() || undefined)}
                  className="flex-1 sm:flex-initial min-h-[48px] flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-red-600 via-[#be111a] to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-extrabold text-sm sm:text-base shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer ring-2 ring-amber-300/40 whitespace-nowrap"
                  title="Bấm để nói chuyện với Trợ lý AI Một Cửa"
                >
                  <AIAssistantIcon className="w-5 h-5 text-white" />
                  <span className="hidden sm:inline">Nói với Trợ lý</span>
                  <span className="sm:hidden">Bấm nói</span>
                </button>
              </div>
            </div>

            {/* Easy One-Tap Questions for Elderly Citizens */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs sm:text-sm font-bold text-amber-200 flex items-center gap-1.5">
                  <MessageSquareText className="w-4 h-4 text-amber-300" />
                  Bác chạm nhanh vào câu hỏi bên dưới để Trợ lý AI giải thích ngay:
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {[
                  'Làm giấy khai sinh cần mẫu tờ khai và giấy tờ gì?',
                  'Người cao tuổi 70 đến 80 tuổi được hưởng trợ cấp thế nào?',
                  'Thủ tục giải quyết chế độ Hưu trí làm ở đâu?',
                  'Mắt kém chưa biết viết tờ khai thì ai hỗ trợ?'
                ].map((q, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => openAIAssistant(q)}
                    className="min-h-[52px] px-4 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/25 text-white text-left text-xs sm:text-sm font-bold transition-all flex items-center justify-between gap-2 cursor-pointer"
                  >
                    <span className="line-clamp-2 leading-snug">{q}</span>
                    <ArrowRight className="w-4 h-4 text-amber-300 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </form>

        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 -mt-4 space-y-8">
        
        {/* Operational Utility Strip: Live Office Hours & Best Time to Visit */}
        <section className="bg-white rounded-2xl px-5 py-4 border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              officeStatus.isOpen ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800'
            }`}>
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 text-sm font-bold text-slate-900">
                <span>{officeStatus.statusLabel}</span>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span className="text-xs font-semibold text-slate-600">
                  {selectedWard.address}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                {officeStatus.detailText} {officeStatus.bestVisitTip}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsVisitPlanModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
            >
              {visitPlanIds.length > 0
                ? `Mở kế hoạch chuẩn bị (${visitPlanIds.length} thủ tục)`
                : 'Lập kế hoạch chuẩn bị ở nhà'}
            </button>
          </div>
        </section>

        {/* Life-Event Pre-Visit Lookup (Tra cứu theo tình huống đời sống) */}
        <section>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3 px-1">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Compass className="w-4 h-4 text-red-700" />
              Tìm hiểu trước theo tình huống gia đình
            </h2>
            {activeScenario && (
              <button
                type="button"
                onClick={() => setSelectedScenarioId(null)}
                className="text-xs font-bold text-red-700 hover:underline cursor-pointer"
              >
                Bỏ chọn tình huống
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {LIFE_SCENARIOS.map((sc) => {
              const isActive = selectedScenarioId === sc.id;
              return (
                <button
                  key={sc.id}
                  type="button"
                  onClick={() => {
                    if (isActive) {
                      setSelectedScenarioId(null);
                    } else {
                      setSelectedScenarioId(sc.id);
                      setSelectedCategory('all');
                      setSearchQuery('');
                    }
                  }}
                  className={`p-4 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                    isActive
                      ? 'bg-red-800 text-white border-red-700 shadow-sm'
                      : 'bg-white hover:bg-slate-50 text-slate-900 border-slate-200'
                  }`}
                >
                  <div>
                    <h3 className={`text-sm sm:text-base font-bold ${isActive ? 'text-white' : 'text-slate-900'}`}>
                      {sc.title}
                    </h3>
                    <p className={`text-xs mt-1 leading-relaxed ${isActive ? 'text-red-100' : 'text-slate-600'}`}>
                      {sc.subtitle}
                    </p>
                  </div>
                  <div className={`text-xs font-bold tabular-nums ${isActive ? 'text-amber-300' : 'text-red-700'}`}>
                    {isActive ? 'Đang lọc hiển thị bên dưới' : `Xem ${sc.serviceIds.length} thủ tục liên quan`}
                  </div>
                </button>
              );
            })}
          </div>

          {activeScenario && (
            <div className="mt-3 p-4 rounded-2xl bg-amber-50 border border-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs sm:text-sm text-amber-950 leading-relaxed">
                <strong className="font-bold">Lưu ý trước khi đi ({activeScenario.title}):</strong>{' '}
                {activeScenario.preVisitTip}
              </div>
              <button
                type="button"
                onClick={() => {
                  addMultipleToVisitPlan(activeScenario.serviceIds);
                  setIsVisitPlanModalOpen(true);
                }}
                className="shrink-0 px-4 py-2 rounded-xl bg-[#be111a] hover:bg-red-700 text-white text-xs font-bold cursor-pointer whitespace-nowrap"
              >
                Gộp nhóm này vào Kế hoạch đi nộp
              </button>
            </div>
          )}
        </section>

        {/* Category Cards (Suggestive Touch Cards with Icons + Text) */}
        <section>
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-red-600" />
              CHỌN NHÓM DỊCH VỤ CÔNG PHỔ BIẾN
            </h2>
            <span className="text-xs text-slate-500">
              Chạm vào nhóm để lọc danh sách
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedScenarioId(null);
                    setSelectedCategory(cat.id);
                    setSearchQuery('');
                  }}
                  className={`p-4 rounded-2xl text-left transition-all duration-200 flex flex-col justify-between border cursor-pointer ${
                    isSelected
                      ? 'bg-red-800 text-white border-red-700 shadow-md ring-2 ring-red-400/50 scale-[1.02]'
                      : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 shadow-xs hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-white/20 text-white' : cat.color
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <div>
                    <h3 className={`text-sm font-bold tracking-tight line-clamp-1 ${
                      isSelected ? 'text-white' : 'text-slate-900'
                    }`}>
                      {cat.label}
                    </h3>
                    <p className={`text-[11px] mt-1 line-clamp-2 ${
                      isSelected ? 'text-slate-200' : 'text-slate-500'
                    }`}>
                      {cat.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Public Services List */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 px-1">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                Danh sách thủ tục hành chính ({filteredServices.length})
              </h2>
              <p className="text-xs text-slate-500">
                {selectedCategory !== 'all' 
                  ? `Đang xem nhóm: ${categories.find(c => c.id === selectedCategory)?.label}`
                  : 'Tất cả các dịch vụ tiếp nhận tại UBND Phường'}
              </p>
            </div>

            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs font-semibold text-red-700 hover:underline self-start sm:self-auto"
              >
                Xóa bộ lọc tìm kiếm
              </button>
            )}
          </div>

          {filteredServices.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-xs my-4">
              <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">Không tìm thấy thủ tục nào phù hợp</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
                Bác có thể thử tìm bằng từ khóa khác hoặc bấm nút Micro bên dưới để nói cho hệ thống nghe.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => openAIAssistant(searchQuery)}
                  className="min-h-[48px] inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#be111a] hover:bg-red-700 text-white font-bold text-sm transition-colors shadow-sm cursor-pointer"
                >
                  <MessageSquareText className="w-4 h-4" />
                  Hỏi Trợ lý AI câu hỏi này ngay
                </button>
                <button
                  type="button"
                  onClick={() => setIsVoiceModalOpen(true)}
                  className="min-h-[48px] inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-colors shadow-sm cursor-pointer"
                >
                  <Mic className="w-4 h-4" />
                  Nói lại yêu cầu vào Micro
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredServices.map((service) => {
                const counter = getCounterForService(service.counterId);
                const levelInfo = getServiceLevelInfo(service.level);
                const isPlanned = visitPlanIds.includes(service.id);

                return (
                  <div
                    key={service.id}
                    onClick={() => selectService(service)}
                    className="p-5 sm:p-6 rounded-3xl bg-white hover:bg-red-50/30 border border-slate-200 hover:border-red-400 transition-all duration-200 shadow-xs hover:shadow-md cursor-pointer flex flex-col justify-between group"
                  >
                    <div>
                      {/* Clean Inline Metadata Header */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2 text-xs text-slate-500">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono font-bold text-red-800">
                            {service.code}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className={levelInfo.canOnlineFromHome ? 'text-emerald-700 font-semibold' : 'text-slate-600 font-medium'}>
                            {levelInfo.shortLabel}
                          </span>
                        </div>

                        {counter && (
                          <span className="font-bold text-blue-800 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-blue-600" />
                            {counter.code}
                          </span>
                        )}
                      </div>

                      {/* Service Title */}
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-red-700 transition-colors tracking-tight line-clamp-2 mb-2">
                        {service.name}
                      </h3>

                      {/* Summary */}
                      <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                        {service.summary}
                      </p>
                    </div>

                    {/* Metadata & Actions */}
                    <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                      <div className="space-y-0.5 tabular-nums">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>Thời hạn: <strong className="text-slate-800">{service.processingDuration}</strong></span>
                        </div>
                        <div className="text-xs text-slate-500 font-medium">
                          <span>Lệ phí: <strong className="text-red-700">{service.fee}</strong></span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Save to Pre-Visit Plan Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleVisitPlanService(service.id);
                          }}
                          className={`inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer whitespace-nowrap ${
                            isPlanned
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                          title="Lưu vào kế hoạch chuẩn bị trước khi đến phường"
                        >
                          {isPlanned ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                          <span>{isPlanned ? 'Đã lưu' : 'Lưu kế hoạch'}</span>
                        </button>

                        {/* Audio Preview Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            readText(service.audioScript);
                          }}
                          className="p-2.5 rounded-xl bg-slate-100 hover:bg-emerald-100 hover:text-emerald-800 text-slate-600 transition-colors cursor-pointer"
                          title="Nghe tóm tắt thủ tục này"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>

                        {/* Touch View Guidance Button */}
                        <span className="flex items-center gap-1 px-3.5 py-2 rounded-xl bg-red-600 group-hover:bg-red-700 text-white font-bold text-xs shadow-xs transition-colors whitespace-nowrap">
                          Chi tiết
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

      </main>

      {/* Voice Recognition Modal */}
      <VoiceSearchModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onSelectService={(service) => selectService(service)}
      />

    </div>
  );
};
