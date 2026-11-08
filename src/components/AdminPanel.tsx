import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Layers, 
  FileText, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  RotateCcw, 
  Download, 
  Upload, 
  ArrowLeft,
  Check,
  X,
  Volume2,
  Phone,
  Clock,
  CreditCard,
  UserCheck,
  LogOut
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Ward, Counter, Officer, PublicService, ServiceCategory, ServiceLevel } from '../types';

export const AdminPanel: React.FC = () => {
  const {
    wards,
    counters,
    officers,
    services,
    selectedWardId,
    selectedWard,
    setSelectedWardId,
    setCurrentScreen,
    addWard,
    updateWard,
    deleteWard,
    addCounter,
    updateCounter,
    deleteCounter,
    addOfficer,
    updateOfficer,
    deleteOfficer,
    addService,
    updateService,
    deleteService,
    resetToDefault,
    exportBackupJSON,
    importBackupJSON,
    currentWardCounters,
    currentWardOfficers,
    currentWardServices,
    logoutAdmin
  } = useApp();

  const [activeTab, setActiveTab] = useState<'wards' | 'counters' | 'services' | 'backup'>('services');

  // Edit / Add Ward modal state
  const [editingWard, setEditingWard] = useState<Ward | null>(null);
  const [isWardModalOpen, setIsWardModalOpen] = useState(false);

  // Edit / Add Counter modal state
  const [editingCounter, setEditingCounter] = useState<Counter | null>(null);
  const [isCounterModalOpen, setIsCounterModalOpen] = useState(false);

  // Edit / Add Service modal state
  const [editingService, setEditingService] = useState<PublicService | null>(null);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);

  // Import JSON input
  const [importJsonText, setImportJsonText] = useState('');

  // ----------------- Ward Handlers -----------------
  const handleSaveWard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWard) return;

    if (wards.some(w => w.id === editingWard.id)) {
      updateWard(editingWard);
    } else {
      addWard(editingWard);
    }
    setIsWardModalOpen(false);
    setEditingWard(null);
  };

  const handleOpenAddWard = () => {
    const newId = `ward-${Date.now()}`;
    setEditingWard({
      id: newId,
      name: 'Phường mới',
      district: 'Thành phố Đà Nẵng',
      city: 'Thành phố Đà Nẵng',
      address: 'Số 06 Nguyễn Phan Vinh, phường Sơn Trà, thành phố Đà Nẵng',
      hotline: '0913 415 457',
      workingHours: 'Sáng 07h30 - 11h30 | Chiều 13h30 - 17h00',
      supportOfficer: 'Cán bộ hướng dẫn một cửa',
      description: 'Bộ phận Tiếp nhận và Trả kết quả một cửa điện tử'
    });
    setIsWardModalOpen(true);
  };

  // ----------------- Counter Handlers -----------------
  const handleSaveCounter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCounter) return;

    if (counters.some(c => c.id === editingCounter.id)) {
      updateCounter(editingCounter);
    } else {
      addCounter(editingCounter);
    }
    setIsCounterModalOpen(false);
    setEditingCounter(null);
  };

  const handleOpenAddCounter = () => {
    const newId = `counter-${Date.now()}`;
    setEditingCounter({
      id: newId,
      wardId: selectedWardId,
      code: `Ô số ${currentWardCounters.length + 1}`,
      name: 'Quầy tiếp nhận thủ tục mới',
      officerId: `officer-${Date.now()}`,
      officerName: 'Đ/c Cán bộ phụ trách',
      primaryField: 'Lĩnh vực chuyên môn',
      description: 'Tiếp nhận hồ sơ và trả kết quả',
      positionNumber: currentWardCounters.length + 1,
      colorTheme: 'blue',
      isActive: true
    });
    setIsCounterModalOpen(true);
  };

  // ----------------- Service Handlers -----------------
  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;

    if (services.some(s => s.id === editingService.id)) {
      updateService(editingService);
    } else {
      addService(editingService);
    }
    setIsServiceModalOpen(false);
    setEditingService(null);
  };

  const handleOpenAddService = () => {
    const newId = `srv-${Date.now()}`;
    setEditingService({
      id: newId,
      wardId: selectedWardId,
      code: `1.000${Math.floor(100 + Math.random() * 900)}`,
      name: 'Tên thủ tục hành chính mới',
      category: 'tu_phap_ho_tich',
      level: 'toan_trinh',
      counterId: currentWardCounters[0]?.id || 'counter-1',
      summary: 'Tóm tắt ngắn gọn thủ tục, hồ sơ và các giấy tờ cần thiết cho người dân.',
      processingDuration: 'Trong ngày làm việc',
      fee: 'Miễn phí',
      audioScript: 'Chào Bác! Để thực hiện thủ tục này, Bác mang theo Căn cước công dân đến nộp tại ô tiếp nhận theo hướng dẫn.',
      searchKeywords: ['thủ tục mới', 'hồ sơ'],
      requiredDocuments: [
        {
          id: `doc-${Date.now()}-1`,
          name: 'Đơn / Tờ khai theo mẫu quy định',
          note: 'Cán bộ phát miễn phí tại quầy',
          isRequired: true,
          isOriginal: true,
          isCopyOrCertified: false
        },
        {
          id: `doc-${Date.now()}-2`,
          name: 'Căn cước công dân của người làm thủ tục',
          note: 'Xuất trình bản chính để đối chiếu',
          isRequired: true,
          isOriginal: true,
          isCopyOrCertified: false
        }
      ],
      steps: [
        {
          stepNumber: 1,
          title: 'Lấy số thứ tự và nộp hồ sơ',
          description: 'Công dân đến bàn tiếp nhận nộp hồ sơ và giấy tờ tùy thân.'
        },
        {
          stepNumber: 2,
          title: 'Nhận kết quả và đóng lệ phí',
          description: 'Nhận giấy hẹn hoặc nhận kết quả trực tiếp.'
        }
      ]
    });
    setIsServiceModalOpen(true);
  };

  const handleDownloadBackup = () => {
    const json = exportBackupJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dvc_sontra_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportSubmit = () => {
    if (!importJsonText.trim()) {
      alert('Vui lòng dán chuỗi JSON hợp lệ.');
      return;
    }
    const success = importBackupJSON(importJsonText);
    if (success) {
      setImportJsonText('');
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f6f9] pb-20">
      
      {/* Top Header (Màu đỏ cờ chuẩn Cổng TTĐT Chính phủ #be111a) */}
      <div className="bg-gradient-to-r from-[#9b0e15] via-[#be111a] to-[#9b0e15] text-white border-b-4 border-[#ca8a04] sticky top-18 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentScreen('citizen_home')}
              className="p-2 rounded-xl bg-black/20 hover:bg-black/30 text-white transition-colors"
              title="Quay lại Kiosk công dân"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  Hệ Thống Quản Trị CMS Cổng DVC
                </span>
                <span className="text-xs text-amber-100">
                  {selectedWard.name} ({selectedWard.city})
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Quản lý Danh mục Phường, Sơ đồ Ô & Dịch vụ công
              </h1>
            </div>
          </div>

          {/* Quick Return to Kiosk button & Logout */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setCurrentScreen('citizen_home')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm shadow-md transition-colors"
            >
              <span>Về Kiosk Công dân</span>
            </button>
            <button
              onClick={() => {
                logoutAdmin();
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-black/30 hover:bg-black/50 text-white font-bold text-xs sm:text-sm border border-white/20 transition-colors"
              title="Đăng xuất tài khoản quản trị"
            >
              <LogOut className="w-4 h-4 text-amber-300" />
              <span>Đăng xuất</span>
            </button>
          </div>

        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-1 border-t border-slate-800/80 pt-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('services')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-colors flex items-center gap-2 shrink-0 ${
              activeTab === 'services'
                ? 'bg-slate-100 text-slate-900'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileText className="w-4 h-4 text-red-600" />
            <span>Danh mục Dịch vụ công ({currentWardServices.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('counters')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-colors flex items-center gap-2 shrink-0 ${
              activeTab === 'counters'
                ? 'bg-slate-100 text-slate-900'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Layers className="w-4 h-4 text-blue-600" />
            <span>Sơ đồ các Ô & Cán bộ ({currentWardCounters.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('wards')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-colors flex items-center gap-2 shrink-0 ${
              activeTab === 'wards'
                ? 'bg-slate-100 text-slate-900'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4 text-emerald-600" />
            <span>Danh mục Phường / Xã ({wards.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-colors flex items-center gap-2 shrink-0 ${
              activeTab === 'backup'
                ? 'bg-slate-100 text-slate-900'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Download className="w-4 h-4 text-amber-500" />
            <span>Sao lưu & Khôi phục dữ liệu</span>
          </button>
        </div>
      </div>

      {/* Main Tab View */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        
        {/* TAB 1: SERVICES MANAGEMENT */}
        {activeTab === 'services' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Dịch vụ công của {selectedWard.name}
                </h2>
                <p className="text-xs text-slate-500">
                  Quản lý mã thủ tục, phí, thời hạn, thành phần hồ sơ và lời đọc hướng dẫn âm thanh
                </p>
              </div>

              <button
                onClick={handleOpenAddService}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm Dịch vụ mới</span>
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                      <th className="py-3 px-4">Mã TTHC</th>
                      <th className="py-3 px-4">Tên thủ tục</th>
                      <th className="py-3 px-4">Ô tiếp nhận</th>
                      <th className="py-3 px-4">Thời hạn & Lệ phí</th>
                      <th className="py-3 px-4">Hồ sơ</th>
                      <th className="py-3 px-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {currentWardServices.map((service) => {
                      const counter = counters.find(c => c.id === service.counterId);

                      return (
                        <tr key={service.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-red-700 whitespace-nowrap">
                            {service.code}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-900 max-w-xs">
                            <div>{service.name}</div>
                            <div className="text-[11px] font-normal text-slate-500 line-clamp-1">{service.summary}</div>
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                              {counter ? counter.code : service.counterId}
                            </span>
                            <div className="text-[10px] text-slate-400 mt-0.5">{counter?.officerName}</div>
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="font-semibold text-slate-800">{service.processingDuration}</div>
                            <div className="text-[11px] text-red-700 font-bold">{service.fee}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium">
                              {service.requiredDocuments.length} giấy tờ
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-2">
                            <button
                              onClick={() => {
                                setEditingService(service);
                                setIsServiceModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors inline-flex"
                              title="Chỉnh sửa"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`Xóa dịch vụ: "${service.name}"?`)) {
                                  deleteService(service.id);
                                }
                              }}
                              className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors inline-flex"
                              title="Xóa"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: COUNTERS & OFFICERS MANAGEMENT */}
        {activeTab === 'counters' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Sơ đồ các Ô tiếp nhận của {selectedWard.name}
                </h2>
                <p className="text-xs text-slate-500">
                  Quản lý các ô, bàn tiếp nhận và phân công cán bộ phụ trách
                </p>
              </div>

              <button
                onClick={handleOpenAddCounter}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm Ô tiếp nhận mới</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentWardCounters.map((counter) => {
                const officer = officers.find(o => o.counterId === counter.id) ||
                  officers.find(o => o.name === counter.officerName);
                const assignedServicesCount = services.filter(s => s.counterId === counter.id).length;

                return (
                  <div key={counter.id} className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-blue-100 text-blue-900">
                          {counter.code}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          {assignedServicesCount} thủ tục
                        </span>
                      </div>

                      <h3 className="text-base font-extrabold text-slate-900 mb-1">
                        {counter.name}
                      </h3>
                      <p className="text-xs font-semibold text-red-700 mb-2">
                        {counter.primaryField}
                      </p>

                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-700 space-y-1">
                        <div className="font-bold flex items-center gap-1.5 text-slate-900">
                          <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                          {counter.officerName}
                        </div>
                        <p className="text-slate-500 text-[11px]">{counter.description}</p>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditingCounter(counter);
                          setIsCounterModalOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors flex items-center gap-1"
                      >
                        <Edit3 className="w-3 h-3" />
                        Sửa
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Xóa ô tiếp nhận "${counter.code}"?`)) {
                            deleteCounter(counter.id);
                          }
                        }}
                        className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                        title="Xóa ô"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: WARDS MANAGEMENT */}
        {activeTab === 'wards' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Danh mục các Phường / Xã trong hệ thống
                </h2>
                <p className="text-xs text-slate-500">
                  Mỗi phường có thể thiết lập sơ đồ ô và danh mục dịch vụ riêng biệt
                </p>
              </div>

              <button
                onClick={handleOpenAddWard}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm Phường mới</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {wards.map((ward) => {
                const isCurrent = ward.id === selectedWardId;
                const wardServices = services.filter(s => s.wardId === ward.id).length;
                const wardCounters = counters.filter(c => c.wardId === ward.id).length;

                return (
                  <div
                    key={ward.id}
                    className={`bg-white rounded-3xl p-6 border transition-all flex flex-col justify-between ${
                      isCurrent
                        ? 'border-red-600 ring-2 ring-red-400/40 shadow-md'
                        : 'border-slate-200 shadow-xs'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {ward.district}
                        </span>
                        {isCurrent && (
                          <span className="text-xs font-bold px-2 py-0.5 rounded bg-red-100 text-red-800">
                            Đang kích hoạt
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-black text-slate-900">
                        {ward.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {ward.address}
                      </p>

                      <div className="mt-4 space-y-1.5 text-xs text-slate-600">
                        <div>Hotline: <strong className="text-slate-800">{ward.hotline}</strong></div>
                        <div>Giờ làm: <span className="text-slate-700">{ward.workingHours}</span></div>
                        <div className="pt-2 flex items-center gap-3 text-slate-500">
                          <span>{wardCounters} ô tiếp nhận</span>
                          <span>·</span>
                          <span>{wardServices} thủ tục</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      {!isCurrent ? (
                        <button
                          onClick={() => setSelectedWardId(ward.id)}
                          className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors"
                        >
                          Chọn làm việc
                        </button>
                      ) : (
                        <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Đang dùng
                        </span>
                      )}

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingWard(ward);
                            setIsWardModalOpen(true);
                          }}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                          title="Sửa thông tin phường"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Xóa phường "${ward.name}"?`)) {
                              deleteWard(ward.id);
                            }
                          }}
                          className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                          title="Xóa phường"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: BACKUP, RESTORE & RESET */}
        {activeTab === 'backup' && (
          <div className="max-w-3xl mx-auto space-y-6">
            
            {/* Export */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
                <Download className="w-5 h-5 text-blue-600" />
                Xuất tệp Sao lưu Dữ liệu (Export Backup JSON)
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Tải xuống toàn bộ dữ liệu cấu hình các phường, sơ đồ ô và danh mục dịch vụ công để lưu trữ an toàn hoặc chuyển sang máy chủ khác.
              </p>
              <button
                onClick={handleDownloadBackup}
                className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 transition-colors shadow-xs"
              >
                <Download className="w-4 h-4" />
                Tải file cấu hình JSON
              </button>
            </div>

            {/* Import */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
                <Upload className="w-5 h-5 text-emerald-600" />
                Khôi phục từ tệp JSON (Import Backup)
              </h3>
              <p className="text-xs text-slate-500 mb-3">
                Dán nội dung tệp JSON đã lưu trước đó vào ô bên dưới để phục hồi hệ thống.
              </p>
              <textarea
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                rows={5}
                placeholder="Dán mã JSON vào đây..."
                className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
              <button
                onClick={handleImportSubmit}
                className="mt-3 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 transition-colors shadow-xs"
              >
                <Upload className="w-4 h-4" />
                Nhập dữ liệu ngay
              </button>
            </div>

            {/* Reset to standard Son Tra ward */}
            <div className="bg-red-50/70 rounded-3xl p-6 sm:p-8 border-2 border-red-200">
              <h3 className="text-base font-bold text-red-950 mb-1 flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-red-700" />
                Khôi phục Dữ liệu Mặc định Phường Sơn Trà
              </h3>
              <p className="text-xs text-red-800 mb-4 leading-relaxed">
                Đưa toàn bộ hệ thống trở về trạng thái gốc của Phường Sơn Trà theo đúng sơ đồ mindmap 8 cán bộ đính kèm và danh mục dịch vụ công chuẩn Quốc gia.
              </p>
              <button
                onClick={resetToDefault}
                className="px-5 py-2.5 rounded-2xl bg-red-700 hover:bg-red-800 text-white font-bold text-xs flex items-center gap-2 transition-colors shadow-xs"
              >
                <RotateCcw className="w-4 h-4" />
                Khôi phục về mặc định gốc
              </button>
            </div>

          </div>
        )}

      </div>

      {/* MODAL: EDIT SERVICE */}
      {isServiceModalOpen && editingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 bg-red-700 text-white">
              <h3 className="font-bold text-base">
                {services.some(s => s.id === editingService.id) ? 'Chỉnh sửa Thủ tục' : 'Thêm Thủ tục Mới'}
              </h3>
              <button onClick={() => setIsServiceModalOpen(false)} className="text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Mã TTHC:</label>
                  <input
                    type="text"
                    required
                    value={editingService.code}
                    onChange={e => setEditingService({ ...editingService, code: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Ô tiếp nhận:</label>
                  <select
                    value={editingService.counterId}
                    onChange={e => setEditingService({ ...editingService, counterId: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-slate-800"
                  >
                    {currentWardCounters.map(c => (
                      <option key={c.id} value={c.id}>{c.code} - {c.officerName}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Tên thủ tục hành chính:</label>
                <input
                  type="text"
                  required
                  value={editingService.name}
                  onChange={e => setEditingService({ ...editingService, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Thời hạn giải quyết:</label>
                  <input
                    type="text"
                    required
                    value={editingService.processingDuration}
                    onChange={e => setEditingService({ ...editingService, processingDuration: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Lệ phí nhà nước:</label>
                  <input
                    type="text"
                    required
                    value={editingService.fee}
                    onChange={e => setEditingService({ ...editingService, fee: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Tóm tắt ngắn gọn (dễ hiểu cho người già):</label>
                <textarea
                  rows={2}
                  value={editingService.summary}
                  onChange={e => setEditingService({ ...editingService, summary: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-red-600" />
                  Lời đọc hướng dẫn giọng nói (Text-to-Speech):
                </label>
                <textarea
                  rows={3}
                  value={editingService.audioScript}
                  onChange={e => setEditingService({ ...editingService, audioScript: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-amber-50/50"
                  placeholder="Kính chào Bác! Để làm thủ tục này, Bác cần chuẩn bị..."
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Đường dẫn Cổng Dịch vụ công Quốc gia (dichvucong.gov.vn):
                </label>
                <input
                  type="url"
                  value={editingService.nationalPortalUrl || ''}
                  onChange={e => setEditingService({ ...editingService, nationalPortalUrl: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-xs text-blue-700"
                  placeholder="https://dichvucong.gov.vn/..."
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Nếu để trống, hệ thống sẽ tự động dẫn đến trang tra cứu chuẩn trên https://dichvucong.gov.vn/
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsServiceModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 text-slate-700 font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold"
                >
                  Lưu thủ tục
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT COUNTER */}
      {isCounterModalOpen && editingCounter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 bg-blue-700 text-white">
              <h3 className="font-bold text-base">
                {counters.some(c => c.id === editingCounter.id) ? 'Chỉnh sửa Ô tiếp nhận' : 'Thêm Ô mới'}
              </h3>
              <button onClick={() => setIsCounterModalOpen(false)} className="text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCounter} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Mã Ô (ví dụ: Ô số 1):</label>
                  <input
                    type="text"
                    required
                    value={editingCounter.code}
                    onChange={e => setEditingCounter({ ...editingCounter, code: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Số thứ tự trên sơ đồ:</label>
                  <input
                    type="number"
                    value={editingCounter.positionNumber}
                    onChange={e => setEditingCounter({ ...editingCounter, positionNumber: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Cán bộ phụ trách:</label>
                <input
                  type="text"
                  required
                  value={editingCounter.officerName}
                  onChange={e => setEditingCounter({ ...editingCounter, officerName: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-bold"
                  placeholder="Ví dụ: Đ/c Đinh Phú Thịnh"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Lĩnh vực chuyên môn tiếp nhận:</label>
                <input
                  type="text"
                  required
                  value={editingCounter.primaryField}
                  onChange={e => setEditingCounter({ ...editingCounter, primaryField: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                  placeholder="Ví dụ: Tư pháp - Hộ tịch"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Mô tả phân công nhiệm vụ:</label>
                <textarea
                  rows={2}
                  value={editingCounter.description}
                  onChange={e => setEditingCounter({ ...editingCounter, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCounterModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 text-slate-700 font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  Lưu ô tiếp nhận
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT WARD */}
      {isWardModalOpen && editingWard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 bg-emerald-700 text-white">
              <h3 className="font-bold text-base">
                {wards.some(w => w.id === editingWard.id) ? 'Chỉnh sửa Phường / Xã' : 'Thêm Phường mới'}
              </h3>
              <button onClick={() => setIsWardModalOpen(false)} className="text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveWard} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Tên Phường / Xã:</label>
                <input
                  type="text"
                  required
                  value={editingWard.name}
                  onChange={e => setEditingWard({ ...editingWard, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-bold"
                  placeholder="Ví dụ: Phường Sơn Trà"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Quận / Huyện:</label>
                  <input
                    type="text"
                    required
                    value={editingWard.district}
                    onChange={e => setEditingWard({ ...editingWard, district: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Hotline liên hệ:</label>
                  <input
                    type="text"
                    required
                    value={editingWard.hotline}
                    onChange={e => setEditingWard({ ...editingWard, hotline: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Địa chỉ trụ sở:</label>
                <input
                  type="text"
                  required
                  value={editingWard.address}
                  onChange={e => setEditingWard({ ...editingWard, address: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Giờ làm việc tiếp nhận hồ sơ:</label>
                <input
                  type="text"
                  required
                  value={editingWard.workingHours}
                  onChange={e => setEditingWard({ ...editingWard, workingHours: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsWardModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 text-slate-700 font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  Lưu Phường / Xã
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
