import { speakText, stopSpeaking, VoiceRecognizer, isSpeechSynthesisSupported } from './speech.js';

const INACTIVITY_TIMEOUT_SECONDS = 25;

let isSpeaking = false;
let secondsRemaining = INACTIVITY_TIMEOUT_SECONDS;
let countdownTimer = null;
let recognizer = null;
let currentResult = null;

// Khởi tạo các tính năng trợ năng và đếm ngược
document.addEventListener('DOMContentLoaded', () => {
  initAccessibility();
  initAIAssistantModal();
});

function initAccessibility() {
  // Cỡ chữ
  const savedScale = localStorage.getItem('kiosk_text_size') || 'large';
  applyTextScale(savedScale);

  const scaleButtons = document.querySelectorAll('[data-scale]');
  scaleButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const scale = btn.getAttribute('data-scale');
      applyTextScale(scale);
      localStorage.setItem('kiosk_text_size', scale);
    });
  });

  // Tương phản cao
  const savedContrast = localStorage.getItem('kiosk_contrast') === 'true';
  applyContrast(savedContrast);

  const contrastBtn = document.getElementById('btn-toggle-contrast');
  if (contrastBtn) {
    contrastBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isHigh = document.body.classList.toggle('high-contrast-mode');
      localStorage.setItem('kiosk_contrast', isHigh ? 'true' : 'false');
    });
  }

  // Nút thử loa đọc
  const testAudioBtn = document.getElementById('btn-test-audio');
  if (testAudioBtn) {
    testAudioBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (isSpeaking) {
        stopSpeaking();
        isSpeaking = false;
        testAudioBtn.classList.remove('bg-red-600', 'animate-pulse');
      } else {
        isSpeaking = true;
        testAudioBtn.classList.add('bg-red-600', 'animate-pulse');
        speakText('Kính chào Bác! Hệ thống hỗ trợ dịch vụ công số Phường Sơn Trà sẵn sàng phục vụ Bác.', 0.90, 
          () => { isSpeaking = true; },
          () => { isSpeaking = false; testAudioBtn.classList.remove('bg-red-600', 'animate-pulse'); },
          () => { isSpeaking = false; testAudioBtn.classList.remove('bg-red-600', 'animate-pulse'); }
        );
      }
    });
  }
}

function applyTextScale(scale) {
  document.documentElement.classList.remove('text-scale-normal', 'text-scale-large', 'text-scale-xlarge');
  document.documentElement.classList.add(`text-scale-${scale}`);

  document.querySelectorAll('[data-scale]').forEach(btn => {
    if (btn.getAttribute('data-scale') === scale) {
      btn.classList.add('bg-white', 'text-red-700', 'shadow-xs', 'ring-1', 'ring-red-200');
    } else {
      btn.classList.remove('bg-white', 'text-red-700', 'shadow-xs', 'ring-1', 'ring-red-200');
    }
  });
}

function applyContrast(enabled) {
  if (enabled) {
    document.body.classList.add('high-contrast-mode');
  } else {
    document.body.classList.remove('high-contrast-mode');
  }
}

// --- Khởi tạo Modal Trợ lý AI ---

