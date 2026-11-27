// Kế hoạch chuẩn bị trước khi đến Phường Sơn Trà (Phiên bản Offline Standalone)
import { speakText, stopSpeaking } from './speech.js';

const PLAN_STORAGE_KEY = 'dvc_sontra_offline_visit_plan_v1';
const DOC_CHECK_STORAGE_KEY = 'dvc_sontra_offline_visit_docs_v1';

export function getWardOfficeStatus(now = new Date()) {
  const day = now.getDay();
  const mins = now.getHours() * 60 + now.getMinutes();

  const morningStart = 7 * 60 + 30;
  const morningEnd = 11 * 60 + 30;
  const afternoonStart = 13 * 60 + 30;
  const afternoonEnd = 17 * 60;

  const isWeekday = day >= 1 && day <= 5;
  const inMorning = isWeekday && mins >= morningStart && mins < morningEnd;
  const inAfternoon = isWeekday && mins >= afternoonStart && mins < afternoonEnd;

  let statusLabel = 'Đang ngoài giờ tiếp nhận';
  let detailText = 'Mở cửa tiếp nhận từ Thứ Hai đến Thứ Sáu (07h30–11h30 và 13h30–17h00).';

  if (inMorning) {
    statusLabel = 'Đang mở cửa tiếp nhận (Ca sáng)';
    detailText = 'Phục vụ liên tục đến 11h30. Bác nên đến trước 10h45 để kịp giải quyết trong buổi sáng.';
  } else if (inAfternoon) {
    statusLabel = 'Đang mở cửa tiếp nhận (Ca chiều)';
    detailText = 'Phục vụ liên tục đến 17h00. Bác nên đến trước 16h15 để kịp kiểm tra hồ sơ.';
  } else if (isWeekday && mins < morningStart) {
    statusLabel = 'Sắp mở cửa lúc 07h30 sáng nay';
    detailText = 'Quầy Một cửa bắt đầu tiếp nhận lúc 07h30. Buổi sáng sớm thường ít đông nhất.';
  } else if (isWeekday && mins >= morningEnd && mins < afternoonStart) {
    statusLabel = 'Đang giờ nghỉ trưa (11h30–13h30)';
    detailText = 'Bộ phận Một cửa mở lại lúc 13h30 chiều nay. Bác có thể chuẩn bị sẵn hồ sơ trước khi đi.';
  } else if (isWeekday && mins >= afternoonEnd) {
    statusLabel = 'Đã hết giờ tiếp nhận hôm nay';
    detailText = day === 5
      ? 'Hôm nay Thứ Sáu đã hết giờ làm việc. Bộ phận Một cửa mở lại lúc 07h30 sáng Thứ Hai tuần tới.'
      : 'Bộ phận Một cửa sẽ mở lại lúc 07h30 sáng ngày làm việc tiếp theo.';
  } else {
    statusLabel = 'Cuối tuần — Quầy Một cửa nghỉ làm việc';
    detailText = 'Thứ Bảy và Chủ Nhật nghỉ. Bác có thể chuẩn bị sẵn hồ sơ ở nhà hoặc nộp online khi có mạng.';
  }

  return {
    isOpen: inMorning || inAfternoon,
    statusLabel,
    detailText,
    bestVisitTip: 'Khung giờ vắng người cho người cao tuổi: 07h30–08h30 sáng hoặc 13h30–14h30 chiều (Thứ Ba – Thứ Năm).'
  };
}

