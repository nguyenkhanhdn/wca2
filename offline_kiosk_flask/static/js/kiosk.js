import { speakText, stopSpeaking, VoiceRecognizer } from './speech.js';

const INACTIVITY_TIMEOUT_SECONDS = 45;

let isSpeaking = false;
let secondsRemaining = INACTIVITY_TIMEOUT_SECONDS;
let countdownTimer = null;
let recognizer = null;
let autoReadEnabled = true;
let isFullscreen = false;
let activeServiceId = '';
let conversationHistory = [];

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

document.addEventListener('DOMContentLoaded', () => {
  initAccessibility();
  initAIAssistantModal();
});

function initAccessibility() {
  const savedScale = localStorage.getItem('kiosk_text_size') || 'large';
  applyTextScale(savedScale);

  const scaleButtons = document.querySelectorAll('[data-scale]');
  scaleButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const scale = btn.getAttribute('data-scale') || 'large';
      applyTextScale(scale);
      localStorage.setItem('kiosk_text_size', scale);
    });
  });

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
        speakText(
          'Kính chào Bác! Hệ thống hỗ trợ dịch vụ công số Phường Sơn Trà sẵn sàng phục vụ Bác.',
          0.90,
          () => {
            isSpeaking = true;
          },
          () => {
            isSpeaking = false;
            testAudioBtn.classList.remove('bg-red-600', 'animate-pulse');
          },
          () => {
            isSpeaking = false;
            testAudioBtn.classList.remove('bg-red-600', 'animate-pulse');
          }
        );
      }
    });
  }
}