function initAIAssistantModal() {
  const modal = document.getElementById('ai-assistant-modal');
  const openButtons = document.querySelectorAll('.btn-open-ai-assistant');
  const closeBtn = document.getElementById('ai-modal-close');
  const micBtn = document.getElementById('ai-mic-btn');
  const micStatus = document.getElementById('ai-mic-status');
  const transcriptEl = document.getElementById('ai-transcript');
  const speechBubble = document.getElementById('ai-speech-bubble');
  const countdownEl = document.getElementById('ai-countdown-seconds');
  const timerStatusEl = document.getElementById('ai-timer-status');
  const resultsContainer = document.getElementById('ai-results-container');
  const quickSuggestions = document.getElementById('ai-quick-suggestions');

  if (!modal) return;

  const resetTimer = () => {
    secondsRemaining = INACTIVITY_TIMEOUT_SECONDS;
    if (countdownEl) countdownEl.textContent = `${secondsRemaining}s`;
  };

  modal.addEventListener('click', resetTimer);
  modal.addEventListener('touchstart', resetTimer);

  // Tạo VoiceRecognizer
  recognizer = new VoiceRecognizer({
    onStart: () => {
      micBtn && micBtn.classList.add('bg-red-600', 'scale-105', 'ring-4', 'ring-red-200');
      if (micStatus) micStatus.textContent = 'Đang nghe...';
    },
    onResult: (text, isFinal) => {
      if (transcriptEl) transcriptEl.textContent = `"${text}"`;
      resetTimer();
      if (isFinal && text.trim().length > 2) {
        processQuery(text);
      }
    },
    onError: (err) => {
      micBtn && micBtn.classList.remove('bg-red-600', 'scale-105', 'ring-4', 'ring-red-200');
      if (micStatus) micStatus.textContent = 'Chạm để nói';
    },
    onEnd: () => {
      micBtn && micBtn.classList.remove('bg-red-600', 'scale-105', 'ring-4', 'ring-red-200');
      if (micStatus) micStatus.textContent = 'Chạm để nói';
    }
  });

  const speakAI = (text, onEnd) => {
    if (recognizer) recognizer.stop();
    isSpeaking = true;
    resetTimer();

    if (timerStatusEl) {
      timerStatusEl.innerHTML = `
        <span class="flex items-center gap-1.5 text-xs font-bold text-red-700 bg-red-50 py-1 px-3 rounded-full border border-red-200 animate-pulse">
          <span>Trợ lý AI đang đọc hướng dẫn... (Tạm dừng đếm ngược)</span>
        </span>
      `;
    }

    speakText(text, 0.90, 
      () => { isSpeaking = true; },
      () => {
        isSpeaking = false;
        resetTimer();
        if (timerStatusEl) {
          timerStatusEl.innerHTML = `
            <span>Tự động trở về màn hình chờ Kiosk sau: <strong class="text-red-700 font-bold font-mono" id="ai-countdown-seconds">${secondsRemaining}s</strong></span>
          `;
        }
        onEnd && onEnd();
      },
      () => {
        isSpeaking = false;
        resetTimer();
      }
    );
  };

  const processQuery = async (queryText) => {
    if (!queryText.trim()) return;
    resetTimer();

    try {
      const res = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryText })
      });
      const data = await res.json();
      currentResult = data;

      if (speechBubble) speechBubble.textContent = data.spokenResponse;

      if (data.isConfirmation) {
        speakAI(data.spokenResponse, () => {
          setTimeout(() => {
            closeModal();
            window.location.href = '/';
          }, 1500);
        });
        return;
      }

      // Hiển thị thẻ kết quả thủ tục
      if (data.service) {
        renderServiceResult(data);
      }

      speakAI(data.spokenResponse);
    } catch (e) {
      console.error('Error processing query:', e);
    }
  };

  const renderServiceResult = (data) => {
    if (!resultsContainer) return;
    if (quickSuggestions) quickSuggestions.classList.add('hidden');
    resultsContainer.classList.remove('hidden');

    const srv = data.service;
    const counter = data.counter || {};
    const officerName = (counter.officerName || 'Cán bộ phụ trách').replace(/[Đđ]\/c\.?\s*/gi, 'Đồng chí ');

    const docsHtml = (srv.requiredDocuments || []).map(d => `
      <div class="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-start justify-between gap-2">
        <div>
          <span class="font-bold text-slate-800 block">${d.name}</span>
          <span class="text-slate-500 text-[11px]">${d.note || ''}</span>
        </div>
        <span class="text-[10px] font-bold ${d.isRequired ? 'text-red-700 bg-red-100' : 'text-slate-600 bg-slate-200'} px-2 py-0.5 rounded shrink-0">
          ${d.isRequired ? 'Bắt buộc' : 'Bản sao'}
        </span>
      </div>
    `).join('');

    const stepsHtml = (srv.steps || []).map(step => `
      <div class="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-start gap-2.5">
        <span class="w-5 h-5 rounded-full bg-blue-600 text-white font-extrabold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
          ${step.stepNumber}
        </span>
        <div>
          <span class="font-bold text-slate-800 block">${step.title}</span>
          <p class="text-slate-600 text-[11px] mt-0.5">${step.description}</p>
        </div>
      </div>
    `).join('');

    resultsContainer.innerHTML = `
      <div class="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs mb-4">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="text-xs font-bold text-red-700 bg-red-100 px-2.5 py-0.5 rounded-md">Mã: ${srv.code}</span>
              <span class="text-xs font-semibold text-slate-500">Dịch vụ công Một cửa</span>
            </div>
            <h3 class="text-lg sm:text-xl font-extrabold text-slate-900">${srv.name}</h3>
            <p class="text-xs text-slate-600 mt-0.5">${srv.summary || ''}</p>
          </div>
          <a href="/service/${srv.id}" class="shrink-0 px-4 py-2 bg-[#be111a] hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors">
            Xem & In phiếu nộp
          </a>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-4">
        <div class="p-4 rounded-2xl bg-amber-50/70 border-2 border-amber-300 shadow-xs space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-extrabold text-amber-900 uppercase">VỊ TRÍ TIẾP NHẬN</span>
            <span class="text-sm font-extrabold text-amber-950">${counter.code || 'Ô tiếp nhận'} · Bàn ${counter.positionNumber || 1}</span>
          </div>
          <div class="p-3 bg-white rounded-xl border border-amber-200 text-xs space-y-1">
            <div class="flex justify-between"><span class="text-slate-500">Bộ phận:</span><span class="font-bold text-slate-800">${counter.name || ''}</span></div>
            <div class="flex justify-between"><span class="text-slate-500">Cán bộ phụ trách:</span><span class="font-extrabold text-[#be111a]">${officerName}</span></div>
          </div>
        </div>

        <div class="p-4 rounded-2xl bg-emerald-50/70 border-2 border-emerald-300 shadow-xs space-y-2">
          <span class="text-xs font-extrabold text-emerald-900 uppercase">CHI PHÍ & THỜI HẠN</span>
          <div class="p-3 bg-white rounded-xl border border-emerald-200 text-xs space-y-2">
            <div><span class="text-slate-500 block">Lệ phí:</span><span class="font-extrabold text-emerald-900 text-sm">${srv.fee}</span></div>
            <div><span class="text-slate-500 block">Thời hạn:</span><span class="font-bold text-slate-800">${srv.processingDuration}</span></div>
          </div>
        </div>

        <div class="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <span class="text-xs font-bold text-slate-900 uppercase">Hồ sơ cần chuẩn bị</span>
          <div class="space-y-1.5">${docsHtml}</div>
        </div>

        <div class="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <span class="text-xs font-bold text-slate-900 uppercase">Quy trình thực hiện</span>
          <div class="space-y-1.5">${stepsHtml}</div>
        </div>
      </div>

      <div class="p-4 rounded-2xl bg-gradient-to-r from-red-50 via-amber-50 to-emerald-50 border border-slate-200 text-center space-y-3">
        <p class="text-base font-bold text-slate-900">Bác đã nắm rõ các thông tin trên chưa ạ?</p>
        <div class="flex flex-wrap items-center justify-center gap-3">
          <button id="btn-understood" class="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md transition-all cursor-pointer">
            ✓ Tôi đã hiểu rõ, cảm ơn cháu!
          </button>
          <button id="btn-ask-more" class="px-5 py-2.5 rounded-xl bg-white hover:bg-blue-50 text-blue-800 border-2 border-blue-300 font-bold text-sm shadow-xs transition-all cursor-pointer">
            Hỏi thêm thủ tục khác
          </button>
          <a href="/service/${srv.id}" class="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-xs transition-all">
            Chi tiết & Nộp online
          </a>
        </div>
      </div>
    `;

    document.getElementById('btn-understood')?.addEventListener('click', () => {
      speakAI('Dạ vâng, cháu rất vui vì đã hỗ trợ được Bác! Kính chúc Bác luôn dồi dào sức khỏe. Cháu xin phép trở về màn hình chờ Kiosk nhé ạ!', () => {
        setTimeout(() => {
          closeModal();
          window.location.href = '/';
        }, 1500);
      });
    });

    document.getElementById('btn-ask-more')?.addEventListener('click', () => {
      resultsContainer.classList.add('hidden');
      if (quickSuggestions) quickSuggestions.classList.remove('hidden');
      if (speechBubble) speechBubble.textContent = 'Dạ thưa Bác! Bác cần cháu hỗ trợ thêm thủ tục gì nữa ạ? Bác nói vào micro nhé!';
      speakAI('Dạ thưa Bác! Bác cần cháu hỗ trợ thêm thủ tục gì nữa ạ? Bác nói vào micro nhé!', () => {
        recognizer && recognizer.start();
      });
    });
  };

  const openModal = () => {
    modal.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
    resetTimer();

    // Khởi động đếm ngược
    if (countdownTimer) clearInterval(countdownTimer);
    countdownTimer = setInterval(() => {
      if (isSpeaking) {
        resetTimer();
        return;
      }
      secondsRemaining -= 1;
      const countEl = document.getElementById('ai-countdown-seconds');
      if (countEl) countEl.textContent = `${secondsRemaining}s`;

      if (secondsRemaining <= 0) {
        clearInterval(countdownTimer);
        stopSpeaking();
        closeModal();
        window.location.href = '/';
      }
    }, 1000);

    // Lời chào mở đầu: "AI" tự động đọc chuẩn thành "Ây ai"
    const welcome = 'Kính chào Bác! Cháu là Trợ lý AI Một cửa Phường Sơn Trà. Bác cần tìm hiểu thủ tục gì hôm nay ạ? Bác hãy bấm vào micro và nói cho cháu nghe nhé!';
    if (speechBubble) speechBubble.textContent = welcome;
    speakAI(welcome, () => {
      recognizer && recognizer.start();
    });
  };

  const closeModal = () => {
    modal.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
    stopSpeaking();
    if (recognizer) recognizer.stop();
    if (countdownTimer) clearInterval(countdownTimer);
  };

  openButtons.forEach(btn => btn.addEventListener('click', (e) => {
    e.stopPropagation();
    openModal();
  }));

  closeBtn?.addEventListener('click', closeModal);

  micBtn?.addEventListener('click', () => {
    resetTimer();
    if (recognizer && recognizer.isListening) {
      recognizer.stop();
    } else {
      stopSpeaking();
      recognizer && recognizer.start();
    }
  });

  // Câu hỏi gợi ý nhanh
  document.querySelectorAll('.btn-sample-query').forEach(btn => {
    btn.addEventListener('click', () => {
      const q = btn.getAttribute('data-query');
      if (transcriptEl) transcriptEl.textContent = `"${q}"`;
      processQuery(q);
    });
  });

  // Tìm kiếm bằng form gõ phím
  const customForm = document.getElementById('ai-custom-form');
  const customInput = document.getElementById('ai-custom-input');
  if (customForm && customInput) {
    customForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = customInput.value.trim();
      if (val) {
        if (transcriptEl) transcriptEl.textContent = `"${val}"`;
        processQuery(val);
      }
    });
  }
}
