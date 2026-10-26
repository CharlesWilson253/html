/**
 * 落地页门禁：浏览器指纹 + 真机检测
 * 仅允许真实 Android 手机；拦截 PC / iOS / 爬虫 / 无头浏览器
 * 后台预览（__APP_CONFIG__.isPreview）跳过
 */
(function () {
  'use strict';

  var STYLE_ID = '_mg_hide';

  function cfg() {
    return window.__APP_CONFIG__ || {};
  }

  function hidePage() {
    if (document.getElementById(STYLE_ID)) return;
    var s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = 'html{visibility:hidden!important;background:#fff!important}body{opacity:0!important}';
    (document.head || document.documentElement).appendChild(s);
  }

  function showPage() {
    var s = document.getElementById(STYLE_ID);
    if (s) s.parentNode.removeChild(s);
    try { document.documentElement.style.visibility = ''; } catch (e) {}
  }

  function blankPage() {
    try {
      document.open();
      document.write('<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="robots" content="noindex,nofollow"><title>404 Not Found</title></head><body style="margin:0;background:#fff;font-family:sans-serif;color:#333;padding:40px;text-align:center"><h1>404 Not Found</h1></body></html>');
      document.close();
    } catch (e) {
      try {
        document.documentElement.innerHTML = '<head><meta charset="utf-8"><title>404</title></head><body></body>';
      } catch (e2) {}
    }
  }

  function ua() {
    return String(navigator.userAgent || '');
  }

  function ual() {
    return ua().toLowerCase();
  }

  function scoreFingerprint() {
    var score = 0;
    var reasons = [];
    var u = ual();
    var platform = String(navigator.platform || '');
    var vendor = String(navigator.vendor || '');

    // —— 硬性拦截 ——
    if (navigator.webdriver === true) {
      return { ok: false, reason: 'webdriver' };
    }
    if (
      window.callPhantom ||
      window._phantom ||
      window.__nightmare ||
      window.domAutomation ||
      window.domAutomationController ||
      window._Selenium_IDE_Recorder ||
      document.__selenium_unwrapped ||
      document.__webdriver_evaluate ||
      document.__driver_evaluate
    ) {
      return { ok: false, reason: 'automation' };
    }
    if (/headlesschrome|phantomjs|selenium|puppeteer|playwright|webdriver|slimerjs|electron/i.test(u)) {
      return { ok: false, reason: 'headless_ua' };
    }
    if (/bot|crawl|spider|scrapy|curl\/|wget|python-requests|go-http-client|java\/|libwww|httpclient|okhttp|axios|node-fetch|postman|insomnia/i.test(u)) {
      return { ok: false, reason: 'bot_ua' };
    }

    // iOS / iPadOS（含桌面模式伪装）
    if (/iphone|ipod|ipad/.test(u) || /iphone|ipad|ipod/i.test(platform)) {
      return { ok: false, reason: 'ios' };
    }
    if (platform === 'MacIntel' && (navigator.maxTouchPoints || 0) > 1) {
      return { ok: false, reason: 'ipados' };
    }
    if (/mac os x/.test(u) && !/android/.test(u) && (navigator.maxTouchPoints || 0) > 1) {
      return { ok: false, reason: 'ios_desktop_ua' };
    }

    // 桌面系统
    if (/windows nt|win64|wow64|macintosh|mac os x|cros|linux x86_64|x11/i.test(u) && !/android|harmonyos/.test(u)) {
      return { ok: false, reason: 'desktop_os' };
    }

    // 必须 Android / HarmonyOS 手机
    if (!/android|harmonyos/.test(u)) {
      return { ok: false, reason: 'not_android' };
    }
    if (/tablet|\bpad\b|sm-t|tab(?!s)/i.test(u) && !/mobile/i.test(u)) {
      return { ok: false, reason: 'tablet' };
    }
    // 多数手机 UA 含 Mobile；无 Mobile 的 Android 多半是平板/模拟器
    if (/android/.test(u) && !/mobile/.test(u) && !/harmonyos/.test(u)) {
      return { ok: false, reason: 'android_no_mobile' };
    }

    // 触摸能力（真机必备）
    var touchPoints = navigator.maxTouchPoints || navigator.msMaxTouchPoints || 0;
    var hasTouch = ('ontouchstart' in window) || touchPoints > 0;
    if (!hasTouch) {
      return { ok: false, reason: 'no_touch' };
    }
    if (touchPoints < 1) {
      score -= 2;
      reasons.push('low_touch');
    } else {
      score += 2;
    }

    // 屏幕尺寸像手机
    var w = Math.min(screen.width || 0, screen.height || 0);
    var h = Math.max(screen.width || 0, screen.height || 0);
    if (w < 280 || h < 480 || w > 700) {
      score -= 3;
      reasons.push('screen');
    } else {
      score += 2;
    }

    // devicePixelRatio 真机常见 1.5~4
    var dpr = window.devicePixelRatio || 1;
    if (dpr < 1.2 || dpr > 4.5) {
      score -= 1;
      reasons.push('dpr');
    } else {
      score += 1;
    }

    // languages
    if (!navigator.languages || navigator.languages.length === 0) {
      score -= 2;
      reasons.push('languages');
    } else {
      score += 1;
    }

    // 无头常见：plugins 异常 + chrome 缺失组合（仅作软分）
    try {
      var pluginsLen = navigator.plugins ? navigator.plugins.length : -1;
      if (pluginsLen === 0 && !window.chrome && /chrome|crios|android/.test(u)) {
        // Android Chrome 常 plugins=0，不单独判死
        score += 0;
      }
    } catch (e) {}

    // WebGL 渲染器探测（无头/虚拟机常见 SwiftShader / llvmpipe）
    try {
      var canvas = document.createElement('canvas');
      var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (gl) {
        var dbg = gl.getExtension('WEBGL_debug_renderer_info');
        if (dbg) {
          var renderer = String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) || '').toLowerCase();
          if (/swiftshader|llvmpipe|virtualbox|vmware|softwar/i.test(renderer)) {
            return { ok: false, reason: 'virtual_gpu' };
          }
          if (renderer) score += 1;
        }
      } else {
        score -= 1;
        reasons.push('no_webgl');
      }
    } catch (e) {
      score -= 1;
    }

    // Canvas 指纹：全空/异常视为可疑
    try {
      var c2 = document.createElement('canvas');
      c2.width = 120;
      c2.height = 40;
      var ctx = c2.getContext('2d');
      if (ctx) {
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillStyle = '#f60';
        ctx.fillRect(0, 0, 120, 40);
        ctx.fillStyle = '#069';
        ctx.fillText('fp:' + platform + vendor, 2, 2);
        var data = c2.toDataURL();
        if (!data || data.length < 100) {
          score -= 2;
          reasons.push('canvas');
        } else {
          score += 1;
        }
      }
    } catch (e) {
      score -= 1;
    }

    // 连接信息（部分真机有）
    try {
      var conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      if (conn && (conn.effectiveType || conn.type)) score += 1;
    } catch (e) {}

    // 时间与时区（无头脚本常缺）
    try {
      if (typeof Intl !== 'undefined' && Intl.DateTimeFormat) {
        var tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (tz) score += 1;
        else score -= 1;
      }
    } catch (e) {}

    // outer 尺寸为 0 常见于无头
    if ((window.outerWidth || 0) === 0 && (window.outerHeight || 0) === 0) {
      score -= 2;
      reasons.push('outer_zero');
    }

    if (score < 2) {
      return { ok: false, reason: 'low_score:' + score + ':' + reasons.join(',') };
    }
    return { ok: true, score: score };
  }

  function run() {
    if (cfg().isPreview === true || cfg().skipMobileGate === true) {
      showPage();
      return;
    }

    hidePage();
    var result = scoreFingerprint();
    if (!result.ok) {
      blankPage();
      return;
    }
    showPage();
  }

  // 尽早隐藏，减少闪屏
  try { hidePage(); } catch (e) {}

  if (document.readyState === 'loading') {
    // 配置脚本在 head 里，等 DOM 解析到可执行时再判；
    // 若本脚本在 __APP_CONFIG__ 之前，用微任务/下一帧重试一次
    run();
    if (!(cfg().isPreview || cfg().skipMobileGate) && !document.body) {
      setTimeout(run, 0);
    }
  } else {
    run();
  }

  // 配置可能稍后注入：再兜底一次
  setTimeout(function () {
    if (cfg().isPreview === true || cfg().skipMobileGate === true) {
      showPage();
    }
  }, 50);
})();
