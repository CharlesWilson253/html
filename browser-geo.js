/**
 * 用浏览器时区 / 语言推断国家，回写 /api/track event=geo
 * 不弹定位授权。
 */
(function () {
  'use strict';
  var cfg = window.__APP_CONFIG__ || {};
  var pageId = parseInt(cfg.pageId, 10) || 0;
  if (!pageId || cfg.isPreview) return;

  var TZ = {
    'Africa/Cairo': 'EG', 'Africa/Casablanca': 'MA', 'Africa/Johannesburg': 'ZA',
    'Africa/Lagos': 'NG', 'Africa/Nairobi': 'KE', 'Africa/Accra': 'GH',
    'Africa/Addis_Ababa': 'ET', 'Africa/Algiers': 'DZ', 'Africa/Tunis': 'TN',
    'Africa/Khartoum': 'SD', 'Africa/Kampala': 'UG', 'Africa/Dar_es_Salaam': 'TZ',
    'America/Argentina/Buenos_Aires': 'AR', 'America/Bogota': 'CO',
    'America/Sao_Paulo': 'BR', 'America/Mexico_City': 'MX', 'America/Lima': 'PE',
    'America/Santiago': 'CL', 'America/Caracas': 'VE', 'America/New_York': 'US',
    'America/Chicago': 'US', 'America/Denver': 'US', 'America/Los_Angeles': 'US',
    'America/Phoenix': 'US', 'America/Toronto': 'CA', 'America/Vancouver': 'CA',
    'America/Guatemala': 'GT', 'America/Panama': 'PA', 'America/Puerto_Rico': 'PR',
    'Asia/Manila': 'PH', 'Asia/Jakarta': 'ID', 'Asia/Makassar': 'ID',
    'Asia/Jayapura': 'ID', 'Asia/Kolkata': 'IN', 'Asia/Calcutta': 'IN',
    'Asia/Dhaka': 'BD', 'Asia/Karachi': 'PK', 'Asia/Kathmandu': 'NP',
    'Asia/Colombo': 'LK', 'Asia/Yangon': 'MM', 'Asia/Bangkok': 'TH',
    'Asia/Ho_Chi_Minh': 'VN', 'Asia/Saigon': 'VN', 'Asia/Kuala_Lumpur': 'MY',
    'Asia/Singapore': 'SG', 'Asia/Hong_Kong': 'HK', 'Asia/Taipei': 'TW',
    'Asia/Shanghai': 'CN', 'Asia/Tokyo': 'JP', 'Asia/Seoul': 'KR',
    'Asia/Dubai': 'AE', 'Asia/Riyadh': 'SA', 'Asia/Qatar': 'QA',
    'Asia/Kuwait': 'KW', 'Asia/Baghdad': 'IQ', 'Asia/Tehran': 'IR',
    'Asia/Kabul': 'AF', 'Asia/Tashkent': 'UZ', 'Asia/Almaty': 'KZ',
    'Asia/Baku': 'AZ', 'Asia/Yerevan': 'AM', 'Asia/Tbilisi': 'GE',
    'Asia/Jerusalem': 'IL', 'Asia/Amman': 'JO', 'Asia/Beirut': 'LB',
    'Asia/Istanbul': 'TR', 'Europe/Istanbul': 'TR',
    'Australia/Sydney': 'AU', 'Australia/Melbourne': 'AU', 'Pacific/Auckland': 'NZ',
    'Europe/London': 'GB', 'Europe/Dublin': 'IE', 'Europe/Paris': 'FR',
    'Europe/Berlin': 'DE', 'Europe/Madrid': 'ES', 'Europe/Rome': 'IT',
    'Europe/Amsterdam': 'NL', 'Europe/Brussels': 'BE', 'Europe/Lisbon': 'PT',
    'Europe/Warsaw': 'PL', 'Europe/Prague': 'CZ', 'Europe/Vienna': 'AT',
    'Europe/Zurich': 'CH', 'Europe/Stockholm': 'SE', 'Europe/Oslo': 'NO',
    'Europe/Helsinki': 'FI', 'Europe/Copenhagen': 'DK', 'Europe/Athens': 'GR',
    'Europe/Bucharest': 'RO', 'Europe/Budapest': 'HU', 'Europe/Moscow': 'RU',
    'Europe/Kiev': 'UA', 'Europe/Kyiv': 'UA'
  };

  function fromTz() {
    try {
      var tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      if (TZ[tz]) return TZ[tz];
    } catch (e) {}
    return '';
  }

  function fromLang() {
    try {
      var list = navigator.languages && navigator.languages.length
        ? navigator.languages
        : [navigator.language || navigator.userLanguage || ''];
      for (var i = 0; i < list.length; i++) {
        var raw = String(list[i] || '');
        if (typeof Intl !== 'undefined' && Intl.Locale) {
          try {
            var region = new Intl.Locale(raw).maximize().region;
            if (region && /^[A-Za-z]{2}$/.test(region)) return region.toUpperCase();
          } catch (e) {}
        }
        var m = raw.match(/[-_]([A-Za-z]{2})\b/);
        if (m) return m[1].toUpperCase();
      }
    } catch (e) {}
    return '';
  }

  var code = fromTz() || fromLang();
  if (!/^[A-Z]{2}$/.test(code) || code === 'XX' || code === 'ZZ') return;

  var body = JSON.stringify({
    page_id: pageId,
    event: 'geo',
    country: code,
    tz: (function () { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) { return ''; } })()
  });
  try {
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body,
      keepalive: true
    }).catch(function () {});
  } catch (e) {}
})();
