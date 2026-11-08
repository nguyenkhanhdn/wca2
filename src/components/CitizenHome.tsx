import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Mic, 
  FileText, 
  Store, 
  HeartHandshake, 
  Landmark, 
  ShoppingBag, 
  Smartphone, 
  ArrowRight, 
  Volume2, 
  Clock, 
  Layers, 
  Sparkles,
  HelpCircle,
  MapPin,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PublicService, ServiceCategory } from '../types';
import { CATEGORY_LABELS } from '../data/initialData';
import { VoiceSearchModal } from './VoiceSearchModal';
import { AIAssistantIcon } from './AIAssistantIcon';
import { removeVietnameseTones } from '../utils/speech';

export const CitizenHome: React.FC = () => {
  const { 
    selectedWard, 
    currentWardServices, 
    currentWardCounters, 
    selectService, 
    setCurrentScreen,
    readText,
    openAIAssistant
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);

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

  // Filter services by category and text search
  const filteredServices = useMemo(() => {
    return currentWardServices.filter(service => {
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
  }, [currentWardServices, selectedCategory, searchQuery]);

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

            {/* Quick Button to View Counter Map */}
            <div className="shrink-0 flex items-center gap-2">
              <button
                onClick={() => setCurrentScreen('mindmap_view')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 text-amber-200 border border-amber-300/40 text-xs sm:text-sm font-bold transition-all shadow-sm"
              >
                <Layers className="w-4 h-4 text-amber-300" />
                Xem sơ đồ các ô tiếp nhận
              </button>
            </div>
          </div>

          {/* Voice Search Box */}
          <div className="relative max-w-4xl mx-auto mt-2">
            <div className="relative flex items-center bg-white rounded-3xl shadow-xl overflow-hidden p-2 text-slate-800 focus-within:ring-4 focus-within:ring-amber-400/50 transition-all">
              
              <div className="pl-3 text-slate-400">
                <Search className="w-6 h-6" />
              </div>

              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nhập tên thủ tục (ví dụ: khai sinh, kết hôn, công chứng, trợ cấp...)"
                className="w-full px-3 py-3 text-base sm:text-lg font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden bg-transparent"
              />

              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-3 text-xs font-semibold text-slate-400 hover:text-slate-700"
                >
                  Xóa
                </button>
              )}

              {/* Big AI Assistant Microphone Button */}
              <button
                onClick={openAIAssistant}
                className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 via-[#be111a] to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-extrabold text-sm sm:text-base shadow-md hover:shadow-lg transition-all shrink-0 active:scale-95 cursor-pointer ring-2 ring-amber-300/40"
                title="Bấm để nói chuyện với Trợ lý AI Một Cửa"
              >
                <AIAssistantIcon className="w-5 h-5 text-white animate-pulse" />
                <span className="hidden sm:inline">Nói với Trợ lý AI</span>
                <span className="sm:hidden">Trợ lý AI</span>
              </button>
            </div>

            {/* Spoken Query Hints */}
            <div className="flex flex-wrap items-center gap-2 mt-3 px-2 text-xs text-slate-300">
              <span className="font-semibold text-amber-300">Gợi ý tìm nhanh:</span>
              {['Khai sinh cho con', 'Đăng ký kết hôn', 'Sao y công chứng CCCD', 'Trợ cấp người già 80 tuổi', 'Mở quán ăn'].map((hint, i) => (
                <button
                  key={i}
                  onClick={() => setSearchQuery(hint)}
                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 transition-colors"
                >
                  "{hint}"
                </button>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 -mt-4">
        
        {/* Category Cards (Suggestive Touch Cards with Icons + Text) */}
        <section className="mb-8">
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
              <button
                onClick={() => setIsVoiceModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors shadow-sm"
              >
                <Mic className="w-4 h-4" />
                Nói lại yêu cầu vào Micro
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredServices.map((service) => {
                const counter = getCounterForService(service.counterId);

                return (
                  <div
                    key={service.id}
                    onClick={() => selectService(service)}
                    className="p-5 sm:p-6 rounded-3xl bg-white hover:bg-red-50/30 border border-slate-200 hover:border-red-400 transition-all duration-200 shadow-xs hover:shadow-md cursor-pointer flex flex-col justify-between group"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-red-100 text-red-800 font-mono">
                            Mã: {service.code}
                          </span>
                          {service.isPopular && (
                            <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                              Phổ biến
                            </span>
                          )}
                        </div>

                        {/* Location Booth Tag */}
                        {counter && (
                          <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-blue-600" />
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
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>Thời hạn: <strong className="text-slate-800">{service.processingDuration}</strong></span>
                        </div>
                        <div className="text-xs text-slate-500 font-medium">
                          <span>Lệ phí: <strong className="text-red-700">{service.fee}</strong></span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Audio Preview Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            readText(service.audioScript);
                          }}
                          className="p-2.5 rounded-xl bg-slate-100 hover:bg-emerald-100 hover:text-emerald-800 text-slate-600 transition-colors"
                          title="Nghe tóm tắt thủ tục này"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>

                        {/* Touch View Guidance Button */}
                        <span className="flex items-center gap-1 px-3.5 py-2 rounded-xl bg-red-600 group-hover:bg-red-700 text-white font-bold text-xs shadow-xs transition-colors">
                          Xem hướng dẫn
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
