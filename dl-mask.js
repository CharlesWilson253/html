/**
 * 落地页 #dl-mask：A 定时关闭 + B「已开始」文案 + E 只表示「正在准备/已发出」。
 * 浏览器无法感知系统下载是否完成，遮罩不假装「下载完成」。
 */
(function () {
  'use strict';

  var PREPARE_MS = 1800;
  var HOLD_MS = 2800;
  var EMPTY_HIDE_MS = 1200;
  var RTL = ['ar', 'ar-eg', 'ur', 'fa'];
  var I18N = {
    en: { preparing: 'Preparing your file…', started: 'Download started', hint: 'Check the notification bar or your Downloads folder.', ok: 'OK' },
    es: { preparing: 'Preparando el archivo…', started: 'La descarga ha comenzado', hint: 'Revisa la barra de notificaciones o la carpeta Descargas.', ok: 'Aceptar' },
    de: { preparing: 'Datei wird vorbereitet…', started: 'Download gestartet', hint: 'Sieh in der Benachrichtigungsleiste oder im Download-Ordner nach.', ok: 'OK' },
    fr: { preparing: 'Préparation du fichier…', started: 'Téléchargement lancé', hint: 'Vérifiez la barre de notifications ou le dossier Téléchargements.', ok: 'OK' },
    pt: { preparing: 'Preparando o arquivo…', started: 'Download iniciado', hint: 'Veja a barra de notificações ou a pasta Downloads.', ok: 'OK' },
    it: { preparing: 'Preparazione del file…', started: 'Download avviato', hint: 'Controlla la barra delle notifiche o la cartella Download.', ok: 'OK' },
    ru: { preparing: 'Готовим файл…', started: 'Загрузка началась', hint: 'Проверьте шторку уведомлений или папку «Загрузки».', ok: 'OK' },
    ar: { preparing: 'جارٍ تجهيز الملف…', started: 'بدأ التنزيل', hint: 'تحقق من شريط الإشعارات أو مجلد التنزيلات.', ok: 'حسنًا' },
    'ar-eg': { preparing: 'بنجهّز الملف…', started: 'التنزيل بدأ', hint: 'بصّ على الإشعارات أو مجلد التنزيلات.', ok: 'تمام' },
    hi: { preparing: 'फ़ाइल तैयार हो रही है…', started: 'डाउनलोड शुरू हो गया', hint: 'नोटिफिकेशन बार या डाउनलोड फ़ोल्डर देखें।', ok: 'ठीक है' },
    bn: { preparing: 'ফাইল প্রস্তুত হচ্ছে…', started: 'ডাউনলোড শুরু হয়েছে', hint: 'নোটিফিকেশন বার বা ডাউনলোড ফোল্ডার দেখুন।', ok: 'ঠিক আছে' },
    ur: { preparing: 'فائل تیار ہو رہی ہے…', started: 'ڈاؤن لوڈ شروع ہو گیا', hint: 'نوٹیفکیشن بار یا ڈاؤن لوڈ فولڈر چیک کریں۔', ok: 'ٹھیک ہے' },
    ja: { preparing: 'ファイルを準備しています…', started: 'ダウンロードを開始しました', hint: '通知バーまたはダウンロードフォルダを確認してください。', ok: 'OK' },
    ko: { preparing: '파일을 준비하고 있습니다…', started: '다운로드가 시작되었습니다', hint: '알림 표시줄 또는 다운로드 폴더를 확인하세요.', ok: '확인' },
    'zh-tw': { preparing: '正在準備檔案…', started: '已開始下載', hint: '請查看通知列或下載資料夾。', ok: '確定' },
    'zh-cn': { preparing: '正在准备文件…', started: '已开始下载', hint: '请查看通知栏或下载文件夹。', ok: '确定' },
    id: { preparing: 'Menyiapkan berkas…', started: 'Unduhan dimulai', hint: 'Periksa bilah notifikasi atau folder Unduhan.', ok: 'OK' },
    tr: { preparing: 'Dosya hazırlanıyor…', started: 'İndirme başladı', hint: 'Bildirim çubuğunu veya İndirilenler klasörünü kontrol edin.', ok: 'Tamam' },
    th: { preparing: 'กำลังเตรียมไฟล์…', started: 'เริ่มดาวน์โหลดแล้ว', hint: 'ตรวจแถบการแจ้งเตือนหรือโฟลเดอร์ดาวน์โหลด', ok: 'ตกลง' },
    fil: { preparing: 'Inihanda ang file…', started: 'Nagsimula na ang download', hint: 'Tingnan ang notification bar o Downloads folder.', ok: 'OK' },
    pcm: { preparing: 'We dey prepare your file…', started: 'Download don start', hint: 'Check the notification bar or Downloads folder.', ok: 'OK' },
    mr: { preparing: 'फाइल तयार होत आहे…', started: 'डाउनलोड सुरू झाले', hint: 'नोटिफिकेशन बार किंवा डाउनलोड फोल्डर पाहा.', ok: 'ठीक' },
    te: { preparing: 'Preparing your file…', started: 'Download started', hint: 'Check the notification bar or your Downloads folder.', ok: 'OK' },
    ta: { preparing: 'கோப்பு தயாராகிறது…', started: 'பதிவிறக்கம் தொடங்கியது', hint: 'அறிவிப்புப் பட்டி அல்லது பதிவிறக்கக் கோப்புறையைப் பாருங்கள்.', ok: 'சரி' },
    fa: { preparing: 'در حال آماده‌سازی فایل…', started: 'دانلود شروع شد', hint: 'نوار اعلان یا پوشه دانلود را بررسی کنید.', ok: 'باشه' },
    sw: { preparing: 'Inaandaa faili…', started: 'Upakuaji umeanza', hint: 'Angalia upau wa arifa au folda ya Vipakuliwa.', ok: 'Sawa' },
    ha: { preparing: 'Ana shirya fayil…', started: 'Zazzagewa ta fara', hint: 'Duba sandar sanarwa ko babban fayil na Downloads.', ok: 'To' }
  };

  var cfg = window.__APP_CONFIG__ || {};
  var hideTimer = null;
  var prepareTimer = null;
  var cycleToken = 0;

  function mapLang(raw) {
    var s = String(raw || '').toLowerCase().replace(/_/g, '-').trim();
    if (!s) return '';
    if (I18N[s]) return s;
    if (s.indexOf('zh-cn') === 0 || s === 'zh-hans' || s === 'zh') return 'zh-cn';
    if (s.indexOf('zh-hant') === 0 || s.indexOf('zh-tw') === 0 || s.indexOf('zh-hk') === 0) return 'zh-tw';
    if (s.indexOf('ar-eg') === 0) return 'ar-eg';
    if (s === 'tl' || s.indexOf('fil') === 0) return 'fil';
    if (s.indexOf('en') === 0) return 'en';
    var short = s.split('-')[0];
    return I18N[short] ? short : '';
  }

  function detectLang() {
    var list = [];
    try {
      var q = new URLSearchParams(location.search).get('lang');
      if (q) list.push(q);
    } catch (e) {}
    if (document.documentElement && document.documentElement.lang) list.push(document.documentElement.lang);
    if (cfg.language) list.push(cfg.language);
    var navs = (navigator.languages && navigator.languages.length) ? navigator.languages : [navigator.language || ''];
    for (var i = 0; i < navs.length; i++) list.push(navs[i]);
    for (var j = 0; j < list.length; j++) {
      var mapped = mapLang(list[j]);
      if (mapped) return mapped;
    }
    return 'en';
  }

  function pack() {
    return I18N[detectLang()] || I18N.en;
  }

  function hasDownloadTarget() {
    return !!(cfg.apkUrl || (cfg.pageId && cfg.hasApk) || typeof window.installPWA === 'function');
  }

  function unlockDownload() {
    if (window.__DL_STARTED) return;
    window.__DL_LOCKED = false;
  }

  function ensureStyle() {
    if (document.getElementById('dl-mask-style')) return;
    var style = document.createElement('style');
    style.id = 'dl-mask-style';
    style.textContent = [
      '@keyframes dl-spin{to{transform:rotate(360deg)}}',
      '#dl-mask.dl-mask-ready{flex-direction:column;gap:18px;padding:28px 20px;text-align:center;}',
      '#dl-mask .dl-mask-spin{display:flex;align-items:center;justify-content:center;}',
      '#dl-mask.dl-mask-ready .dl-mask-spin>:not(:first-child){display:none!important;}',
      '#dl-mask.is-started .dl-mask-spin{display:none!important;}',
      '#dl-mask .dl-mask-copy{max-width:280px;color:#fff;font-family:Inter,system-ui,-apple-system,sans-serif;}',
      'html[dir=rtl] #dl-mask .dl-mask-copy{font-family:"Noto Sans Arabic",Inter,system-ui,sans-serif;}',
      '#dl-mask .dl-mask-icon{display:none;width:56px;height:56px;margin:0 auto 12px;border-radius:50%;align-items:center;justify-content:center;background:rgba(34,197,94,.18);color:#4ade80;}',
      '#dl-mask.is-started .dl-mask-icon{display:flex;}',
      '#dl-mask .dl-mask-title{margin:0;font-size:1.05rem;font-weight:800;line-height:1.35;}',
      '#dl-mask .dl-mask-hint{display:none;margin:8px 0 0;font-size:.86rem;line-height:1.45;color:rgba(255,255,255,.78);}',
      '#dl-mask.is-started .dl-mask-hint{display:block;}',
      '#dl-mask .dl-mask-ok{display:none;margin:16px auto 0;min-width:132px;min-height:44px;padding:0 18px;border:0;border-radius:999px;background:#fff;color:#111827;font:inherit;font-size:.95rem;font-weight:700;cursor:pointer;}',
      '#dl-mask.is-started .dl-mask-ok{display:inline-flex;align-items:center;justify-content:center;}'
    ].join('');
    document.head.appendChild(style);
  }

  function defaultSpin() {
    var wrap = document.createElement('div');
    wrap.setAttribute('aria-hidden', 'true');
    wrap.style.cssText = 'position:relative;width:96px;height:96px;display:flex;align-items:center;justify-content:center;';
    wrap.innerHTML = '<div style="position:absolute;inset:0;border-radius:50%;border:4px solid rgba(255,255,255,.18);border-top-color:#fff;animation:dl-spin .9s linear infinite;"></div>';
    return wrap;
  }

  function enhanceMask(mask) {
    if (mask.getAttribute('data-dl-mask-ready')) return;
    mask.setAttribute('data-dl-mask-ready', '1');
    mask.classList.add('dl-mask-ready');

    var spin = document.createElement('div');
    spin.className = 'dl-mask-spin';
    if (mask.childNodes.length) {
      while (mask.firstChild) spin.appendChild(mask.firstChild);
    } else {
      spin.appendChild(defaultSpin());
    }
    mask.appendChild(spin);

    var copy = document.createElement('div');
    copy.className = 'dl-mask-copy';
    copy.innerHTML = [
      '<div class="dl-mask-icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"></path></svg></div>',
      '<p class="dl-mask-title" id="dl-mask-title"></p>',
      '<p class="dl-mask-hint" id="dl-mask-hint"></p>',
      '<button type="button" class="dl-mask-ok" id="dl-mask-ok"></button>'
    ].join('');
    mask.appendChild(copy);

    mask.addEventListener('click', function (e) {
      if (!mask.classList.contains('is-started')) return;
      if (e.target && e.target.id === 'dl-mask-ok') {
        hideMask(mask);
        return;
      }
      if (e.target === mask) hideMask(mask);
    });
    var ok = document.getElementById('dl-mask-ok');
    if (ok) {
      ok.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        hideMask(mask);
      });
    }
  }

  function applyCopy(mask, mode) {
    var t = pack();
    var title = mask.querySelector('#dl-mask-title');
    var hint = mask.querySelector('#dl-mask-hint');
    var ok = mask.querySelector('#dl-mask-ok');
    if (title) title.textContent = mode === 'started' ? t.started : t.preparing;
    if (hint) hint.textContent = t.hint;
    if (ok) ok.textContent = t.ok;
    document.documentElement.setAttribute('data-dl-mask', mode);
    if (RTL.indexOf(detectLang()) >= 0) {
      mask.setAttribute('dir', 'rtl');
    } else {
      mask.setAttribute('dir', 'ltr');
    }
  }

  function clearTimers() {
    if (prepareTimer) { clearTimeout(prepareTimer); prepareTimer = null; }
    if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
  }

  function hideMask(mask) {
    cycleToken += 1;
    clearTimers();
    mask.classList.remove('show', 'is-preparing', 'is-started');
    unlockDownload();
  }

  function showStarted(mask, token) {
    if (token !== cycleToken) return;
    mask.classList.remove('is-preparing');
    mask.classList.add('is-started');
    applyCopy(mask, 'started');
    unlockDownload();
    hideTimer = setTimeout(function () {
      if (token !== cycleToken) return;
      hideMask(mask);
    }, HOLD_MS);
  }

  function startCycle(mask) {
    clearTimers();
    cycleToken += 1;
    var token = cycleToken;
    mask.classList.add('show', 'is-preparing');
    mask.classList.remove('is-started');
    applyCopy(mask, 'preparing');

    if (!hasDownloadTarget()) {
      prepareTimer = setTimeout(function () {
        if (token !== cycleToken) return;
        hideMask(mask);
      }, EMPTY_HIDE_MS);
      return;
    }

    prepareTimer = setTimeout(function () {
      showStarted(mask, token);
    }, PREPARE_MS);
  }

  function watch(mask) {
    var mo = new MutationObserver(function () {
      if (!mask.classList.contains('show')) return;
      if (mask.classList.contains('is-preparing') || mask.classList.contains('is-started')) return;
      startCycle(mask);
    });
    mo.observe(mask, { attributes: true, attributeFilter: ['class'] });
    if (mask.classList.contains('show')) startCycle(mask);
  }

  function boot() {
    ensureStyle();
    var mask = document.getElementById('dl-mask');
    if (!mask) return;
    enhanceMask(mask);
    watch(mask);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
