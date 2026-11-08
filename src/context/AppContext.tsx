import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { 
  Ward, 
  Counter, 
  Officer, 
  PublicService, 
  AccessibilityConfig,
  ServiceCategory
} from '../types';
import { 
  INITIAL_WARDS, 
  INITIAL_COUNTERS, 
  INITIAL_OFFICERS, 
  INITIAL_SERVICES 
} from '../data/initialData';
import { speakText, stopSpeaking } from '../utils/speech';

export type ScreenType = 'standby' | 'citizen_home' | 'service_detail' | 'mindmap_view' | 'admin';

interface AppContextType {
  wards: Ward[];
  counters: Counter[];
  officers: Officer[];
  services: PublicService[];
  selectedWardId: string;
  selectedWard: Ward;
  currentScreen: ScreenType;
  selectedService: PublicService | null;
  selectedCounter: Counter | null;
  accessibility: AccessibilityConfig;
  isSpeaking: boolean;
  activePlayingText: string | null;

  // Navigation
  setCurrentScreen: (screen: ScreenType) => void;
  setSelectedWardId: (wardId: string) => void;
  selectService: (service: PublicService | null) => void;
  selectCounter: (counter: Counter | null) => void;

  // AI Assistant Modal
  isAIAssistantOpen: boolean;
  setIsAIAssistantOpen: (open: boolean) => void;
  openAIAssistant: () => void;

  // Admin Authentication
  isAdminLoggedIn: boolean;
  isAdminLoginModalOpen: boolean;
  setIsAdminLoginModalOpen: (open: boolean) => void;
  loginAdmin: (password: string) => boolean;
  logoutAdmin: () => void;

  // Accessibility
  setTextScale: (scale: 'normal' | 'large' | 'xlarge') => void;
  setHighContrast: (enabled: boolean) => void;
  setVoiceSpeed: (speed: number) => void;
  setAutoReadAloud: (enabled: boolean) => void;

  // Speech
  readText: (text: string) => void;
  stopAudio: () => void;

  // Admin CRUD operations
  addWard: (ward: Ward) => void;
  updateWard: (ward: Ward) => void;
  deleteWard: (id: string) => void;

  addCounter: (counter: Counter) => void;
  updateCounter: (counter: Counter) => void;
  deleteCounter: (id: string) => void;

  addOfficer: (officer: Officer) => void;
  updateOfficer: (officer: Officer) => void;
  deleteOfficer: (id: string) => void;

  addService: (service: PublicService) => void;
  updateService: (service: PublicService) => void;
  deleteService: (id: string) => void;

  resetToDefault: () => void;
  exportBackupJSON: () => string;
  importBackupJSON: (jsonStr: string) => boolean;

