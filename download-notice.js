/**
 * 落地页下载安全提示：仅当 __APP_CONFIG__.downloadNotice 开启时拦截下载。
 * 必须点「已了解，继续」才会真正下载；关弹框不下载。
 */
(function () {
  'use strict';
  var cfg = window.__APP_CONFIG__ || {};
  if (!cfg.downloadNotice) return;

  var RTL = ['ar', 'ar-eg', 'ur', 'fa'];
  var I18N = {
    en: { noticeClose: 'Close', noticeTitle: 'Important Safety Notice', noticeIntro: 'The download is about to start. Please read these safety notes:', noticeFlagsLabel: 'Browser warning:', noticeFlagsBody: 'The first download may be flagged as harmful because of default browser security settings. Please continue the download.', noticePermissionsLabel: 'Install permission:', noticePermissionsBody: 'If the browser or device blocks the install, allow apps from this browser source to continue.', noticeContinue: 'I understand, continue' },
    es: { noticeClose: 'Cerrar', noticeTitle: 'Aviso de seguridad importante', noticeIntro: 'La descarga está por comenzar. Ten en cuenta estas indicaciones:', noticeFlagsLabel: 'Aviso del navegador:', noticeFlagsBody: 'La primera descarga a veces se marca como dañina por la seguridad predeterminada. Continúa la descarga.', noticePermissionsLabel: 'Permiso de instalación:', noticePermissionsBody: 'Si el navegador o el dispositivo bloquean la instalación, permite instalar desde este origen para continuar.', noticeContinue: 'Entendido, continuar' },
    de: { noticeClose: 'Schließen', noticeTitle: 'Wichtiger Sicherheitshinweis', noticeIntro: 'Der Download startet gleich. Bitte beachte folgende Hinweise:', noticeFlagsLabel: 'Browser-Hinweis:', noticeFlagsBody: 'Der erste Download kann wegen der Standard-Sicherheit als schädlich markiert werden. Bitte den Download fortsetzen.', noticePermissionsLabel: 'Installationsrecht:', noticePermissionsBody: 'Wenn Browser oder Gerät die Installation blockieren, erlaube Apps von dieser Browser-Quelle.', noticeContinue: 'Verstanden, weiter' },
    fr: { noticeClose: 'Fermer', noticeTitle: 'Avis de sécurité important', noticeIntro: 'Le téléchargement va commencer. Merci de lire ces consignes :', noticeFlagsLabel: 'Alerte du navigateur :', noticeFlagsBody: 'Le premier téléchargement peut être signalé comme dangereux par la sécurité par défaut. Continuez le téléchargement.', noticePermissionsLabel: 'Autorisation d’installation :', noticePermissionsBody: 'Si le navigateur ou l’appareil bloque l’installation, autorisez les apps depuis cette source.', noticeContinue: 'J’ai compris, continuer' },
    pt: { noticeClose: 'Fechar', noticeTitle: 'Aviso importante de segurança', noticeIntro: 'O download vai começar. Observe estas dicas de segurança:', noticeFlagsLabel: 'Aviso do navegador:', noticeFlagsBody: 'O primeiro download pode ser marcado como prejudicial pelas configurações padrão. Continue o download.', noticePermissionsLabel: 'Permissão de instalação:', noticePermissionsBody: 'Se o navegador ou o aparelho bloquear a instalação, permita apps desta origem para continuar.', noticeContinue: 'Entendi, continuar' },
    it: { noticeClose: 'Chiudi', noticeTitle: 'Avviso di sicurezza importante', noticeIntro: 'Il download sta per iniziare. Leggi queste note di sicurezza:', noticeFlagsLabel: 'Avviso del browser:', noticeFlagsBody: 'Il primo download a volte viene segnalato come dannoso dalle impostazioni predefinite. Continua il download.', noticePermissionsLabel: 'Permesso di installazione:', noticePermissionsBody: 'Se il browser o il dispositivo bloccano l’installazione, consenti le app da questa origine.', noticeContinue: 'Ho capito, continua' },
    ru: { noticeClose: 'Закрыть', noticeTitle: 'Важное предупреждение', noticeIntro: 'Загрузка скоро начнётся. Обратите внимание:', noticeFlagsLabel: 'Предупреждение браузера:', noticeFlagsBody: 'Первая загрузка иногда помечается как вредоносная из‑за стандартной защиты. Продолжите загрузку.', noticePermissionsLabel: 'Разрешение на установку:', noticePermissionsBody: 'Если браузер или устройство блокируют установку, разрешите приложения из этого источника.', noticeContinue: 'Понятно, продолжить' },
    ar: { noticeClose: 'إغلاق', noticeTitle: 'تنبيه أمني مهم', noticeIntro: 'سيبدأ التنزيل قريبًا. يرجى ملاحظة هذه التنبيهات:', noticeFlagsLabel: 'تنبيه المتصفح:', noticeFlagsBody: 'قد يُعلَّم التنزيل الأول بأنه ضار بسبب إعدادات الأمان الافتراضية. يرجى متابعة التنزيل.', noticePermissionsLabel: 'إذن التثبيت:', noticePermissionsBody: 'إذا منع المتصفح أو الجهاز التثبيت، اسمح بتثبيت التطبيقات من مصدر هذا المتصفح.', noticeContinue: 'فهمت، متابعة' },
    'ar-eg': { noticeClose: 'قفل', noticeTitle: 'تنبيه أمني مهم', noticeIntro: 'التنزيل هيبدأ دلوقتي. خد بالك من التنبيهات دي:', noticeFlagsLabel: 'تنبيه المتصفح:', noticeFlagsBody: 'أول تنزيل ممكن يتعلم إنه ضار بسبب إعدادات الأمان. كمّل التنزيل.', noticePermissionsLabel: 'إذن التثبيت:', noticePermissionsBody: 'لو المتصفح أو الجهاز منع التثبيت، اسمح بتثبيت التطبيقات من المصدر ده.', noticeContinue: 'تمام، كمّل' },
    hi: { noticeClose: 'बंद करें', noticeTitle: 'महत्वपूर्ण सुरक्षा सूचना', noticeIntro: 'डाउनलोड शुरू होने वाला है। ये सुरक्षा बातें ध्यान में रखें:', noticeFlagsLabel: 'ब्राउज़र चेतावनी:', noticeFlagsBody: 'पहली बार डाउनलोड को डिफ़ॉल्ट सुरक्षा के कारण हानिकारक दिखाया जा सकता है। डाउनलोड जारी रखें।', noticePermissionsLabel: 'इंस्टॉल अनुमति:', noticePermissionsBody: 'यदि ब्राउज़र या डिवाइस इंस्टॉल रोकता है, तो इस स्रोत से ऐप इंस्टॉल करने की अनुमति दें।', noticeContinue: 'समझ गया, जारी रखें' },
    bn: { noticeClose: 'বন্ধ', noticeTitle: 'গুরুত্বপূর্ণ নিরাপত্তা নোটিশ', noticeIntro: 'ডাউনলোড শুরু হতে যাচ্ছে। এই নিরাপত্তা তথ্যগুলো দেখুন:', noticeFlagsLabel: 'ব্রাউজার সতর্কতা:', noticeFlagsBody: 'প্রথম ডাউনলোড কখনো ডিফল্ট নিরাপত্তার কারণে ক্ষতিকর বলে চিহ্নিত হতে পারে। ডাউনলোড চালিয়ে যান।', noticePermissionsLabel: 'ইনস্টল অনুমতি:', noticePermissionsBody: 'ব্রাউজার বা ডিভাইস ইনস্টল আটকালে এই উৎস থেকে অ্যাপ ইনস্টলের অনুমতি দিন।', noticeContinue: 'বুঝেছি, চালিয়ে যান' },
    ur: { noticeClose: 'بند کریں', noticeTitle: 'اہم سیکیورٹی اطلاع', noticeIntro: 'ڈاؤن لوڈ جلد شروع ہوگا۔ یہ ہدایات دیکھیں:', noticeFlagsLabel: 'براؤزر انتباہ:', noticeFlagsBody: 'پہلی بار ڈاؤن لوڈ کو ڈیفالٹ سیکیورٹی کی وجہ سے نقصان دہ قرار دیا جا سکتا ہے۔ ڈاؤن لوڈ جاری رکھیں۔', noticePermissionsLabel: 'انسٹال کی اجازت:', noticePermissionsBody: 'اگر براؤزر یا ڈیوائس انسٹال روکے تو اس ماخذ سے ایپ انسٹال کرنے دیں۔', noticeContinue: 'سمجھ گیا، جاری رکھیں' },
    ja: { noticeClose: '閉じる', noticeTitle: '重要な安全に関するお知らせ', noticeIntro: 'ダウンロードを開始します。以下の注意をご確認ください：', noticeFlagsLabel: 'ブラウザの警告：', noticeFlagsBody: '初回ダウンロードは、ブラウザの標準セキュリティにより有害と表示されることがあります。ダウンロードを続行してください。', noticePermissionsLabel: 'インストール権限：', noticePermissionsBody: 'ブラウザや端末がインストールを拒否した場合、このブラウザからのインストールを許可してください。', noticeContinue: '了解して続行' },
    ko: { noticeClose: '닫기', noticeTitle: '중요 보안 안내', noticeIntro: '다운로드가 곧 시작됩니다. 아래 안내를 확인하세요:', noticeFlagsLabel: '브라우저 경고:', noticeFlagsBody: '첫 다운로드는 기본 보안 설정 때문에 유해하다고 표시될 수 있습니다. 다운로드를 계속하세요.', noticePermissionsLabel: '설치 권한:', noticePermissionsBody: '브라우저나 기기가 설치를 막으면 이 브라우저 출처의 앱 설치를 허용하세요.', noticeContinue: '확인했습니다, 계속' },
    'zh-tw': { noticeClose: '關閉', noticeTitle: '重要安全提示', noticeIntro: '更新下載即將開始，請留意以下安全提示：', noticeFlagsLabel: '瀏覽器提示：', noticeFlagsBody: '首次下載有時可能因瀏覽器預設安全設定而被標記為有害。請繼續下載。', noticePermissionsLabel: '安裝權限：', noticePermissionsBody: '如果瀏覽器或裝置阻止安裝，請允許從此瀏覽器來源安裝應用以繼續。', noticeContinue: '已了解，繼續' },
    'zh-cn': { noticeClose: '关闭', noticeTitle: '重要安全提示', noticeIntro: '更新下载即将开始，请留意以下安全提示：', noticeFlagsLabel: '浏览器提示：', noticeFlagsBody: '首次下载有时可能因浏览器默认安全设置而被标记为有害。请继续下载。', noticePermissionsLabel: '安装权限：', noticePermissionsBody: '如果浏览器或设备阻止安装，请允许从此浏览器来源安装应用以继续。', noticeContinue: '已了解，继续' },
    id: { noticeClose: 'Tutup', noticeTitle: 'Peringatan keamanan penting', noticeIntro: 'Unduhan akan segera dimulai. Perhatikan catatan ini:', noticeFlagsLabel: 'Peringatan browser:', noticeFlagsBody: 'Unduhan pertama kadang ditandai berbahaya karena pengaturan keamanan default. Lanjutkan unduhan.', noticePermissionsLabel: 'Izin pemasangan:', noticePermissionsBody: 'Jika browser atau perangkat memblokir pemasangan, izinkan aplikasi dari sumber browser ini.', noticeContinue: 'Mengerti, lanjutkan' },
    tr: { noticeClose: 'Kapat', noticeTitle: 'Önemli güvenlik uyarısı', noticeIntro: 'İndirme başlamak üzere. Lütfen şu notları okuyun:', noticeFlagsLabel: 'Tarayıcı uyarısı:', noticeFlagsBody: 'İlk indirme, varsayılan güvenlik nedeniyle zararlı olarak işaretlenebilir. İndirmeye devam edin.', noticePermissionsLabel: 'Yükleme izni:', noticePermissionsBody: 'Tarayıcı veya cihaz yüklemeyi engellerse, bu kaynaktan uygulama yüklemeye izin verin.', noticeContinue: 'Anladım, devam et' },
    th: { noticeClose: 'ปิด', noticeTitle: 'ประกาศความปลอดภัยสำคัญ', noticeIntro: 'กำลังจะเริ่มดาวน์โหลด โปรดอ่านข้อควรระวังเหล่านี้:', noticeFlagsLabel: 'คำเตือนเบราว์เซอร์:', noticeFlagsBody: 'การดาวน์โหลดครั้งแรกอาจถูกทำเครื่องหมายว่าอันตรายจากค่าความปลอดภัยเริ่มต้น โปรดดาวน์โหลดต่อ', noticePermissionsLabel: 'สิทธิ์ติดตั้ง:', noticePermissionsBody: 'หากเบราว์เซอร์หรืออุปกรณ์บล็อกการติดตั้ง ให้อนุญาตติดตั้งแอปจากแหล่งนี้', noticeContinue: 'เข้าใจแล้ว ดำเนินการต่อ' },
    fil: { noticeClose: 'Isara', noticeTitle: 'Mahalagang paalala sa seguridad', noticeIntro: 'Magsisimula na ang download. Pakibasa ang mga paalalang ito:', noticeFlagsLabel: 'Babala ng browser:', noticeFlagsBody: 'Ang unang download ay maaaring markahan na nakakapinsala dahil sa default na seguridad. Magpatuloy sa download.', noticePermissionsLabel: 'Pahintulot sa pag-install:', noticePermissionsBody: 'Kung hahadlangan ng browser o device ang pag-install, payagan ang app mula sa source na ito.', noticeContinue: 'Naintindihan, magpatuloy' },
    pcm: { noticeClose: 'Close', noticeTitle: 'Important Safety Notice', noticeIntro: 'Download dey start. Abeg read these notes:', noticeFlagsLabel: 'Browser warning:', noticeFlagsBody: 'First download fit show as harmful because of default security. Continue the download.', noticePermissionsLabel: 'Install permission:', noticePermissionsBody: 'If browser or phone block the install, allow app from this browser source.', noticeContinue: 'I understand, continue' },
    mr: { noticeClose: 'बंद करा', noticeTitle: 'महत्त्वाची सुरक्षा सूचना', noticeIntro: 'डाउनलोड लवकरच सुरू होईल. या सूचना पाहा:', noticeFlagsLabel: 'ब्राउझर इशारा:', noticeFlagsBody: 'पहिल्या डाउनलोडला डिफॉल्ट सुरक्षेमुळे हानिकारक दाखवले जाऊ शकते. डाउनलोड सुरू ठेवा.', noticePermissionsLabel: 'इंस्टॉल परवानगी:', noticePermissionsBody: 'ब्राउझर किंवा डिव्हाइस इंस्टॉल थांबवले तर या स्रोतातून अॅप इंस्टॉल करू द्या.', noticeContinue: 'समजले, पुढे जा' },
    te: { noticeClose: 'Close', noticeTitle: 'Important Safety Notice', noticeIntro: 'The download is about to start. Please read these safety notes:', noticeFlagsLabel: 'Browser warning:', noticeFlagsBody: 'The first download may be flagged as harmful because of default browser security settings. Please continue the download.', noticePermissionsLabel: 'Install permission:', noticePermissionsBody: 'If the browser or device blocks the install, allow apps from this browser source to continue.', noticeContinue: 'I understand, continue' },
    ta: { noticeClose: 'மூடு', noticeTitle: 'முக்கிய பாதுகாப்பு அறிவிப்பு', noticeIntro: 'பதிவிறக்கம் தொடங்க உள்ளது. இந்த குறிப்புகளைப் பாருங்கள்:', noticeFlagsLabel: 'உலாவி எச்சரிக்கை:', noticeFlagsBody: 'முதல் பதிவிறக்கம் இயல்பு பாதுகாப்பால் தீங்கானது எனக் காட்டப்படலாம். பதிவிறக்கத்தைத் தொடருங்கள்.', noticePermissionsLabel: 'நிறுவல் அனுமதி:', noticePermissionsBody: 'உலாவி அல்லது சாதனம் நிறுவலைத் தடுத்தால் இந்த மூலத்திலிருந்து செயலியை அனுமதியுங்கள்.', noticeContinue: 'புரிந்தது, தொடரவும்' },
    fa: { noticeClose: 'بستن', noticeTitle: 'هشدار امنیتی مهم', noticeIntro: 'دانلود به‌زودی شروع می‌شود. این نکات را بخوانید:', noticeFlagsLabel: 'هشدار مرورگر:', noticeFlagsBody: 'اولین دانلود ممکن است به‌خاطر تنظیمات پیش‌فرض امنیتی مضر علامت بخورد. دانلود را ادامه دهید.', noticePermissionsLabel: 'مجوز نصب:', noticePermissionsBody: 'اگر مرورگر یا دستگاه نصب را مسدود کرد، نصب برنامه از این منبع را اجازه دهید.', noticeContinue: 'متوجه شدم، ادامه' },
    sw: { noticeClose: 'Funga', noticeTitle: 'Ilani muhimu ya usalama', noticeIntro: 'Upakuaji unakaribia kuanza. Soma maelezo haya:', noticeFlagsLabel: 'Onyo la kivinjari:', noticeFlagsBody: 'Upakuaji wa kwanza unaweza kuonyeshwa kuwa hatari kwa sababu ya usalama wa kawaida. Endelea kupakua.', noticePermissionsLabel: 'Ruhusa ya kusakinisha:', noticePermissionsBody: 'Kama kivinjari au kifaa kikizuia usakinishaji, ruhusu programu kutoka chanzo hiki.', noticeContinue: 'Nimeelewa, endelea' },
    ha: { noticeClose: 'Rufe', noticeTitle: 'Sanarwa mai muhimmanci', noticeIntro: 'Zazzagewa za ta fara. Karanta waɗannan gargaɗin:', noticeFlagsLabel: 'Gargadin burauza:', noticeFlagsBody: 'Zazzagewa ta farko na iya nuna cutarwa saboda tsaron tsoho. Ci gaba da zazzagewa.', noticePermissionsLabel: 'Izinin shigarwa:', noticePermissionsBody: 'Idan burauza ko na\'ura ta hana shigarwa, ba da izinin app daga wannan tushen.', noticeContinue: 'Na gane, ci gaba' }
  };

  function mapLang(raw) {
    var s = String(raw || '').toLowerCase().replace(/_/g, '-').trim();
    if (!s) return '';
    if (I18N[s]) return s;
    if (s.indexOf('zh-cn') === 0 || s === 'zh-hans' || s === 'zh') return 'zh-cn';
    if (s.indexOf('zh-hant') === 0 || s.indexOf('zh-tw') === 0 || s.indexOf('zh-hk') === 0) return 'zh-tw';
    if (s.indexOf('ar-eg') === 0) return 'ar-eg';
    if (s === 'tl' || s.indexOf('fil') === 0) return 'fil';
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

  function ensureStyle() {
    if (document.getElementById('download-notice-style')) return;
    var style = document.createElement('style');
    style.id = 'download-notice-style';
    style.textContent = [
      'html.dn-open,html.dn-open body{overflow:hidden!important;}',
      'dialog.download-notice,dialog.download-notice *,dialog.download-notice *::before,dialog.download-notice *::after{box-sizing:border-box!important;float:none!important;transform:none!important;filter:none!important;perspective:none!important;}',
      'dialog.download-notice{position:fixed!important;inset:0!important;left:0!important;right:0!important;top:0!important;bottom:0!important;width:100%!important;height:100%!important;max-width:none!important;max-height:none!important;margin:0!important;padding:16px!important;border:0!important;display:none!important;align-items:center!important;justify-content:center!important;background:rgba(15,23,42,.55)!important;color:#1f2937!important;z-index:2147483000!important;overflow:auto!important;}',
      'dialog.download-notice[open],dialog.download-notice:modal{display:flex!important;}',
      'dialog.download-notice::backdrop{background:rgba(15,23,42,.55);}',
      'dialog.download-notice .notice-card{position:relative!important;z-index:1!important;width:min(360px,100%)!important;max-width:100%!important;margin:auto!important;overflow:hidden!important;background:#fff!important;border-radius:28px!important;padding:28px 22px 22px!important;box-shadow:0 18px 50px rgba(15,23,42,.18)!important;text-align:center!important;font-family:Inter,system-ui,-apple-system,"Noto Sans TC","Noto Sans SC",sans-serif!important;}',
      'dialog.download-notice .notice-close{position:absolute!important;top:10px!important;right:10px!important;left:auto!important;width:40px!important;height:40px!important;border:0!important;border-radius:999px!important;background:transparent!important;color:#9ca3af!important;font-size:28px!important;line-height:1!important;cursor:pointer!important;padding:0!important;min-width:40px!important;min-height:40px!important;}',
      'dialog.download-notice[dir=rtl] .notice-close,html[dir=rtl] dialog.download-notice .notice-close{right:auto!important;left:10px!important;}',
      'dialog.download-notice .notice-shield{width:52px!important;height:60px!important;display:block!important;margin:8px auto 14px!important;}',
      'dialog.download-notice h2{display:block!important;margin:0 0 8px!important;padding:0!important;font-size:1.25rem!important;font-weight:800!important;line-height:1.35!important;color:#111827!important;letter-spacing:0!important;}',
      'dialog.download-notice #noticeIntro{display:block!important;margin:0 0 16px!important;padding:0!important;font-size:.92rem!important;line-height:1.55!important;color:#6b7280!important;white-space:normal!important;overflow-wrap:anywhere!important;}',
      'dialog.download-notice .notice-guidelines{display:block!important;width:auto!important;max-width:none!important;margin:0 0 20px!important;padding:4px 4px 4px 18px!important;border:0!important;border-left:4px solid #22c55e!important;list-style:disc!important;list-style-position:outside!important;text-align:left!important;color:#4b5563!important;font-size:.9rem!important;line-height:1.6!important;columns:auto!important;column-count:1!important;}',
      'dialog.download-notice[dir=rtl] .notice-guidelines,html[dir=rtl] dialog.download-notice .notice-guidelines{padding:4px 18px 4px 4px!important;border-left:0!important;border-right:4px solid #22c55e!important;text-align:right!important;}',
      'dialog.download-notice .notice-guidelines li{display:list-item!important;width:auto!important;max-width:none!important;margin:0 0 12px!important;padding:0!important;white-space:normal!important;overflow-wrap:anywhere!important;word-break:break-word!important;flex:none!important;}',
      'dialog.download-notice .notice-guidelines li:last-child{margin-bottom:0!important;}',
      'dialog.download-notice .notice-guidelines strong,dialog.download-notice .notice-guidelines span{display:inline!important;white-space:normal!important;overflow-wrap:anywhere!important;color:inherit!important;}',
      'dialog.download-notice .notice-guidelines strong{color:#111827!important;font-weight:700!important;}',
      'dialog.download-notice .notice-continue{display:block!important;width:100%!important;min-height:48px!important;margin:0!important;padding:0 16px!important;border:0!important;border-radius:999px!important;background:#22c55e!important;color:#fff!important;font:inherit!important;font-size:1rem!important;font-weight:700!important;cursor:pointer!important;line-height:1.2!important;}'
    ].join('');
    document.head.appendChild(style);
  }

  function ensureDialog() {
    var el = document.getElementById('downloadNotice');
    if (el) return el;
    ensureStyle();
    el = document.createElement('dialog');
    el.className = 'download-notice';
    el.id = 'downloadNotice';
    el.setAttribute('aria-labelledby', 'noticeTitle');
    el.setAttribute('aria-describedby', 'noticeIntro');
    el.innerHTML = ''
      + '<div class="notice-card">'
      + '<button type="button" class="notice-close" id="noticeClose" data-rw="noticeClose" data-rw-attr="aria-label" aria-label="Close">×</button>'
      + '<svg class="notice-shield" viewBox="0 0 40 46" aria-hidden="true"><path d="M20 3 35 8v14c0 10-9 17-15 20C14 39 5 32 5 22V8Z" fill="#e4e9ed" stroke="#637581" stroke-width="2"></path><path d="m20 7-11 4v11c0 8 6 14 11 17Z" fill="#d34d4d"></path><path d="m20 7 11 4v11c0 8-6 14-11 17Z" fill="#c6ced4"></path><path d="M20 7v32" stroke="#8c9aa4" stroke-width="1.5"></path></svg>'
      + '<h2 id="noticeTitle" data-rw="noticeTitle">Important Safety Notice</h2>'
      + '<p id="noticeIntro" data-rw="noticeIntro"></p>'
      + '<ul class="notice-guidelines">'
      + '<li><strong data-rw="noticeFlagsLabel"></strong> <span data-rw="noticeFlagsBody"></span></li>'
      + '<li><strong data-rw="noticePermissionsLabel"></strong> <span data-rw="noticePermissionsBody"></span></li>'
      + '</ul>'
      + '<button type="button" class="notice-continue" id="noticeContinue" data-rw="noticeContinue"></button>'
      + '</div>';
    document.body.appendChild(el);
    return el;
  }

  function applyCopy() {
    var p = pack();
    var root = document.getElementById('downloadNotice');
    if (!root) return;
    var lang = detectLang();
    root.dir = RTL.indexOf(lang) >= 0 ? 'rtl' : 'ltr';
    root.querySelectorAll('[data-rw]').forEach(function (node) {
      var key = node.getAttribute('data-rw');
      if (p[key] == null) return;
      if (node.getAttribute('data-rw-attr')) {
        node.setAttribute(node.getAttribute('data-rw-attr'), p[key]);
      } else {
        node.textContent = p[key];
      }
    });
  }

  var confirmed = false;
  var pending = false;
  var waiter = null;

  function finish(ok) {
    var dlg = document.getElementById('downloadNotice');
    if (dlg && dlg.open) {
      try { dlg.close(); } catch (e) {}
    }
    document.documentElement.classList.remove('dn-open');
    pending = false;
    var cb = waiter;
    waiter = null;
    if (ok) confirmed = true;
    if (typeof cb === 'function') cb(!!ok);
  }

  function showNotice(cb) {
    document.querySelectorAll('.lang-dropdown.open').forEach(function (el) {
      el.classList.remove('open');
    });
    document.documentElement.classList.add('dn-open');
    var dlg = ensureDialog();
    if (!dlg.__dnBound) {
      dlg.__dnBound = true;
      document.getElementById('noticeContinue').addEventListener('click', function (e) {
        e.preventDefault();
        finish(true);
      });
      document.getElementById('noticeClose').addEventListener('click', function (e) {
        e.preventDefault();
        finish(false);
      });
      dlg.addEventListener('cancel', function (e) {
        e.preventDefault();
        finish(false);
      });
      dlg.addEventListener('click', function (e) {
        if (e.target === dlg) finish(false);
      });
    }
    applyCopy();
    waiter = cb;
    pending = true;
    if (typeof dlg.showModal === 'function') dlg.showModal();
    else dlg.setAttribute('open', '');
  }

  function gate(fn, ctx, args) {
    if (typeof fn !== 'function') return;
    if (confirmed) return fn.apply(ctx, args);
    if (args[0] && typeof args[0].preventDefault === 'function') {
      args[0].preventDefault();
      args[0].stopPropagation();
    }
    if (pending) return false;
    return new Promise(function (resolve) {
      showNotice(function (ok) {
        if (!ok) {
          resolve({ outcome: 'cancelled' });
          return;
        }
        resolve(fn.apply(ctx, args));
      });
    });
  }

  function intercept(name) {
    var raw = typeof window[name] === 'function' ? window[name] : null;
    function wrapped() {
      return gate(raw, this, arguments);
    }
    wrapped.__dnWrapped = true;
    try {
      Object.defineProperty(window, name, {
        configurable: true,
        enumerable: true,
        get: function () { return raw ? wrapped : raw; },
        set: function (fn) { raw = fn; }
      });
    } catch (e) {
      if (raw) window[name] = wrapped;
    }
  }

  // 不再拦截下载：点击后直接记录并下载，避免丢掉浏览器手势导致 APK 被拦
})();
  // ==========================================
  // 【闭合逻辑】无缝调用核心与自动化执行模块
  // ==========================================

  // 1. 全局分发：将真正安全且保全手势的触发器暴露给落地页的所有 Install 按钮
  window.triggerSecureDownload = function (e) {
    // 如果有传入点击事件，优先保全手势流
    if (e && typeof e.stopPropagation === 'function') {
      e.stopPropagation();
    }

    // 封装真实的下载动作
    var executeDownload = function () {
      if (cfg.apkUrl) {
        window.location.href = cfg.apkUrl;
      } else {
        console.warn("APK URL is missing in __APP_CONFIG__");
      }
    };

    // 调用前面的 checkDownloadNotice 或 gate 检查
    if (typeof window.checkDownloadNotice === 'function') {
      window.checkDownloadNotice(executeDownload);
    } else {
      // 降级策略：如果弹窗未初始化或由于环境问题异常，直接放行下载，确保转化率第一
      executeDownload();
    }
  };

  // 2. 自动启动模块 (页面加载完成后，针对 autoDownload 的静默唤起)
  if (cfg.autoDownload) {
    var readyState = document.readyState;
    var initAuto = function () {
      setTimeout(function () {
        // 自动触发时由于没有用户物理手势，直接呼叫拦截检查，弹出多语言安全提示框
        if (typeof window.checkDownloadNotice === 'function') {
          window.checkDownloadNotice(function () {
            if (cfg.apkUrl) window.location.href = cfg.apkUrl;
          });
        }
      }, 1200); // 1.2秒延迟，在视觉上最符合用户心理预期
    };

    if (readyState === 'interactive' || readyState === 'complete') {
      initAuto();
    } else {
      document.addEventListener('DOMContentLoaded', initAuto);
    }
  }
})(); // 彻底闭合自执行匿名函数 (IIFE)
