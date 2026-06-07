/**
 * AI Support Chat Widget
 * Usage: <script src="https://your-cdn.vercel.app/widget/chatbot.js"
 *                 data-api="https://your-backend.vercel.app/api/chat"
 *                 data-bot-name="Aria"
 *                 data-greeting="Hi! How can I help you today?"
 *                 data-color="#2563EB"
 *                 defer></script>
 */
(function () {
  'use strict';

  // ── Read config from script tag attributes ────────────────────────────
  const scriptTag  = document.currentScript || document.querySelector('script[data-api]');
  const API_URL    = scriptTag?.dataset?.api      || 'https://your-backend.vercel.app/api/chat';
  const BOT_NAME   = scriptTag?.dataset?.botName  || 'Support';
  const GREETING   = scriptTag?.dataset?.greeting || `Hi 👋 I'm ${BOT_NAME}. How can I help?`;
  const BRAND_HEX  = scriptTag?.dataset?.color    || '#2563EB';

  // ── Conversation history (Gemini format) ─────────────────────────────
  let history = [];
  let isOpen  = false;
  let isTyping = false;

  // ── Inject styles ──────────────────────────────────────────────────────
  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');

    #_acw-root * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'DM Sans', sans-serif; }

    #_acw-root {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 2147483647;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 12px;
    }

    /* ── Launcher Button ── */
    #_acw-btn {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: ${BRAND_HEX};
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 24px rgba(0,0,0,0.18);
      transition: transform 0.2s cubic-bezier(.34,1.56,.64,1), box-shadow 0.2s ease;
      flex-shrink: 0;
    }
    #_acw-btn:hover { transform: scale(1.08); box-shadow: 0 6px 30px rgba(0,0,0,0.22); }
    #_acw-btn svg { transition: transform 0.3s cubic-bezier(.34,1.56,.64,1); }
    #_acw-btn.open svg.icon-chat  { transform: scale(0) rotate(-90deg); }
    #_acw-btn.open svg.icon-close { transform: scale(1) rotate(0deg); }
    #_acw-btn svg.icon-close { position: absolute; transform: scale(0) rotate(90deg); }

    /* ── Window ── */
    #_acw-window {
      width: 360px;
      height: 520px;
      border-radius: 20px;
      background: #ffffff;
      box-shadow: 0 16px 56px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.08);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      opacity: 0;
      transform: translateY(16px) scale(0.97);
      pointer-events: none;
      transition: opacity 0.25s ease, transform 0.25s cubic-bezier(.34,1.4,.64,1);
      transform-origin: bottom right;
    }
    #_acw-window.visible {
      opacity: 1;
      transform: translateY(0) scale(1);
      pointer-events: all;
    }

    /* ── Header ── */
    #_acw-header {
      background: ${BRAND_HEX};
      padding: 16px 18px;
      display: flex;
      align-items: center;
      gap: 12px;
      flex-shrink: 0;
    }
    #_acw-avatar {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: rgba(255,255,255,0.25);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
    }
    #_acw-header-text h3 { color: #fff; font-size: 15px; font-weight: 600; line-height: 1.2; }
    #_acw-header-text p  { color: rgba(255,255,255,0.75); font-size: 12px; margin-top: 2px; }
    #_acw-status-dot {
      width: 8px; height: 8px; border-radius: 50%;
      background: #4ade80;
      box-shadow: 0 0 0 2px rgba(74,222,128,0.35);
      display: inline-block;
      margin-right: 5px;
    }

    /* ── Messages ── */
    #_acw-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px 14px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      scroll-behavior: smooth;
    }
    #_acw-messages::-webkit-scrollbar { width: 4px; }
    #_acw-messages::-webkit-scrollbar-track { background: transparent; }
    #_acw-messages::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 4px; }

    .acw-msg { display: flex; flex-direction: column; max-width: 82%; animation: acwFadeUp 0.22s ease; }
    .acw-msg.bot  { align-self: flex-start; }
    .acw-msg.user { align-self: flex-end; }

    .acw-bubble {
      padding: 10px 13px;
      border-radius: 16px;
      font-size: 13.5px;
      line-height: 1.55;
      word-break: break-word;
    }
    .acw-msg.bot  .acw-bubble { background: #f1f5f9; color: #1e293b; border-bottom-left-radius: 4px; }
    .acw-msg.user .acw-bubble { background: ${BRAND_HEX}; color: #fff; border-bottom-right-radius: 4px; }

    .acw-time {
      font-size: 11px;
      color: #94a3b8;
      margin-top: 3px;
      padding: 0 4px;
    }
    .acw-msg.user .acw-time { text-align: right; }

    /* Typing indicator */
    .acw-typing-bubble {
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 12px 14px;
      background: #f1f5f9;
      border-radius: 16px;
      border-bottom-left-radius: 4px;
      width: fit-content;
    }
    .acw-dot {
      width: 7px; height: 7px; border-radius: 50%;
      background: #94a3b8;
      animation: acwBounce 1.2s ease-in-out infinite;
    }
    .acw-dot:nth-child(2) { animation-delay: 0.2s; }
    .acw-dot:nth-child(3) { animation-delay: 0.4s; }

    /* ── Input bar ── */
    #_acw-inputbar {
      padding: 12px 14px;
      border-top: 1px solid #f1f5f9;
      display: flex;
      gap: 8px;
      align-items: flex-end;
      background: #fff;
      flex-shrink: 0;
    }
    #_acw-input {
      flex: 1;
      border: 1.5px solid #e2e8f0;
      border-radius: 12px;
      padding: 10px 13px;
      font-size: 13.5px;
      font-family: 'DM Sans', sans-serif;
      color: #1e293b;
      resize: none;
      max-height: 96px;
      min-height: 42px;
      line-height: 1.5;
      outline: none;
      transition: border-color 0.15s ease;
      background: #f8fafc;
    }
    #_acw-input:focus { border-color: ${BRAND_HEX}; background: #fff; }
    #_acw-input::placeholder { color: #94a3b8; }

    #_acw-send {
      width: 40px; height: 40px;
      border-radius: 10px;
      background: ${BRAND_HEX};
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: opacity 0.15s ease, transform 0.15s ease;
    }
    #_acw-send:disabled { opacity: 0.45; cursor: default; }
    #_acw-send:not(:disabled):hover { transform: scale(1.05); }

    #_acw-footer {
      text-align: center;
      padding: 7px 0 10px;
      font-size: 11px;
      color: #cbd5e1;
      letter-spacing: 0.02em;
    }

    /* ── Unread badge ── */
    #_acw-badge {
      position: absolute;
      top: -3px; right: -3px;
      width: 18px; height: 18px;
      border-radius: 50%;
      background: #ef4444;
      color: #fff;
      font-size: 11px;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;
      transition: transform 0.2s cubic-bezier(.34,1.56,.64,1);
    }
    #_acw-badge.hidden { transform: scale(0); }

    @keyframes acwFadeUp {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes acwBounce {
      0%, 60%, 100% { transform: translateY(0); }
      30%            { transform: translateY(-5px); }
    }

    @media (max-width: 420px) {
      #_acw-root { bottom: 16px; right: 16px; }
      #_acw-window { width: calc(100vw - 32px); height: 70vh; }
    }
  `;

  const styleEl = document.createElement('style');
  styleEl.textContent = styles;
  document.head.appendChild(styleEl);

  // ── Build DOM ──────────────────────────────────────────────────────────
  const root = document.createElement('div');
  root.id = '_acw-root';

  root.innerHTML = `
    <!-- Chat Window -->
    <div id="_acw-window" role="dialog" aria-label="${BOT_NAME} chat window" aria-live="polite">
      <div id="_acw-header">
        <div id="_acw-avatar">🤖</div>
        <div id="_acw-header-text">
          <h3>${BOT_NAME}</h3>
          <p><span id="_acw-status-dot"></span>Online now</p>
        </div>
      </div>
      <div id="_acw-messages" role="log" aria-relevant="additions"></div>
      <div id="_acw-inputbar">
        <textarea
          id="_acw-input"
          placeholder="Type a message…"
          rows="1"
          aria-label="Message input"
          maxlength="800"
        ></textarea>
        <button id="_acw-send" aria-label="Send message" disabled>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
      <div id="_acw-footer">Powered by AI · <a href="#" style="color:inherit;text-decoration:none;">Privacy</a></div>
    </div>

    <!-- Launcher Button -->
    <button id="_acw-btn" aria-label="Toggle chat" aria-expanded="false">
      <svg class="icon-chat" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
      <svg class="icon-close" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round">
        <line x1="18" y1="6" x2="6" y2="18"/>
        <line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
      <div id="_acw-badge" class="hidden">1</div>
    </button>
  `;

  document.body.appendChild(root);

  // ── Element refs ───────────────────────────────────────────────────────
  const win      = root.querySelector('#_acw-window');
  const btn      = root.querySelector('#_acw-btn');
  const msgArea  = root.querySelector('#_acw-messages');
  const input    = root.querySelector('#_acw-input');
  const sendBtn  = root.querySelector('#_acw-send');
  const badge    = root.querySelector('#_acw-badge');

  // ── Helpers ────────────────────────────────────────────────────────────
  function getTime() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function escapeHtml(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function appendMessage(role, text) {
    const wrapper = document.createElement('div');
    wrapper.className = `acw-msg ${role}`;
    wrapper.innerHTML = `
      <div class="acw-bubble">${escapeHtml(text)}</div>
      <span class="acw-time">${role === 'bot' ? BOT_NAME + ' · ' : ''}${getTime()}</span>
    `;
    msgArea.appendChild(wrapper);
    msgArea.scrollTop = msgArea.scrollHeight;
    return wrapper;
  }

  function showTyping() {
    const el = document.createElement('div');
    el.className = 'acw-msg bot';
    el.id = '_acw-typing';
    el.innerHTML = `
      <div class="acw-typing-bubble">
        <div class="acw-dot"></div>
        <div class="acw-dot"></div>
        <div class="acw-dot"></div>
      </div>
    `;
    msgArea.appendChild(el);
    msgArea.scrollTop = msgArea.scrollHeight;
  }

  function hideTyping() {
    const el = root.querySelector('#_acw-typing');
    if (el) el.remove();
  }

  // ── Open / Close ───────────────────────────────────────────────────────
  function openChat() {
    isOpen = true;
    win.classList.add('visible');
    btn.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
    badge.classList.add('hidden');
    input.focus();
  }

  function closeChat() {
    isOpen = false;
    win.classList.remove('visible');
    btn.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
  }

  btn.addEventListener('click', () => isOpen ? closeChat() : openChat());

  // Show badge with greeting after 4 s if user hasn't opened yet
  setTimeout(() => {
    if (!isOpen) badge.classList.remove('hidden');
  }, 4000);

  // ── Auto-resize textarea ───────────────────────────────────────────────
  input.addEventListener('input', () => {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 96) + 'px';
    sendBtn.disabled = input.value.trim() === '';
  });

  // ── Send on Enter (Shift+Enter = newline) ──────────────────────────────
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!sendBtn.disabled) handleSend();
    }
  });

  sendBtn.addEventListener('click', handleSend);

  // ── Greeting ───────────────────────────────────────────────────────────
  appendMessage('bot', GREETING);

  // ── Send message ───────────────────────────────────────────────────────
  async function handleSend() {
    if (isTyping) return;
    const text = input.value.trim();
    if (!text) return;

    // Reset input
    input.value = '';
    input.style.height = 'auto';
    sendBtn.disabled = true;

    // Add to UI and history
    appendMessage('user', text);
    history.push({ role: 'user', parts: [{ text }] });

    // Show typing
    isTyping = true;
    showTyping();

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history })
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      const reply = data.reply || 'Sorry, I could not process your request right now.';

      hideTyping();
      appendMessage('bot', reply);

      // Save assistant reply to history
      history.push({ role: 'model', parts: [{ text: reply }] });

      // Trim history to last 20 turns to avoid context overflow
      if (history.length > 20) history = history.slice(-20);

    } catch (err) {
      hideTyping();
      appendMessage('bot', 'I\'m having trouble connecting right now. Please try again shortly.');
      console.error('[ChatWidget] API error:', err);
    } finally {
      isTyping = false;
      input.focus();
    }
  }

})();