  // Filtered queries for currently selected ward
  currentWardCounters: Counter[];
  currentWardOfficers: Officer[];
  currentWardServices: PublicService[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  WARDS: 'dvc_sontra_wards_v3',
  COUNTERS: 'dvc_sontra_counters_v3',
  OFFICERS: 'dvc_sontra_officers_v3',
  SERVICES: 'dvc_sontra_services_v3',
  SELECTED_WARD: 'dvc_sontra_sel_ward_v3',
  ACCESSIBILITY: 'dvc_sontra_a11y_v3'
};

export const sanitizeServiceNationalPortalUrl = (service: Partial<PublicService>): string => {
  let url = service.nationalPortalUrl;
  if (url && typeof url === 'string') {
    url = url.trim();
    // Auto-correct old broken format
    if (url.includes('dvc-chi-tiet-thu-tuc-hanh-chinh.html')) {
      url = url.replace('dvc-chi-tiet-thu-tuc-hanh-chinh.html', 'dvc-tthc-thu-tuc-hanh-chinh-chi-tiet.html');
    }
  }
  // If empty or default root and service has a procedure code, link directly to procedure details
  if (!url || url === '' || url === 'https://dichvucong.gov.vn/') {
    if (service.code && service.code.trim() !== '' && service.id !== 'srv-ho-tro-vneid-dvc') {
      return `https://dichvucong.gov.vn/p/home/dvc-tthc-thu-tuc-hanh-chinh-chi-tiet.html?ma_thu_tuc=${encodeURIComponent(service.code.trim())}`;
    }
    return 'https://dichvucong.gov.vn/';
  }
  return url;
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load from localStorage or defaults
  const [wards, setWards] = useState<Ward[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.WARDS);
      if (saved) {
        const parsed: Ward[] = JSON.parse(saved);
        return parsed.map(w => {
          if (w.id === 'ward-sontra') {
            return {
              ...w,
              district: 'Thành phố Đà Nẵng',
              city: 'Thành phố Đà Nẵng',
              address: 'Số 06 Nguyễn Phan Vinh, phường Sơn Trà, thành phố Đà Nẵng',
              hotline: '0913 415 457',
              description: 'Trung tâm Phục vụ Hành chính công Phường Sơn Trà đặt tại Số 06 Nguyễn Phan Vinh, phường Sơn Trà, thành phố Đà Nẵng - Lấy người dân làm trung tâm phục vụ.'
            };
          }
          return w;
        });
      }
      return INITIAL_WARDS;
    } catch {
      return INITIAL_WARDS;
    }
  });

  const [counters, setCounters] = useState<Counter[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.COUNTERS);
      return saved ? JSON.parse(saved) : INITIAL_COUNTERS;
    } catch {
      return INITIAL_COUNTERS;
    }
  });

  const [officers, setOfficers] = useState<Officer[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.OFFICERS);
      return saved ? JSON.parse(saved) : INITIAL_OFFICERS;
    } catch {
      return INITIAL_OFFICERS;
    }
  });

  const [services, setServices] = useState<PublicService[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SERVICES);
      if (saved) {
        const parsed: PublicService[] = JSON.parse(saved);
        return parsed.map(s => ({
          ...s,
          nationalPortalUrl: sanitizeServiceNationalPortalUrl(s)
        }));
      }
      return INITIAL_SERVICES;
    } catch {
      return INITIAL_SERVICES;
    }
  });

  const [selectedWardId, setSelectedWardIdState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SELECTED_WARD);
      return saved || 'ward-sontra';
    } catch {
      return 'ward-sontra';
    }
  });

  const [accessibility, setAccessibility] = useState<AccessibilityConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACCESSIBILITY);
      return saved ? JSON.parse(saved) : {
        textScale: 'large', // Default to large text for senior citizens
        highContrast: false,
        voiceSpeed: 0.9,
        autoReadAloud: true
      };
    } catch {
      return {
        textScale: 'large',
        highContrast: false,
        voiceSpeed: 0.9,
        autoReadAloud: true
      };
    }
  });

  const [currentScreen, setCurrentScreenState] = useState<ScreenType>('standby');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState<boolean>(false);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState<boolean>(false);
  const [selectedService, setSelectedService] = useState<PublicService | null>(null);
  const [selectedCounter, setSelectedCounter] = useState<Counter | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [activePlayingText, setActivePlayingText] = useState<string | null>(null);

  const openAIAssistant = useCallback(() => {
    setIsAIAssistantOpen(true);
  }, []);

  const setCurrentScreen = (screen: ScreenType) => {
    if (screen === 'admin' && !isAdminLoggedIn) {
      setIsAdminLoginModalOpen(true);
      return;
    }
    setCurrentScreenState(screen);
  };

  const loginAdmin = (password: string): boolean => {
    const validPasswords = ['admin', 'admin123', 'sontra2026', 'sontra@2026'];
    if (validPasswords.includes(password.trim())) {
      setIsAdminLoggedIn(true);
      setIsAdminLoginModalOpen(false);
      setCurrentScreenState('admin');
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdminLoggedIn(false);
    setCurrentScreenState('citizen_home');
  };

  // Sync state to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.WARDS, JSON.stringify(wards));
      localStorage.setItem(STORAGE_KEYS.COUNTERS, JSON.stringify(counters));
      localStorage.setItem(STORAGE_KEYS.OFFICERS, JSON.stringify(officers));
      localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));
      localStorage.setItem(STORAGE_KEYS.SELECTED_WARD, selectedWardId);
      localStorage.setItem(STORAGE_KEYS.ACCESSIBILITY, JSON.stringify(accessibility));
    } catch (e) {
      console.error('Failed to sync to localStorage:', e);
    }
  }, [wards, counters, officers, services, selectedWardId, accessibility]);

  // Apply HTML class for high-contrast and text scale
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('high-contrast', 'text-scale-normal', 'text-scale-large', 'text-scale-xlarge');
    if (accessibility.highContrast) {
      root.classList.add('high-contrast');
    }
    root.classList.add(`text-scale-${accessibility.textScale}`);
  }, [accessibility]);

  // Handle Idle Inactivity: return to standby screen after 180s in citizen mode
  useEffect(() => {
    if (currentScreen === 'standby' || currentScreen === 'admin') return;

    let timeoutId: any;
    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        stopSpeaking();
        setIsSpeaking(false);
        setCurrentScreen('standby');
        setSelectedService(null);
      }, 180000); // 3 minutes of total inactivity
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(e => window.addEventListener(e, resetTimer));
    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      events.forEach(e => window.removeEventListener(e, resetTimer));
    };
  }, [currentScreen]);

  // Stop speech when changing screens
  useEffect(() => {
    stopSpeaking();
    setIsSpeaking(false);
    setActivePlayingText(null);
  }, [currentScreen]);

  const readText = useCallback((text: string) => {
    if (!text) return;
    setActivePlayingText(text);
    speakText(
      text,
      accessibility.voiceSpeed,
      () => setIsSpeaking(true),
      () => {
        setIsSpeaking(false);
        setActivePlayingText(null);
      },
      () => {
        setIsSpeaking(false);
        setActivePlayingText(null);
      }
    );
  }, [accessibility.voiceSpeed]);

  const stopAudio = useCallback(() => {
    stopSpeaking();
    setIsSpeaking(false);
    setActivePlayingText(null);
  }, []);

  const setSelectedWardId = (wardId: string) => {
    setSelectedWardIdState(wardId);
    setSelectedService(null);
    setSelectedCounter(null);
  };

  const selectService = (service: PublicService | null) => {
    setSelectedService(service);
    if (service) {
      setCurrentScreen('service_detail');
      // If auto-read is enabled, read summary
      if (accessibility.autoReadAloud && service.audioScript) {
        setTimeout(() => {
          readText(service.audioScript);
        }, 400);
      }
    }
  };

  const selectCounter = (counter: Counter | null) => {
    setSelectedCounter(counter);
  };

  // Accessibility handlers
  const setTextScale = (scale: 'normal' | 'large' | 'xlarge') => {
    setAccessibility(prev => ({ ...prev, textScale: scale }));
  };

  const setHighContrast = (enabled: boolean) => {
    setAccessibility(prev => ({ ...prev, highContrast: enabled }));
  };

  const setVoiceSpeed = (speed: number) => {
    setAccessibility(prev => ({ ...prev, voiceSpeed: speed }));
  };

  const setAutoReadAloud = (enabled: boolean) => {
    setAccessibility(prev => ({ ...prev, autoReadAloud: enabled }));
  };

  // Admin CRUD for Wards
  const addWard = (ward: Ward) => {
    setWards(prev => [...prev, ward]);
  };

  const updateWard = (ward: Ward) => {
    setWards(prev => prev.map(w => w.id === ward.id ? ward : w));
  };

  const deleteWard = (id: string) => {
    if (wards.length <= 1) {
      alert('Không thể xóa toàn bộ phường. Cần giữ ít nhất 1 phường.');
      return;
    }
    setWards(prev => prev.filter(w => w.id !== id));
    if (selectedWardId === id) {
      setSelectedWardIdState(wards.find(w => w.id !== id)?.id || '');
    }
  };

  // Admin CRUD for Counters
  const addCounter = (counter: Counter) => {
    setCounters(prev => [...prev, counter]);
  };

  const updateCounter = (counter: Counter) => {
    setCounters(prev => prev.map(c => c.id === counter.id ? counter : c));
  };

  const deleteCounter = (id: string) => {
    setCounters(prev => prev.filter(c => c.id !== id));
  };

  // Admin CRUD for Officers
  const addOfficer = (officer: Officer) => {
    setOfficers(prev => [...prev, officer]);
  };

  const updateOfficer = (officer: Officer) => {
    setOfficers(prev => prev.map(o => o.id === officer.id ? officer : o));
  };

  const deleteOfficer = (id: string) => {
    setOfficers(prev => prev.filter(o => o.id !== id));
  };

  // Admin CRUD for Services
  const addService = (service: PublicService) => {
    const sanitized: PublicService = {
      ...service,
      nationalPortalUrl: sanitizeServiceNationalPortalUrl(service)
    };
    setServices(prev => [sanitized, ...prev]);
  };

  const updateService = (service: PublicService) => {
    const sanitized: PublicService = {
      ...service,
      nationalPortalUrl: sanitizeServiceNationalPortalUrl(service)
    };
    setServices(prev => prev.map(s => s.id === sanitized.id ? sanitized : s));
  };

  const deleteService = (id: string) => {
    setServices(prev => prev.filter(s => s.id !== id));
  };

  // Reset to default data
  const resetToDefault = () => {
    if (window.confirm('Khôi phục toàn bộ danh mục dịch vụ và sơ đồ chuẩn của Phường Sơn Trà? Mọi chỉnh sửa tùy biến sẽ được đưa về mặc định.')) {
      setWards(INITIAL_WARDS);
      setCounters(INITIAL_COUNTERS);
      setOfficers(INITIAL_OFFICERS);
      setServices(INITIAL_SERVICES);
      setSelectedWardIdState('ward-sontra');
      setSelectedService(null);
      setSelectedCounter(null);
      localStorage.clear();
      alert('Đã khôi phục dữ liệu gốc thành công!');
    }
  };

  const exportBackupJSON = (): string => {
    const data = {
      version: '2.0',
      timestamp: new Date().toISOString(),
      wards,
      counters,
      officers,
      services
    };
    return JSON.stringify(data, null, 2);
  };

  const importBackupJSON = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.wards && parsed.counters && parsed.services) {
        setWards(parsed.wards);
        setCounters(parsed.counters);
        setOfficers(parsed.officers || INITIAL_OFFICERS);
        setServices(parsed.services);
        if (parsed.wards.length > 0) {
          setSelectedWardIdState(parsed.wards[0].id);
        }
        alert('Nhập dữ liệu thành công!');
        return true;
      } else {
        alert('Tệp dữ liệu không đúng cấu trúc hợp lệ.');
        return false;
      }
    } catch (e) {
      alert('Lỗi định dạng tệp JSON: ' + (e as any).message);
      return false;
    }
  };

  // Compute current ward details
  const selectedWard = wards.find(w => w.id === selectedWardId) || wards[0] || INITIAL_WARDS[0];
  const currentWardCounters = counters.filter(c => c.wardId === selectedWardId);
  const currentWardOfficers = officers.filter(o => o.wardId === selectedWardId);
  const currentWardServices = services.filter(s => s.wardId === selectedWardId);

  return (
    <AppContext.Provider
      value={{
        wards,
        counters,
        officers,
        services,
        selectedWardId,
        selectedWard,
        currentScreen,
        selectedService,
        selectedCounter,
        accessibility,
        isSpeaking,
        activePlayingText,
        setCurrentScreen,
        setSelectedWardId,
        selectService,
        selectCounter,
        isAIAssistantOpen,
        setIsAIAssistantOpen,
        openAIAssistant,
        isAdminLoggedIn,
        isAdminLoginModalOpen,
        setIsAdminLoginModalOpen,
        loginAdmin,
        logoutAdmin,
        setTextScale,
        setHighContrast,
        setVoiceSpeed,
        setAutoReadAloud,
        readText,
        stopAudio,
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
        currentWardServices
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