function applyTextScale(scale) {
  document.documentElement.classList.remove('text-scale-normal', 'text-scale-large', 'text-scale-xlarge');
  document.documentElement.classList.add(`text-scale-${scale}`);

  document.querySelectorAll('[data-scale]').forEach((btn) => {
    if (btn.getAttribute('data-scale') === scale) {
      btn.classList.add('bg-white', 'text-red-800', 'shadow-xs', 'ring-1', 'ring-red-200');
      btn.classList.remove('text-white');
    } else {
      btn.classList.remove('bg-white', 'text-red-800', 'shadow-xs', 'ring-1', 'ring-red-200');
      if (btn.closest('#ai-assistant-modal')) {
        btn.classList.add('text-white');
      }
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

function initAIAssistantModal() {
  const modal = document.getElementById('ai-assistant-modal');
  const dialog = document.getElementById('ai-modal-dialog');
  const openButtons = document.querySelectorAll('.btn-open-ai-assistant');
  const prefilledButtons = document.querySelectorAll('[data-ai-question]');
  const closeBtn = document.getElementById('ai-modal-close');
  const micBtn = document.getElementById('ai-mic-btn');
  const micStatus = document.getElementById('ai-mic-status');
  const transcriptEl = document.getElementById('ai-transcript');
  const speechBubble = document.getElementById('ai-speech-bubble');
  const timerStatusEl = document.getElementById('ai-timer-status');
  const chatBody = document.getElementById('ai-chat-body');
  const chatThread = document.getElementById('ai-chat-thread');
  const quickSuggestions = document.getElementById('ai-quick-suggestions');
  const autoReadBtn = document.getElementById('ai-autoread-btn');
  const autoReadLabel = document.getElementById('ai-autoread-label');
  const fullscreenBtn = document.getElementById('ai-fullscreen-btn');
  const fullscreenLabel = document.getElementById('ai-fullscreen-label');
  const resetChatBtn = document.getElementById('ai-reset-chat');
  const customForm = document.getElementById('ai-custom-form');
  const customInput = document.getElementById('ai-custom-input');

  if (!modal) return;

  const scrollToBottom = () => {
    if (chatBody) {
      chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: 'smooth' });
    }
  };

  const resetTimer = () => {
    secondsRemaining = INACTIVITY_TIMEOUT_SECONDS;
    const countEl = document.getElementById('ai-countdown-seconds');
    if (countEl) countEl.textContent = `${secondsRemaining}s`;
  };

  modal.addEventListener('click', resetTimer);
  modal.addEventListener('touchstart', resetTimer);

  const updateAutoReadUI = () => {
    if (autoReadLabel) {
      autoReadLabel.textContent = autoReadEnabled ? 'Tự động đọc: Bật' : 'Tự động đọc: Tắt';
    }
    if (autoReadBtn) {
      autoReadBtn.classList.toggle('bg-emerald-500', autoReadEnabled);
      autoReadBtn.classList.toggle('hover:bg-emerald-600', autoReadEnabled);
      autoReadBtn.classList.toggle('bg-white/15', !autoReadEnabled);
      autoReadBtn.classList.toggle('hover:bg-white/25', !autoReadEnabled);
    }
  };

  autoReadBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    autoReadEnabled = !autoReadEnabled;
    if (!autoReadEnabled) {
      stopSpeaking();
      isSpeaking = false;
    }
    updateAutoReadUI();
  });

  fullscreenBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    isFullscreen = !isFullscreen;
    if (dialog) {
      if (isFullscreen) {
        dialog.classList.remove('max-w-4xl', 'h-[92vh]', 'rounded-3xl');
        dialog.classList.add('max-w-[98vw]', 'h-[96vh]', 'rounded-2xl');
      } else {
        dialog.classList.remove('max-w-[98vw]', 'h-[96vh]', 'rounded-2xl');
        dialog.classList.add('max-w-4xl', 'h-[92vh]', 'rounded-3xl');
      }
    }
    if (fullscreenLabel) {
      fullscreenLabel.textContent = isFullscreen ? 'Thu nhỏ' : 'Phóng to';
    }
  });

  recognizer = new VoiceRecognizer({
    onStart: () => {
      micBtn?.classList.add('bg-red-700', 'ring-4', 'ring-amber-300');
      if (micStatus) micStatus.textContent = 'Đang nghe Bác nói...';
    },
    onResult: (text, isFinal) => {
      if (transcriptEl) transcriptEl.textContent = `"${text}"`;
      resetTimer();
      if (isFinal && text.trim().length > 2) {
        processQuery(text.trim());
      }
    },
    onError: () => {
      micBtn?.classList.remove('bg-red-700', 'ring-4', 'ring-amber-300');
      if (micStatus) micStatus.textContent = 'Chạm để nói';
    },
    onEnd: () => {
      micBtn?.classList.remove('bg-red-700', 'ring-4', 'ring-amber-300');
      if (micStatus) micStatus.textContent = 'Sẵn sàng nghe';
    },
  });

  const speakAI = (text, forceSpeak = false, onEnd = null) => {
    if (!text) return;
    if (!autoReadEnabled && !forceSpeak) {
      onEnd && onEnd();
      return;
    }
    if (recognizer) recognizer.stop();
    isSpeaking = true;
    resetTimer();

    if (timerStatusEl) {
      timerStatusEl.innerHTML =
        '<span class="text-xs font-bold text-[#be111a]">Đang đọc hướng dẫn bằng giọng nói... (Tạm dừng đếm ngược)</span>';
    }

    speakText(
      text,
      0.90,
      () => {
        isSpeaking = true;
      },
      () => {
        isSpeaking = false;
        resetTimer();
        if (timerStatusEl) {
          timerStatusEl.innerHTML = `Tự động trở về màn hình chờ Kiosk sau: <strong class="text-red-700 font-bold font-mono text-sm" id="ai-countdown-seconds">${secondsRemaining}s</strong>`;
        }
        onEnd && onEnd();
      },
      () => {
        isSpeaking = false;
        resetTimer();
      }
    );
  };

  const appendUserMessage = (text) => {
    if (!chatThread) return;
    const bubble = document.createElement('div');
    bubble.className = 'flex justify-end';
    bubble.innerHTML = `
      <div class="max-w-[85%] bg-[#0b132b] text-white px-4 py-3 rounded-2xl rounded-tr-sm shadow-xs text-sm sm:text-base font-bold">
        <span class="block text-[10px] uppercase tracking-wider text-amber-300 mb-0.5">Câu hỏi của Bác</span>
        <span>${escapeHtml(text)}</span>
      </div>
    `;
    chatThread.appendChild(bubble);
    scrollToBottom();
  };

  const appendLoadingMessage = () => {
    if (!chatThread) return null;
    const el = document.createElement('div');
    el.className = 'flex items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-sm font-bold text-slate-600';
    el.innerHTML = '<span>Cháu đang tra cứu hồ sơ và quy định Nhà nước, Bác chờ một chút nhé ạ...</span>';
    chatThread.appendChild(el);
    scrollToBottom();
    return el;
  };

  const appendAssistantMessage = (data) => {
    if (!chatThread) return;

    const answerText = data.answer || data.spokenResponse || '';
    const counterInfo = data.counterInfo || '';
    const feeAndDuration = data.feeAndDuration || '';
    const docs = Array.isArray(data.requiredFormsAndDocs) ? data.requiredFormsAndDocs : [];
    const steps = Array.isArray(data.stepByStepGuide) ? data.stepByStepGuide : [];
    const regs = Array.isArray(data.legalRegulations) ? data.legalRegulations : [];
    const followUps = Array.isArray(data.followUpSuggestions) ? data.followUpSuggestions : [];
    const srv = data.service || null;

    const docsListHtml = docs.length
      ? `<ul class="space-y-1.5 text-xs sm:text-sm text-slate-800">${docs
          .map((d) => `<li class="flex items-start gap-2"><span class="text-[#be111a] font-black">•</span><span>${escapeHtml(d)}</span></li>`)
          .join('')}</ul>`
      : '';

    const stepsListHtml = steps.length
      ? `<ol class="space-y-1.5 text-xs sm:text-sm text-slate-800">${steps
          .map((s) => `<li class="bg-slate-50 p-2.5 rounded-xl border border-slate-200">${escapeHtml(s)}</li>`)
          .join('')}</ol>`
      : '';

    const regsListHtml = regs.length
      ? `<div class="pt-2 border-t border-slate-100"><span class="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">Căn cứ quy định Nhà nước:</span><ul class="space-y-1 text-xs text-slate-600">${regs
          .map((r) => `<li>· ${escapeHtml(r)}</li>`)
          .join('')}</ul></div>`
      : '';

    const followUpsHtml = followUps.length
      ? `<div class="pt-3 border-t border-slate-100 space-y-2">
           <span class="text-xs font-extrabold text-slate-600 block">Bác có thể bấm hỏi tiếp:</span>
           <div class="flex flex-wrap gap-2">
             ${followUps
               .map(
                 (q) =>
                   `<button type="button" class="ai-followup-btn px-3 py-2 rounded-xl bg-slate-100 hover:bg-red-50 border border-slate-300 hover:border-[#be111a] text-xs sm:text-sm font-bold text-slate-800 cursor-pointer transition-colors" data-query="${escapeHtml(q)}">${escapeHtml(q)}</button>`
               )
               .join('')}
           </div>
         </div>`
      : '';

    const card = document.createElement('div');
    card.className = 'bg-white rounded-3xl p-4 sm:p-5 border-2 border-red-200 shadow-sm space-y-4';

    const modeTag =
      data.mode === 'gemini_online'
        ? 'Trợ lý Gemini AI · Có kết nối mạng'
        : 'Tra cứu dữ liệu Một cửa SQLite (Offline)';

    card.innerHTML = `
      <div class="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
        <div class="flex items-center gap-2">
          <span class="w-8 h-8 rounded-xl bg-[#be111a] text-white font-black text-xs flex items-center justify-center">AI</span>
          <span class="text-xs font-black text-[#be111a] uppercase tracking-wider">Hướng dẫn cho Bác</span>
        </div>
        <span class="text-[11px] font-semibold text-slate-500">${escapeHtml(modeTag)}</span>
      </div>

      <p class="text-sm sm:text-base font-bold text-slate-900 leading-relaxed">${escapeHtml(answerText)}</p>

      ${
        counterInfo || feeAndDuration
          ? `<div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              ${
                counterInfo
                  ? `<div class="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 space-y-1">
                      <span class="text-[11px] font-black uppercase tracking-wider text-amber-900 block">1. Nơi tiếp nhận &amp; Cán bộ</span>
                      <p class="text-xs sm:text-sm font-extrabold text-slate-900">${escapeHtml(counterInfo)}</p>
                      <a href="/mindmap" class="inline-block text-xs font-bold text-[#be111a] hover:underline mt-1">Xem Sơ đồ 8 Ô tiếp nhận →</a>
                    </div>`
                  : ''
              }
              ${
                feeAndDuration
                  ? `<div class="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 space-y-1">
                      <span class="text-[11px] font-black uppercase tracking-wider text-emerald-900 block">2. Lệ phí &amp; Thời hạn giải quyết</span>
                      <p class="text-xs sm:text-sm font-extrabold text-emerald-950">${escapeHtml(feeAndDuration)}</p>
                    </div>`
                  : ''
              }
            </div>`
          : ''
      }

      ${
        docsListHtml
          ? `<div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span class="text-[11px] font-black uppercase tracking-wider text-slate-700 block">3. Giấy tờ &amp; Form mẫu quy định</span>
              ${docsListHtml}
            </div>`
          : ''
      }

      ${
        stepsListHtml || regsListHtml
          ? `<div class="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-2.5">
              <span class="text-[11px] font-black uppercase tracking-wider text-slate-700 block">4. Cách thức thực hiện &amp; Quy định Nhà nước</span>
              ${stepsListHtml}
              ${regsListHtml}
            </div>`
          : ''
      }

      <div class="flex flex-wrap items-center gap-2.5 pt-1">
        <button type="button" class="ai-replay-btn px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs sm:text-sm cursor-pointer shadow-xs">
          Nghe đọc lại câu trả lời
        </button>
        ${
          srv && srv.id
            ? `<a href="/service/${escapeHtml(srv.id)}" class="px-4 py-2 rounded-xl bg-[#be111a] hover:bg-red-700 text-white font-extrabold text-xs sm:text-sm shadow-xs">
                Xem chi tiết &amp; In phiếu nộp
              </a>`
            : ''
        }
      </div>

      ${followUpsHtml}
    `;

    chatThread.appendChild(card);

    card.querySelector('.ai-replay-btn')?.addEventListener('click', () => {
      speakAI(data.spokenSummary || answerText, true);
    });

    card.querySelectorAll('.ai-followup-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const q = btn.getAttribute('data-query');
        if (q) processQuery(q);
      });
    });

    scrollToBottom();
  };

  const processQuery = async (queryText) => {
    const clean = (queryText || '').trim();
    if (!clean) return;
    resetTimer();

    if (quickSuggestions) quickSuggestions.classList.add('hidden');
    if (customInput) customInput.value = '';
    if (transcriptEl) transcriptEl.textContent = `"${clean}"`;

    appendUserMessage(clean);
    const loadingEl = appendLoadingMessage();

    try {
      const res = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: clean,
          activeServiceId,
          history: conversationHistory.slice(-6),
        }),
      });
      const data = await res.json();
      loadingEl?.remove();

      if (data.matchedServiceId) {
        activeServiceId = data.matchedServiceId;
      }

      const replyText = data.answer || data.spokenResponse || 'Dạ cháu đã nhận câu hỏi của Bác ạ.';
      conversationHistory.push({ role: 'user', text: clean });
      conversationHistory.push({ role: 'assistant', text: replyText });

      if (speechBubble) speechBubble.textContent = data.spokenSummary || replyText;
      appendAssistantMessage(data);

      speakAI(data.spokenSummary || replyText, false);
    } catch (e) {
      loadingEl?.remove();
      appendAssistantMessage({
        mode: 'offline_sqlite',
        answer: 'Dạ xin lỗi Bác, kết nối máy chủ cục bộ tạm thời bị gián đoạn. Bác vui lòng thử gửi lại câu hỏi nhé ạ.',
        followUpSuggestions: ['Làm giấy khai sinh cho cháu', 'Trợ cấp người cao tuổi (70 - 80 tuổi)'],
      });
    }
  };

  const resetConversation = () => {
    stopSpeaking();
    isSpeaking = false;
    activeServiceId = '';
    conversationHistory = [];
    if (chatThread) chatThread.innerHTML = '';
    if (quickSuggestions) quickSuggestions.classList.remove('hidden');
    if (transcriptEl) transcriptEl.textContent = 'Ví dụ: "Làm khai sinh cần mẫu đơn gì?", "Trợ cấp 70 tuổi"...';
    if (speechBubble) {
      speechBubble.textContent =
        'Kính chào Bác! Cháu là Trợ lý Hỏi đáp Một cửa Phường Sơn Trà. Bác muốn hỏi về thủ tục nào, cần chuẩn bị giấy tờ hay mẫu tờ khai gì, Bác cứ bấm chọn câu hỏi bên dưới, gõ chữ hoặc bấm nút Micro để nói cho cháu nghe nhé ạ!';
    }
    resetTimer();
  };

  const openModal = (initialQuestion = '') => {
    modal.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
    resetTimer();
    updateAutoReadUI();

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
      }
    }, 1000);

    if (initialQuestion && initialQuestion.trim()) {
      processQuery(initialQuestion.trim());
    } else if (!conversationHistory.length) {
      const welcome =
        'Kính chào Bác! Cháu là Trợ lý Hỏi đáp Một cửa Phường Sơn Trà. Bác cần tìm hiểu thủ tục hay mẫu đơn nào hôm nay ạ?';
      speakAI(welcome, false);
    }
  };

  const closeModal = () => {
    modal.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
    stopSpeaking();
    isSpeaking = false;
    if (recognizer) recognizer.stop();
    if (countdownTimer) clearInterval(countdownTimer);
  };

  openButtons.forEach((btn) =>
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      openModal();
    })
  );

  prefilledButtons.forEach((btn) =>
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const q = btn.getAttribute('data-ai-question') || '';
      openModal(q);
    })
  );

  closeBtn?.addEventListener('click', closeModal);
  resetChatBtn?.addEventListener('click', resetConversation);

  micBtn?.addEventListener('click', () => {
    resetTimer();
    if (recognizer && recognizer.isListening) {
      recognizer.stop();
    } else {
      stopSpeaking();
      isSpeaking = false;
      recognizer && recognizer.start();
    }
  });

  document.querySelectorAll('.btn-sample-query').forEach((btn) => {
    btn.addEventListener('click', () => {
      const q = btn.getAttribute('data-query');
      if (q) processQuery(q);
    });
  });

  if (customForm && customInput) {
    customForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = customInput.value.trim();
      if (val) processQuery(val);
    });
  }
}
