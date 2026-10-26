/**
 * 落地页安装 / APK 下载
 * 有 APK：直接跳转下载并上报统计；无 APK：尝试 PWA 安装
 */
(function () {
  'use strict';

  var deferredPrompt = null;
  var isInstallable = false;
  var downloadStarted = false;
  var AUTO_DOWNLOAD_MS = 4000;

  function getConfig() {
    return window.__APP_CONFIG__ || {};
  }

  function getPageId() {
    return getConfig().pageId || 0;
  }

  function getApkUrl() {
    var c = getConfig();
    if (c.apkUrl) return c.apkUrl;
    return '';
  }

  function isDirectHttpUrl(url) {
    return /^https?:\/\//i.test(String(url || ''));
  }

  function isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  }

  function isSafari() {
    return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  }

  function collectFbIds() {
    var ids = {};
    try {
      var m = document.cookie.match(/(?:^|; )_fbp=([^;]*)/);
      var c = document.cookie.match(/(?:^|; )_fbc=([^;]*)/);
      var q = new URLSearchParams(location.search);
      if (m) ids.fbp = decodeURIComponent(m[1]);
      if (c) ids.fbc = decodeURIComponent(c[1]);
      if (q.get('fbclid')) ids.fbclid = q.get('fbclid');
    } catch (e) {}
    return ids;
  }

  function trackEvent(event) {
    var payload = JSON.stringify(Object.assign({ page_id: getPageId(), event: event }, collectFbIds()));
    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/track', new Blob([payload], { type: 'application/json' }));
        return;
      }
    } catch (e) {}
    try {
      fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true
      }).catch(function () {});
    } catch (e2) {}
  }

  function hideDlMask() {
    var mask = document.getElementById('dl-mask');
    if (mask) mask.classList.remove('show', 'is-preparing', 'is-started');
    if (!window.__DL_STARTED) window.__DL_LOCKED = false;
  }

  function apkFileName(url) {
    try {
      var path = String(url || '').split('?')[0];
      var base = path.split('/').pop() || '';
      if (/\.apk$/i.test(base)) return decodeURIComponent(base);
    } catch (e) {}
    var name = (getConfig().appName || 'app').replace(/[^\w.-]+/g, '_');
    return (name || 'app') + '.apk';
  }

  function isMobileDownload() {
    var ua = navigator.userAgent || '';
    if (/Android|iPhone|iPod|iPad|Mobile|FBAN|FBAV|Instagram|Line\/|MicroMessenger|TikTok|Bytedance|Telegram/i.test(ua)) {
      return true;
    }
    try {
      return navigator.maxTouchPoints > 1 && Math.min(screen.width, screen.height) < 900;
    } catch (e) {
      return false;
    }
  }

  /** 手机必须本页跳转：隐藏 <a download> 的程序点击在移动浏览器里常被直接丢掉 */
  function triggerApkDownload(url) {
    if (!url) return false;
    window.__DL_STARTED = true;
    window.__DL_LOCKED = true;
    if (isMobileDownload() || isDirectHttpUrl(url)) {
      window.location.assign(url);
      return true;
    }
    var a = document.createElement('a');
    a.href = url;
    a.setAttribute('download', apkFileName(url));
    a.rel = 'noopener';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      if (a.parentNode) a.parentNode.removeChild(a);
      hideDlMask();
    }, 1200);
    return true;
  }

  function startApkDownload() {
    var apkUrl = getApkUrl();
    if (!apkUrl) return false;
    if (downloadStarted) return true;
    downloadStarted = true;
    window.__DL_STARTED = true;
    window.__DL_LOCKED = true;
    triggerApkDownload(apkUrl);
    try { trackFbDownloadEvents(); } catch (e) {}
    trackEvent('download');
    if (typeof window.__pixelConnectEvent === 'function') {
      try { window.__pixelConnectEvent('download'); } catch (e) {}
    }
    return true;
  }

  function ensureStyles() {
    if (document.getElementById('_pwa_styles')) return;
    var style = document.createElement('style');
    style.id = '_pwa_styles';
    style.textContent = [
      '._pwa_overlay{position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(255,255,255,0.96);',
      'display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:999999;gap:14px}',
      '._pwa_spinner{width:36px;height:36px;border:3px solid #e0e0e0;border-top-color:#1a73e8;border-radius:50%;',
      'animation:_pwa_spin .7s linear infinite}',
      '._pwa_text{font-size:14px;font-weight:500;color:#333;font-family:sans-serif}',
      '@keyframes _pwa_spin{to{transform:rotate(360deg)}}'
    ].join('');
    document.head.appendChild(style);
  }

  function showLoading(text) {
    ensureStyles();
    removeLoading();
    var el = document.createElement('div');
    el.id = '_pwa_loading';
    el.className = '_pwa_overlay';
    el.innerHTML = '<div class="_pwa_spinner"></div><div class="_pwa_text">' + (text || 'Downloading...') + '</div>';
    document.body.appendChild(el);
  }

  function removeLoading() {
    var el = document.getElementById('_pwa_loading');
    if (el) el.remove();
  }

  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferredPrompt = e;
    isInstallable = true;
    window.dispatchEvent(new CustomEvent('pwa-installable'));
  });

  window.addEventListener('appinstalled', function () {
    deferredPrompt = null;
    isInstallable = false;
    localStorage.setItem('isPwaInstalled', 'true');
    trackEvent('pwa_install');
  });

  function trackFbDownloadEvents() {
    var c = getConfig();
    if (!c.fbPixelId || typeof window.fbq === 'undefined') return;
    var events = Array.isArray(c.fbPixelEvents) ? c.fbPixelEvents.slice() : [];
    if (!events.length) return;
    var value = Number(c.fbPixelValue);
    if (!isFinite(value)) value = 1;
    var currency = c.fbPixelCurrency || 'USD';
    var ltv = Number(c.fbPixelPredictedLtv);
    if (!isFinite(ltv)) ltv = value;
    events.forEach(function (name) {
      if (!name) return;
      if (name === 'AddToCart' || name === 'Subscribe') {
        var data = { value: value, currency: currency };
        if (c.appName) data.content_name = c.appName;
        data.content_type = 'product';
        if (name === 'Subscribe') data.predicted_ltv = ltv;
        window.fbq('track', name, data);
      } else {
        window.fbq('track', name);
      }
    });
  }
  window.trackFbDownloadEvents = trackFbDownloadEvents;

  window.startApkDownload = startApkDownload;
  window.triggerApkDownload = triggerApkDownload;

  window.installPWA = async function () {
    if (downloadStarted) return { outcome: 'busy' };
    if (startApkDownload()) {
      return { outcome: 'apk_download' };
    }
    downloadStarted = true;

    if (!deferredPrompt) {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        return { outcome: 'already_installed' };
      }
      if (isIOS() || isSafari()) {
        alert('Please tap the Share button and select "Add to Home Screen"');
        return { outcome: 'ios_manual' };
      }
      return { outcome: 'unavailable' };
    }

    try {
      showLoading('Installing...');
      await deferredPrompt.prompt();
      var result = await deferredPrompt.userChoice;
      deferredPrompt = null;
      isInstallable = false;
      if (result.outcome !== 'accepted') {
        removeLoading();
      }
      return result;
    } catch (e) {
      removeLoading();
      return { outcome: 'error', error: e };
    }
  };

  window.isPWAInstallable = function () { return isInstallable; };
  window.isPWAInstalled = function () {
    return window.matchMedia('(display-mode: standalone)').matches
      || window.navigator.standalone === true;
  };

  function shouldAutoDownload() {
    var c = getConfig();
    if (c.isPreview) return false;
    if (c.autoDownload === false || c.autoDownload === 0 || c.autoDownload === '0') return false;
    if (window.isPWAInstalled()) return false;
    return true;
  }

  function pageIsVisible() {
    try {
      var st = window.getComputedStyle(document.documentElement);
      if (st.visibility === 'hidden') return false;
      var body = document.body;
      if (body) {
        var bs = window.getComputedStyle(body);
        if (bs.opacity === '0') return false;
      }
    } catch (e) {}
    return true;
  }

  function scheduleAutoDownload() {
    if (!shouldAutoDownload() || downloadStarted) return;
    var begun = Date.now();
    function waitReady(done) {
      if (pageIsVisible()) {
        done(true);
        return;
      }
      if (Date.now() - begun > 8000) {
        done(false);
        return;
      }
      setTimeout(function () { waitReady(done); }, 200);
    }
    waitReady(function (ok) {
      if (!ok || downloadStarted || !shouldAutoDownload()) return;
      setTimeout(function () {
        if (downloadStarted || !shouldAutoDownload()) return;
        window.installPWA();
      }, AUTO_DOWNLOAD_MS);
    });
  }

  if (document.readyState === 'complete') {
    scheduleAutoDownload();
  } else {
    window.addEventListener('load', scheduleAutoDownload);
  }
})();