export function getServiceLevelInfo(level) {
  const norm = (level || '').toLowerCase().trim();
  if (norm === 'toan_trinh' || norm === 'toàn trình') {
    return {
      shortLabel: 'Nộp online 100% ở nhà được',
      fullLabel: 'Dịch vụ công Toàn trình (Có thể nộp 100% tại nhà)',
      homeAdvice: 'Khi có Internet và VNeID mức 2, Bác hoặc con cháu có thể nộp trực tuyến trên dichvucong.gov.vn mà không cần đi lại nhiều lần.',
      canOnlineFromHome: true
    };
  }
  if (norm === 'mot_phan' || norm === 'một phần') {
    return {
      shortLabel: 'Khai trước ở nhà, mang bản chính đối chiếu',
      fullLabel: 'Dịch vụ công Một phần (Khai trước online, đối chiếu bản chính)',
      homeAdvice: 'Có thể gửi trước thông tin qua mạng khi có kết nối, sau đó mang bản chính ra quầy đối chiếu và nhận kết quả.',
      canOnlineFromHome: true
    };
  }
  return {
    shortLabel: 'Cần có mặt trực tiếp tại quầy',
    fullLabel: 'Thực hiện trực tiếp tại Bộ phận Một cửa',
    homeAdvice: 'Thủ tục này cần ký tên trực tiếp hoặc đối chiếu bản chính tại quầy. Bác chuẩn bị sẵn giấy tờ theo checklist trước khi đến.',
    canOnlineFromHome: false
  };
}

