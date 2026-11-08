import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  User, 
  Layers, 
  Eye, 
  ArrowRight, 
  FileText, 
  Phone, 
  CheckCircle, 
  ExternalLink,
  ChevronDown,
  LayoutGrid,
  GitBranch,
  Image as ImageIcon
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Counter, Officer, PublicService } from '../types';

export const WardMindmapView: React.FC = () => {
  const { 
    selectedWard, 
    currentWardCounters, 
    currentWardOfficers, 
    currentWardServices,
    selectService,
    setCurrentScreen 
  } = useApp();

  const [viewMode, setViewMode] = useState<'mindmap' | 'floor' | 'original'>('mindmap');
  const [selectedCounterId, setSelectedCounterId] = useState<string | null>(null);

  // Group services by counter
  const getServicesForCounter = (counterId: string): PublicService[] => {
    return currentWardServices.filter(s => s.counterId === counterId);
  };

  const activeCounter = currentWardCounters.find(c => c.id === selectedCounterId) || currentWardCounters[0];
  const activeOfficer = currentWardOfficers.find(o => o.counterId === activeCounter?.id) ||
    currentWardOfficers.find(o => o.name === activeCounter?.officerName);
  const activeServices = activeCounter ? getServicesForCounter(activeCounter.id) : [];

  return (
    <div className="min-h-screen bg-[#f4f6f9] pb-20">
      
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200 sticky top-18 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-red-700 bg-red-100 px-2 py-0.5 rounded">
                Sơ đồ cấu trúc một cửa
              </span>
              <span className="text-xs text-slate-500">
                {selectedWard.name} · {selectedWard.district}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
              THỐNG KÊ CHUYÊN VIÊN VÀ CÁC Ô DỊCH VỤ TIẾP NHẬN
            </h1>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 self-start sm:self-auto">
            <button
              onClick={() => setViewMode('mindmap')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl transition-colors ${
                viewMode === 'mindmap'
                  ? 'bg-white text-slate-900 shadow-xs ring-1 ring-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GitBranch className="w-4 h-4 text-red-600" />
              <span>Sơ đồ cây (Mindmap)</span>
            </button>

            <button
              onClick={() => setViewMode('floor')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl transition-colors ${
                viewMode === 'floor'
                  ? 'bg-white text-slate-900 shadow-xs ring-1 ring-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-4 h-4 text-blue-600" />
              <span>Mặt bằng quầy một cửa</span>
            </button>

            <button
              onClick={() => setViewMode('original')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl transition-colors ${
                viewMode === 'original'
                  ? 'bg-white text-slate-900 shadow-xs ring-1 ring-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ImageIcon className="w-4 h-4 text-emerald-600" />
              <span>Ảnh sơ đồ gốc</span>
            </button>
          </div>

        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        
        {/* VIEW 1: Mindmap Tree Mode (Faithfully matching user's uploaded mindmap) */}
        {viewMode === 'mindmap' && (
          <div className="space-y-6">
            
            {/* Mindmap Root Node */}
            <div className="text-center py-6 bg-gradient-to-r from-red-800 via-red-700 to-amber-700 rounded-3xl text-white p-6 shadow-md border border-red-600/50">
              <span className="text-xs uppercase tracking-widest font-extrabold text-amber-300 block mb-1">
                TRUNG TÂM PHỤC VỤ HÀNH CHÍNH CÔNG {selectedWard.name.toUpperCase()}
              </span>
              <h2 className="text-xl sm:text-3xl font-black tracking-tight text-white uppercase">
                Thống kê chuyên viên và phân công trách nhiệm các ô
              </h2>
              <p className="text-xs sm:text-sm text-amber-100 max-w-2xl mx-auto mt-2">
                Bác hoặc công dân có thể chạm vào từng cán bộ bên dưới để xem chi tiết các thủ tục hành chính tiếp nhận tại ô đó.
              </p>
            </div>

            {/* Officer & Counter Mindmap Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {currentWardCounters.map((counter, idx) => {
                const officer = currentWardOfficers.find(o => o.counterId === counter.id) ||
                  currentWardOfficers.find(o => o.name === counter.officerName);
                const services = getServicesForCounter(counter.id);
                const isSelected = selectedCounterId === counter.id;

                return (
                  <div
                    key={counter.id}
                    onClick={() => setSelectedCounterId(counter.id)}
                    className={`rounded-3xl border transition-all duration-200 cursor-pointer overflow-hidden flex flex-col justify-between ${
                      isSelected
                        ? 'bg-white border-red-600 shadow-lg ring-2 ring-red-400/40'
                        : 'bg-white hover:bg-slate-50 border-slate-200 shadow-xs hover:border-slate-300'
                    }`}
                  >
                    {/* Header badge */}
                    <div className="p-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
                      <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-red-100 text-red-800">
                        {counter.code}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        {services.length} thủ tục
                      </span>
                    </div>

                    {/* Officer details */}
                    <div className="p-5 flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-amber-600 text-white font-bold flex items-center justify-center shrink-0">
                          {counter.officerName.split(' ').pop()?.[0] || 'C'}
                        </div>
                        <div>
                          <h3 className="text-base font-extrabold text-slate-900 line-clamp-1">
                            {counter.officerName}
                          </h3>
                          <p className="text-xs text-red-700 font-semibold line-clamp-1">
                            {counter.primaryField}
                          </p>
                        </div>
                      </div>

                      {/* Primary duties from the image */}
                      {officer && (
                        <div className="space-y-1.5 text-xs text-slate-600 mb-3">
                          <p className="font-semibold text-slate-800">Nhiệm vụ chính:</p>
                          <ul className="space-y-1 pl-3 border-l-2 border-red-200 text-[11px]">
                            {officer.primaryDuties.map((duty, dIdx) => (
                              <li key={dIdx} className="line-clamp-2">
                                • {duty}
                              </li>
                            ))}
                          </ul>
                          {officer.concurrentRoles && officer.concurrentRoles.length > 0 && (
                            <div className="text-[11px] text-amber-800 bg-amber-50 px-2 py-1 rounded-md mt-2">
                              <strong>Kiêm nhiệm:</strong> {officer.concurrentRoles.join(', ')}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Footer trigger */}
                    <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-red-700 group-hover:underline">
                        {isSelected ? 'Đang chọn xem thủ tục' : 'Bấm xem các thủ tục'}
                      </span>
                      <ArrowRight className="w-4 h-4 text-red-600" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Active Counter's Services Panel */}
            {activeCounter && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-red-200 shadow-md animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200">
                  <div>
                    <span className="text-xs font-bold text-red-700 uppercase tracking-wider block">
                      Danh sách dịch vụ công tiếp nhận tại:
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                      {activeCounter.code} · {activeCounter.name}
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Cán bộ phụ trách: <strong>{activeCounter.officerName}</strong> ({activeCounter.primaryField})
                    </p>
                  </div>

                  <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700">
                    {activeServices.length} thủ tục hành chính
                  </span>
                </div>

                {activeServices.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">
                    <p className="text-sm">Quầy này phụ trách hướng dẫn tiếp đón chung hoặc hỗ trợ cơ sở vật chất.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {activeServices.map((service) => (
                      <div
                        key={service.id}
                        onClick={() => selectService(service)}
                        className="p-4 rounded-2xl border border-slate-200 hover:border-red-400 hover:bg-red-50/40 transition-all cursor-pointer group shadow-xs bg-slate-50/50 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span className="text-[11px] font-bold font-mono text-red-700 bg-red-100 px-2 py-0.5 rounded">
                              {service.code}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              {service.processingDuration}
                            </span>
                          </div>
                          <h3 className="text-sm font-bold text-slate-900 group-hover:text-red-700 transition-colors line-clamp-2">
                            {service.name}
                          </h3>
                          <p className="text-xs text-slate-600 line-clamp-2 mt-1">
                            {service.summary}
                          </p>
                        </div>

                        <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-700">{service.fee}</span>
                          <span className="text-red-700 font-bold flex items-center gap-1">
                            Xem hồ sơ <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        )}

        {/* VIEW 2: Floor Layout View (Mặt bằng sắp xếp các quầy một cửa) */}
        {viewMode === 'floor' && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-md">
            
            <div className="text-center max-w-2xl mx-auto mb-8">
              <span className="text-xs font-bold uppercase tracking-widest text-blue-700 bg-blue-100 px-3 py-1 rounded-full">
                Mặt Bằng Thực Tế Hội Trường
              </span>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-2">
                Sơ đồ vị trí các Ô làm việc tại UBND {selectedWard.name}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Giúp công dân, người cao tuổi định vị chính xác vị trí bàn nộp hồ sơ khi đến trụ sở.
              </p>
            </div>

            {/* Hall Blueprint */}
            <div className="max-w-4xl mx-auto bg-slate-900 rounded-3xl p-6 sm:p-8 text-white border-4 border-slate-800 shadow-xl">
              
              {/* Top Banner: Lãnh đạo & Phòng họp */}
              <div className="text-center py-2 px-4 rounded-xl bg-slate-800/80 border border-slate-700 text-xs font-bold text-slate-300 uppercase tracking-wider mb-6">
                Phòng Lãnh đạo UBND Phường & Phòng Ký duyệt Hồ sơ một cửa
              </div>

              {/* Counter Booths 1 - 6 */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                {currentWardCounters.slice(0, 6).map((counter) => (
                  <div
                    key={counter.id}
                    onClick={() => {
                      setSelectedCounterId(counter.id);
                      setViewMode('mindmap');
                    }}
                    className="p-4 rounded-2xl bg-slate-800 hover:bg-slate-700 border-2 border-slate-700 hover:border-amber-400 transition-all cursor-pointer group text-center"
                  >
                    <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-red-900/80 text-amber-300 border border-red-600/50 block w-max mx-auto mb-1">
                      {counter.code}
                    </span>
                    <h3 className="text-sm font-bold text-white group-hover:text-amber-300 line-clamp-1">
                      {counter.officerName}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                      {counter.primaryField}
                    </p>
                    <span className="text-[10px] text-amber-400/80 mt-2 block font-medium">
                      Bấm để xem các thủ tục
                    </span>
                  </div>
                ))}
              </div>

              {/* Waiting Lounge */}
              <div className="py-6 px-4 rounded-2xl bg-slate-800/40 border-2 border-dashed border-slate-700 text-center mb-6">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block">
                  Khu vực Ghế ngồi chờ cho Công dân & Người cao tuổi
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Có quạt mát, máy điều hòa, màn hình lớn hiển thị số thứ tự điện tử
                </p>
              </div>

              {/* Entrance Desk Zone: Quầy Hướng dẫn & Tiện ích */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                <div className="p-4 rounded-2xl bg-indigo-950/70 border border-indigo-700/60 text-center">
                  <span className="text-xs font-bold text-indigo-300 uppercase block mb-1">
                    Cửa vào bên trái
                  </span>
                  <h4 className="text-sm font-bold text-white">Quầy Hướng dẫn & Tiếp đón</h4>
                  <p className="text-xs text-indigo-200 mt-0.5">Đ/c Phạm Duy Đại túc trực hỗ trợ</p>
                </div>

                <div className="p-4 rounded-2xl bg-rose-950/70 border border-rose-700/60 text-center">
                  <span className="text-xs font-bold text-rose-300 uppercase block mb-1">
                    Cửa vào bên phải
                  </span>
                  <h4 className="text-sm font-bold text-white">Khu Tiện ích & Cơ sở vật chất</h4>
                  <p className="text-xs text-rose-200 mt-0.5">Đ/c Mai Thị Thanh Tâm (Nước, photo miễn phí)</p>
                </div>
              </div>

              {/* Main Entrance Door */}
              <div className="text-center mt-6 pt-3 border-t border-slate-800 text-xs font-bold text-slate-400">
                ↓↓ CỬA CHÍNH VÀO TRỤ SỞ TIẾP DÂN UBND PHƯỜNG SƠN TRÀ ↓↓
              </div>

            </div>

          </div>
        )}

        {/* VIEW 3: Original Mindmap Image View (Directly showcasing uploaded asset) */}
        {viewMode === 'original' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md text-center">
            <div className="mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                Tệp sơ đồ gốc đính kèm
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-2">
                Sơ đồ chuyên viên Trung tâm Phục vụ hành chính công phường Sơn Trà
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Tệp ảnh sơ đồ nhánh chuẩn được cung cấp trong hệ thống
              </p>
            </div>

            <div className="overflow-auto max-h-[75vh] rounded-2xl border border-slate-200 p-2 bg-slate-900/5">
              <img
                src="/assets/aistudio/so_do_345a9838.png"
                alt="Sơ đồ chuyên viên Trung tâm Phục vụ hành chính công phường Sơn Trà"
                className="max-w-full h-auto mx-auto rounded-xl shadow-md"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="mt-4 flex justify-center">
              <a
                href="/assets/aistudio/so_do_345a9838.png"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Mở ảnh gốc trong tab mới
              </a>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
