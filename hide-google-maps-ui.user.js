// ==UserScript==
// @name         GSVH+
// @namespace    local
// @version      2.0
// @description  H key
// @match        https://www.google.com/maps/*
// @match        https://maps.google.com/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(() => {
  'use strict';

  const CLS = {
    HIDE: '__svh_hide',
    ROOT: '__svh_root',
    LOCK: '__svh_lock',
    STYLE: '__svh_style'
  };

  const state = {
    enabled: false,
    observer: null,
    timer: null,
  };

  injectStyle();

  function injectStyle() {
    if (document.getElementById(CLS.STYLE)) return;

    const style = document.createElement('style');
    style.id = CLS.STYLE;
    style.textContent = `
      .${CLS.HIDE} { display: none !important; }
      .${CLS.ROOT} {
        position: fixed !important;
        inset: 0 !important;
        z-index: 2147483647 !important;
        width: 100vw !important;
        height: 100vh !important;
        margin: 0 !important;
        padding: 0 !important;
        background: #000 !important;
      }
      html.${CLS.LOCK}, body.${CLS.LOCK} {
        overflow: hidden !important;
      }
    `;
    document.head.appendChild(style);
  }

  function isEditable(el) {
    if (!el) return false;
    const tag = (el.tagName || '').toUpperCase();
    return (
      tag === 'INPUT' ||
      tag === 'TEXTAREA' ||
      tag === 'SELECT' ||
      el.isContentEditable ||
      !!el.closest?.('[contenteditable="true"]')
    );
  }

  function getRect(el) {
    return el.getBoundingClientRect();
  }

  function rectArea(el) {
    const r = getRect(el);
    return Math.max(0, r.width) * Math.max(0, r.height);
  }

  function isVisible(el) {
    if (!(el instanceof Element)) return false;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') return false;
    const r = getRect(el);
    return r.width > 1 && r.height > 1;
  }

  function viewportArea() {
    return window.innerWidth * window.innerHeight;
  }

  function clearOurMarks() {
    document.querySelectorAll(`.${CLS.HIDE}`).forEach(el => el.classList.remove(CLS.HIDE));
    document.querySelectorAll(`.${CLS.ROOT}`).forEach(el => el.classList.remove(CLS.ROOT));
    document.documentElement.classList.remove(CLS.LOCK);
    document.body.classList.remove(CLS.LOCK);
  }

  function findMainCanvas() {
    const canvases = [...document.querySelectorAll('canvas')].filter(isVisible);
    if (!canvases.length) return null;

    canvases.sort((a, b) => rectArea(b) - rectArea(a));
    return canvases[0];
  }

  function findStageRoot(canvas) {
    const vpArea = viewportArea();
    let node = canvas;
    let best = canvas.parentElement || canvas;

    while (node && node.parentElement && node !== document.body) {
      const p = node.parentElement;
      if (!isVisible(p)) break;
      if (!p.querySelector('canvas')) break;

      const area = rectArea(p);
      if (area >= vpArea * 0.35 && area <= vpArea * 2.5) {
        best = p;
      }

      node = p;
    }

    return best;
  }

  function addAncestorsToSet(el, stopAt, set) {
    let n = el;
    while (n && n !== stopAt) {
      set.add(n);
      n = n.parentElement;
    }
    if (stopAt) set.add(stopAt);
  }

  function isCornerWidget(el) {
    if (!isVisible(el)) return false;

    const r = getRect(el);
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const area = Math.max(0, r.width) * Math.max(0, r.height);
    const vpArea = vw * vh;

    const smallEnough = area > 0 && area < vpArea * 0.12;
    const nearLeft = r.left <= 24;
    const nearRight = (vw - r.right) <= 24;
    const nearTop = r.top <= 24;
    const nearBottom = (vh - r.bottom) <= 24;
    const inCorner = (nearLeft || nearRight) && (nearTop || nearBottom);

    return smallEnough && inCorner;
  }

  function buildKeepSet(stageRoot) {
    const keep = new Set([stageRoot]);
    const vpArea = viewportArea();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const media = [...stageRoot.querySelectorAll('canvas, video, img')].filter(isVisible);

    for (const el of media) {
      const r = getRect(el);
      const area = r.width * r.height;

      const isBigMedia =
        area >= vpArea * 0.08 ||
        (r.width >= vw * 0.55 && r.height >= vh * 0.35);

      if (!isBigMedia || isCornerWidget(el)) continue;

      addAncestorsToSet(el, stageRoot, keep);
    }

    for (const el of stageRoot.querySelectorAll('*')) {
      if (!isVisible(el)) continue;
      if (rectArea(el) >= vpArea * 0.45) {
        addAncestorsToSet(el, stageRoot, keep);
      }
    }

    return keep;
  }

  function isLikelyUI(el) {
    if (!(el instanceof Element) || !isVisible(el)) return false;

    if (isCornerWidget(el)) return true;

    const area = rectArea(el);
    const vpArea = viewportArea();
    const cs = getComputedStyle(el);
    const tag = el.tagName.toUpperCase();

    const text = (el.innerText || '').trim();
    const hasShortText = text.length > 0 && text.length < 200;

    const interactive =
      tag === 'BUTTON' ||
      tag === 'A' ||
      tag === 'INPUT' ||
      tag === 'SELECT' ||
      tag === 'TEXTAREA' ||
      el.getAttribute('role') === 'button' ||
      el.getAttribute('role') === 'dialog' ||
      el.getAttribute('role') === 'menu' ||
      el.hasAttribute('aria-label') ||
      !!el.onclick ||
      !!el.closest?.('button,a,[role="button"]');

    const overlayLike =
      ['fixed', 'absolute', 'sticky'].includes(cs.position) ||
      cs.zIndex !== 'auto';

    if (interactive && area < vpArea * 0.5) return true;
    if (overlayLike && area > 0 && area < vpArea * 0.2) return true;
    if (overlayLike && hasShortText && area < vpArea * 0.35) return true;

    const lower = text.toLowerCase();
    if (
      area < vpArea * 0.12 &&
      (
        lower.includes('google') ||
        lower.includes('terms') ||
        lower.includes('map data') ||
        lower.includes('keyboard shortcuts')
      )
    ) {
      return true;
    }

    return false;
  }

  function hideOutsideStage(stageRoot) {
    let node = stageRoot;

    while (node && node.parentElement) {
      const parent = node.parentElement;

      for (const sibling of parent.children) {
        if (sibling !== node) sibling.classList.add(CLS.HIDE);
      }

      if (parent === document.body) break;
      node = parent;
    }
  }

  function applyHiddenUi() {
    clearOurMarks();

    const canvas = findMainCanvas();
    if (!canvas) return;

    const stageRoot = findStageRoot(canvas);
    const keep = buildKeepSet(stageRoot);

    hideOutsideStage(stageRoot);

    for (const el of stageRoot.querySelectorAll('*')) {
      if (keep.has(el)) continue;
      if (isLikelyUI(el)) {
        el.classList.add(CLS.HIDE);
      }
    }

    stageRoot.classList.add(CLS.ROOT);
    document.documentElement.classList.add(CLS.LOCK);
    document.body.classList.add(CLS.LOCK);
  }

  function scheduleReapply() {
    if (!state.enabled) return;
    if (state.timer) clearTimeout(state.timer);

    state.timer = setTimeout(() => {
      state.timer = null;
      if (!state.enabled) return;
      applyHiddenUi();
    }, 100);
  }

  function startObserver() {
    if (state.observer) return;

    state.observer = new MutationObserver(() => {
      scheduleReapply();
    });

    state.observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  function stopObserver() {
    if (state.observer) {
      state.observer.disconnect();
      state.observer = null;
    }
    if (state.timer) {
      clearTimeout(state.timer);
      state.timer = null;
    }
  }

  function enable() {
    state.enabled = true;
    applyHiddenUi();
    startObserver();
  }

  function disable() {
    state.enabled = false;
    stopObserver();
    clearOurMarks();
  }

  function toggle() {
    if (state.enabled) disable();
    else enable();
  }

  window.addEventListener('keydown', (e) => {
    if (e.repeat) return;

    if (e.code !== 'KeyH') return;

    if (e.ctrlKey || e.altKey || e.metaKey) return;
    if (isEditable(document.activeElement)) return;

    e.preventDefault();
    toggle();
  }, true);
})();