function getPlanIds() {
  try {
    const parsed = JSON.parse(localStorage.getItem(PLAN_STORAGE_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function savePlanIds(ids) {
  try {
    localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // ignore
  }
  syncPlanButtonsAndCounters();
}

function getDocCheckMap() {
  try {
    return JSON.parse(localStorage.getItem(DOC_CHECK_STORAGE_KEY) || '{}') || {};
  } catch {
    return {};
  }
}

function saveDocCheckMap(map) {
  try {
    localStorage.setItem(DOC_CHECK_STORAGE_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
}

function normalizeDocKey(rawName) {
  const lower = (rawName || '').toLowerCase();
  if (
    lower.includes('căn cước công dân') ||
    lower.includes('cccd') ||
    lower.includes('định danh') ||
    lower.includes('giấy tờ tùy thân')
  ) {
    return 'cccd_identity';
  }
  if (lower.includes('ảnh') && (lower.includes('3x4') || lower.includes('4x6'))) {
    return 'portrait_photo';
  }
  return lower.replace(/\(.*?\)/g, '').replace(/\s+/g, ' ').trim();
}

function consolidateDocs(plannedServices) {
  const map = new Map();
  plannedServices.forEach((srv) => {
    (srv.requiredDocuments || []).forEach((doc) => {
      const key = normalizeDocKey(doc.name);
      const existing = map.get(key);
      if (existing) {
        existing.isRequired = existing.isRequired || !!doc.isRequired;
        existing.isOriginal = existing.isOriginal || !!doc.isOriginal;
        if (!existing.serviceNames.includes(srv.name)) {
          existing.serviceNames.push(srv.name);
        }
      } else {
        map.set(key, {
          key,
          displayName: key === 'cccd_identity'
            ? 'Căn cước công dân gắn chip (hoặc VNeID mức độ 2 trên điện thoại)'
            : doc.name,
          isRequired: !!doc.isRequired,
          isOriginal: !!doc.isOriginal,
          serviceNames: [srv.name]
        });
      }
    });
  });

  return Array.from(map.values()).sort((a, b) => {
    if (a.key === 'cccd_identity') return -1;
    if (b.key === 'cccd_identity') return 1;
    if (a.isRequired !== b.isRequired) return a.isRequired ? -1 : 1;
    return 0;
  });
}

export function toggleVisitPlan(serviceId) {
  const ids = getPlanIds();
  const next = ids.includes(serviceId)
    ? ids.filter((id) => id !== serviceId)
    : [...ids, serviceId];
  savePlanIds(next);
}

export function addMultipleToVisitPlan(serviceIds) {
  const next = new Set(getPlanIds());
  (serviceIds || []).forEach((id) => next.add(id));
  savePlanIds(Array.from(next));
}

export function removeFromVisitPlan(serviceId) {
  savePlanIds(getPlanIds().filter((id) => id !== serviceId));
  renderVisitPlanModal();
}

export function clearVisitPlan() {
  savePlanIds([]);
  renderVisitPlanModal();
}

export function syncPlanButtonsAndCounters() {
  const ids = getPlanIds();
  document.querySelectorAll('[data-visit-plan-count]').forEach((el) => {
    el.textContent = String(ids.length);
  });
  document.querySelectorAll('[data-visit-plan-label]').forEach((el) => {
    el.textContent = ids.length > 0
      ? `Mở kế hoạch chuẩn bị (${ids.length} thủ tục)`
      : 'Lập kế hoạch chuẩn bị ở nhà';
  });
  document.querySelectorAll('[data-plan-toggle-id]').forEach((btn) => {
    const sid = btn.getAttribute('data-plan-toggle-id');
    const isSaved = ids.includes(sid);
    const labelEl = btn.querySelector('.plan-btn-text');
    if (labelEl) {
      labelEl.textContent = isSaved
        ? (btn.getAttribute('data-saved-label') || 'Đã lưu')
        : (btn.getAttribute('data-unsaved-label') || '+ Lưu kế hoạch');
    }
    if (isSaved) {
      btn.classList.remove('bg-slate-50', 'bg-white', 'text-slate-700', 'text-slate-800', 'border-slate-200', 'border-slate-300');
      btn.classList.add('bg-emerald-50', 'text-emerald-800', 'border-emerald-300');
    } else {
      btn.classList.remove('bg-emerald-50', 'text-emerald-800', 'border-emerald-300');
      btn.classList.add('bg-slate-50', 'text-slate-800', 'border-slate-200');
    }
  });
}

function getPlannedData() {
  const services = window.__OFFLINE_SERVICES__ || [];
  const counters = window.__OFFLINE_COUNTERS__ || [];
  const ward = window.__OFFLINE_WARD__ || {
    name: 'Phường Sơn Trà',
    address: 'Số 06 Nguyễn Phan Vinh, phường Sơn Trà, thành phố Đà Nẵng',
    hotline: '0913 415 457',
    working_hours: 'Sáng 07h30 - 11h30 | Chiều 13h30 - 17h00'
  };

  const ids = getPlanIds();
  const plannedServices = ids
    .map((id) => services.find((s) => s.id === id))
    .filter(Boolean);

  const counterMap = new Map();
  plannedServices.forEach((srv) => {
    const c = counters.find((x) => x.id === srv.counterId);
    if (!c) return;
    if (counterMap.has(c.id)) {
      counterMap.get(c.id).serviceNames.push(srv.name);
    } else {
      counterMap.set(c.id, { counter: c, serviceNames: [srv.name] });
    }
  });

  const counterRoute = Array.from(counterMap.values()).sort(
    (a, b) => (a.counter.positionNumber || 0) - (b.counter.positionNumber || 0)
  );
  const consolidatedDocs = consolidateDocs(plannedServices);
  return { ward, plannedServices, counterRoute, consolidatedDocs };
}

export function renderVisitPlanModal() {
  const body = document.getElementById('visit-plan-body');
  const subtitle = document.getElementById('visit-plan-subtitle');
  const headerActions = document.getElementById('visit-plan-header-actions');
  const copyBtn = document.getElementById('btn-copy-visit-plan');
  if (!body) return;

  const { ward, plannedServices, counterRoute, consolidatedDocs } = getPlannedData();
  const officeStatus = getWardOfficeStatus();
  const checkMap = getDocCheckMap();

  if (subtitle) {
    subtitle.textContent = `Gộp giấy tờ, lộ trình các ô và dự trù lệ phí cho ${plannedServices.length} thủ tục đã lưu`;
  }
  if (headerActions) headerActions.classList.toggle('hidden', plannedServices.length === 0);
  if (copyBtn) copyBtn.classList.toggle('hidden', plannedServices.length === 0);

  if (plannedServices.length === 0) {
    body.innerHTML = `
      <div class="bg-white rounded-3xl p-10 text-center border border-slate-200 space-y-3">
        <h3 class="text-base sm:text-lg font-bold text-slate-900">Bác chưa lưu thủ tục nào vào kế hoạch</h3>
        <p class="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
          Khi tra cứu danh mục thủ tục, Bác chạm nút <strong>"+ Lưu kế hoạch"</strong> trên các thủ tục muốn làm để hệ thống gộp sẵn toàn bộ giấy tờ cần mang trong một chuyến đi.
        </p>
      </div>
    `;
    return;
  }

  const procRowsHtml = plannedServices.map((srv, idx) => {
    const route = counterRoute.find((r) => r.counter.id === srv.counterId);
    const levelInfo = getServiceLevelInfo(srv.level);
    return `
      <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div class="space-y-1 min-w-0">
          <div class="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium">
            <span class="font-mono font-bold text-red-800">#${idx + 1} · ${srv.code}</span>
            <span>·</span>
            <span class="font-bold text-slate-800">${route ? `${route.counter.code} (Bàn ${route.counter.positionNumber})` : 'Một cửa'}</span>
            <span>·</span>
            <span class="${levelInfo.canOnlineFromHome ? 'text-emerald-700 font-bold' : 'text-amber-800 font-bold'}">${levelInfo.shortLabel}</span>
          </div>
          <h4 class="text-sm sm:text-base font-bold text-slate-900">${srv.name}</h4>
          <div class="text-xs text-slate-600 tabular-nums">
            Lệ phí: <strong class="text-red-700">${srv.fee}</strong> · Thời hạn: <strong>${srv.processingDuration}</strong>
          </div>
        </div>
        <div class="no-print flex items-center gap-2 shrink-0">
          <a href="/service/${srv.id}" class="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold text-xs">Chi tiết →</a>
          <button type="button" data-remove-plan-id="${srv.id}" class="px-2.5 py-2 rounded-xl bg-white hover:bg-red-50 text-slate-600 hover:text-red-700 border border-slate-200 font-semibold text-xs cursor-pointer">Bỏ</button>
        </div>
      </div>
    `;
  }).join('');

  const routeHtml = counterRoute.map((stop, idx) => `
    <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
      <div class="text-xs font-bold text-red-700">Điểm dừng ${idx + 1} · ${stop.counter.code} (Bàn ${stop.counter.positionNumber})</div>
      <div class="text-sm font-bold text-slate-900">${stop.counter.officerName || 'Cán bộ tiếp nhận'}</div>
      <div class="text-xs text-slate-600">Làm: ${stop.serviceNames.join('; ')}</div>
    </div>
  `).join('');

  const checkedRequiredCount = consolidatedDocs.filter((d) => d.isRequired && checkMap[d.key]).length;
  const totalRequiredCount = consolidatedDocs.filter((d) => d.isRequired).length;

  const docsHtml = consolidatedDocs.map((doc) => {
    const isChecked = !!checkMap[doc.key];
    return `
      <div data-plan-doc-key="${doc.key}" class="plan-doc-row p-3.5 rounded-xl border transition-colors cursor-pointer flex items-start gap-3 select-none ${isChecked ? 'bg-emerald-50 border-emerald-300' : 'bg-slate-50 hover:bg-slate-100 border-slate-200'}">
        <input type="checkbox" ${isChecked ? 'checked' : ''} class="mt-0.5 w-5 h-5 accent-emerald-600 rounded cursor-pointer shrink-0">
        <div class="flex-1 min-w-0">
          <div class="flex flex-wrap items-baseline justify-between gap-2">
            <span class="text-sm font-bold ${isChecked ? 'line-through text-emerald-950 opacity-75' : 'text-slate-900'}">${doc.displayName}</span>
            <span class="text-xs font-semibold text-slate-600 shrink-0">${doc.isRequired ? 'Bắt buộc' : 'Tùy trường hợp'} · ${doc.isOriginal ? 'Mang bản chính' : 'Bản photo'}</span>
          </div>
          <p class="text-xs text-slate-500 mt-0.5">Dùng cho: ${doc.serviceNames.join(' · ')}</p>
        </div>
      </div>
    `;
  }).join('');

  body.innerHTML = `
    <div class="hidden print:block text-center pb-4 border-b-2 border-slate-900">
      <p class="text-xs font-bold uppercase text-slate-600">UBND ${ward.name.toUpperCase()} · TRUNG TÂM PHỤC VỤ HÀNH CHÍNH CÔNG</p>
      <h1 class="text-xl font-black uppercase text-red-800 mt-1">BẢNG KẾ HOẠCH CHUẨN BỊ HỒ SƠ MANG THEO</h1>
      <p class="text-xs text-slate-600 mt-0.5">Địa chỉ: ${ward.address} · Hotline: ${ward.hotline}</p>
    </div>

    <div class="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div class="space-y-1">
        <div class="text-sm font-bold text-slate-900">${officeStatus.statusLabel}</div>
        <p class="text-xs text-slate-600 leading-relaxed">${officeStatus.detailText} ${officeStatus.bestVisitTip}</p>
      </div>
      <div class="text-xs text-slate-600 shrink-0 sm:text-right space-y-0.5">
        <div class="font-bold text-slate-900">${ward.address}</div>
        <div class="text-red-700 font-bold tabular-nums">Hotline: ${ward.hotline}</div>
      </div>
    </div>

    <section class="bg-white rounded-2xl p-5 border border-slate-200 space-y-3.5">
      <div class="flex items-center justify-between pb-2.5 border-b border-slate-100">
        <h3 class="text-base font-bold text-slate-900">1. Thủ tục dự định thực hiện (${plannedServices.length})</h3>
        <button type="button" id="btn-clear-visit-plan" class="no-print text-xs font-semibold text-red-700 hover:text-red-900 cursor-pointer">Xóa tất cả</button>
      </div>
      <div class="space-y-2.5">${procRowsHtml}</div>
    </section>

    ${counterRoute.length > 0 ? `
      <section class="bg-white rounded-2xl p-5 border border-slate-200 space-y-3">
        <h3 class="text-base font-bold text-slate-900">2. Lộ trình các Ô sẽ ghé tại Hội trường Một cửa</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">${routeHtml}</div>
      </section>
    ` : ''}

    <section class="bg-white rounded-2xl p-5 border border-slate-200 space-y-3.5">
      <div class="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
        <div>
          <h3 class="text-base font-bold text-slate-900">3. Tập giấy tờ cần bỏ vào túi mang đi (Đã gộp trùng)</h3>
          <p class="text-xs text-slate-500 mt-0.5">Đã tích sẵn ở nhà: <strong class="text-emerald-700 tabular-nums">${checkedRequiredCount}/${totalRequiredCount}</strong> loại giấy tờ bắt buộc</p>
        </div>
      </div>
      <div class="space-y-2">${docsHtml}</div>
    </section>
  `;

  body.querySelectorAll('[data-remove-plan-id]').forEach((btn) => {
    btn.addEventListener('click', () => removeFromVisitPlan(btn.getAttribute('data-remove-plan-id')));
  });

  const clearBtn = document.getElementById('btn-clear-visit-plan');
  if (clearBtn) clearBtn.addEventListener('click', clearVisitPlan);

  body.querySelectorAll('.plan-doc-row').forEach((row) => {
    row.addEventListener('click', () => {
      const k = row.getAttribute('data-plan-doc-key');
      const m = getDocCheckMap();
      m[k] = !m[k];
      saveDocCheckMap(m);
      renderVisitPlanModal();
    });
  });
}

export function openVisitPlanModal() {
  const modal = document.getElementById('visit-plan-modal');
  if (!modal) return;
  renderVisitPlanModal();
  modal.classList.remove('hidden');
}

export function closeVisitPlanModal() {
  const modal = document.getElementById('visit-plan-modal');
  if (!modal) return;
  stopSpeaking();
  modal.classList.add('hidden');
}

export function initVisitPlanModule() {
  syncPlanButtonsAndCounters();

  document.addEventListener('click', (e) => {
    const toggleBtn = e.target.closest('[data-plan-toggle-id]');
    if (toggleBtn) {
      e.preventDefault();
      e.stopPropagation();
      toggleVisitPlan(toggleBtn.getAttribute('data-plan-toggle-id'));
      return;
    }

    const openBtn = e.target.closest('[data-open-visit-plan]');
    if (openBtn) {
      e.preventDefault();
      openVisitPlanModal();
    }
  });

  const modal = document.getElementById('visit-plan-modal');
  const closeTop = document.getElementById('btn-close-visit-plan');
  const closeBottom = document.getElementById('btn-close-visit-plan-bottom');
  if (closeTop) closeTop.addEventListener('click', closeVisitPlanModal);
  if (closeBottom) closeBottom.addEventListener('click', closeVisitPlanModal);
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeVisitPlanModal();
    });
  }

  let isSpeakingPlan = false;
  const speakBtn = document.getElementById('btn-speak-visit-plan');
  const speakLabel = document.getElementById('speak-visit-plan-label');
  if (speakBtn) {
    speakBtn.addEventListener('click', () => {
      if (isSpeakingPlan) {
        stopSpeaking();
        isSpeakingPlan = false;
        if (speakLabel) speakLabel.textContent = 'Nghe danh sách mang theo';
        return;
      }
      const { ward, plannedServices, counterRoute, consolidatedDocs } = getPlannedData();
      if (plannedServices.length === 0) return;

      const procNames = plannedServices.map((s) => s.name).join(', ');
      const routeNames = counterRoute.map((r) => `${r.counter.code} bàn số ${r.counter.positionNumber}`).join(', rồi sang ');
      const docNames = consolidatedDocs.filter((d) => d.isRequired).map((d) => d.displayName).join(', ');
      const script = `Kế hoạch chuẩn bị của Bác gồm ${plannedServices.length} thủ tục là: ${procNames}. Khi đến ${ward.name}, Bác sẽ ghé ${routeNames}. Những giấy tờ bắt buộc cần mang theo gồm: ${docNames}.`;

      isSpeakingPlan = true;
      if (speakLabel) speakLabel.textContent = 'Dừng đọc';
      speakText(
        script,
        0.90,
        () => { isSpeakingPlan = true; },
        () => {
          isSpeakingPlan = false;
          if (speakLabel) speakLabel.textContent = 'Nghe danh sách mang theo';
        },
        () => {
          isSpeakingPlan = false;
          if (speakLabel) speakLabel.textContent = 'Nghe danh sách mang theo';
        }
      );
    });
  }

  const printBtn = document.getElementById('btn-print-visit-plan');
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      document.body.classList.add('printing-visit-plan');
      const cleanup = () => document.body.classList.remove('printing-visit-plan');
      window.addEventListener('afterprint', cleanup, { once: true });
      window.print();
      setTimeout(cleanup, 1500);
    });
  }

  const copyBtn = document.getElementById('btn-copy-visit-plan');
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      const { ward, plannedServices, counterRoute, consolidatedDocs } = getPlannedData();
      if (plannedServices.length === 0) return;

      const lines = [
        `KẾ HOẠCH CHUẨN BỊ HỒ SƠ — UBND ${ward.name.toUpperCase()}`,
        `Địa chỉ: ${ward.address} · Hotline: ${ward.hotline}`,
        '',
        `1. THỦ TỤC DỰ ĐỊNH LÀM (${plannedServices.length}):`
      ];
      plannedServices.forEach((srv, idx) => {
        const route = counterRoute.find((r) => r.counter.id === srv.counterId);
        lines.push(`  ${idx + 1}. ${srv.name} (Mã: ${srv.code}) - ${route ? `${route.counter.code} Bàn ${route.counter.positionNumber}` : 'Một cửa'} · Lệ phí: ${srv.fee}`);
      });
      lines.push('', '2. TẬP GIẤY TỜ CẦN MANG THEO (ĐÃ GỘP TRÙNG):');
      consolidatedDocs.forEach((doc, idx) => {
        lines.push(`  ${idx + 1}. ${doc.displayName} [${doc.isRequired ? 'Bắt buộc' : 'Tùy trường hợp'}]`);
      });

      try {
        await navigator.clipboard.writeText(lines.join('\n'));
        copyBtn.textContent = 'Đã sao chép gửi Zalo!';
        setTimeout(() => {
          copyBtn.textContent = 'Sao chép gửi người thân';
        }, 3000);
      } catch {
        // ignore clipboard denial
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', initVisitPlanModule);
