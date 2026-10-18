/* Webhjerte Growth — client acquisition dashboard.
   Plain JS, no build step. Data lives in localStorage; export/import JSON & CSV. */
(() => {
  'use strict';

  // ---------------------------------------------------------------------------
  // Constants
  // ---------------------------------------------------------------------------
  const STORE_KEY = 'webhjerte-growth-v1';
  const SERIES = 8;

  const KINDS = {
    ads:      { label: 'Платна реклама',   fields: ['spend', 'impressions', 'clicks', 'leads', 'meetings'] },
    outreach: { label: 'Холодні листи',    fields: ['emails', 'replies', 'leads', 'meetings', 'spend'] },
    organic:  { label: 'Органічні пости',  fields: ['posts', 'impressions', 'clicks', 'leads', 'meetings', 'spend'] },
    other:    { label: 'Інше',             fields: ['spend', 'impressions', 'clicks', 'leads', 'meetings'] },
  };

  const FIELDS = {
    spend:       { label: 'Витрати', hint: 'бюджет, інструменти, буст', money: true },
    impressions: { label: 'Покази / охоплення' },
    clicks:      { label: 'Кліки' },
    emails:      { label: 'Листів надіслано' },
    replies:     { label: 'Відповідей' },
    posts:       { label: 'Постів опубліковано' },
    leads:       { label: 'Ліди / заявки' },
    meetings:    { label: 'Зустрічі / дзвінки' },
  };
  const METRIC_KEYS = Object.keys(FIELDS);

  const STATUSES = [
    ['lead', 'Лід'],
    ['meeting', 'Зустріч'],
    ['proposal', 'Пропозиція'],
    ['won', 'Клієнт'],
    ['lost', 'Втрачено'],
  ];
  const STATUS_LABEL = Object.fromEntries(STATUSES);

  const PERIODS = [
    ['7d', '7 днів'],
    ['30d', '30 днів'],
    ['90d', '90 днів'],
    ['mtd', 'Цей місяць'],
    ['lm', 'Минулий місяць'],
    ['ytd', 'Цей рік'],
    ['all', 'Весь час'],
  ];

  const CURRENCIES = ['DKK', 'NOK', 'SEK', 'EUR', 'USD', 'UAH', 'PLN', 'GBP'];
  const BRAND_PRESETS = ['#E63950', '#D7263D', '#FF5A5F', '#F25C54', '#C2185B', '#14161F'];

  const DEFAULT_CHANNELS = [
    { id: 'google_ads', name: 'Google Ads',      kind: 'ads',      color: 0 },
    { id: 'meta_ads',   name: 'Meta Ads',        kind: 'ads',      color: 6 },
    { id: 'cold_mail',  name: 'Cold mail',       kind: 'outreach', color: 1 },
    { id: 'linkedin',   name: 'LinkedIn пости',  kind: 'organic',  color: 2 },
    { id: 'instagram',  name: 'Instagram пости', kind: 'organic',  color: 4 },
    { id: 'facebook',   name: 'Facebook пости',  kind: 'organic',  color: 3 },
  ];

  const ICONS = {
    overview: '<path d="M3 13h8V3H3zM13 21h8V11h-8zM3 21h8v-6H3zM13 3v6h8V3z"/>',
    channels: '<path d="M4 11a9 9 0 0 1 9 9M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1.5"/>',
    journal:  '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
    clients:  '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
    plus:     '<path d="M12 5v14M5 12h14"/>',
    x:        '<path d="M18 6 6 18M6 6l12 12"/>',
    contrast: '<circle cx="12" cy="12" r="9"/><path d="M12 3v18a9 9 0 0 0 0-18z" fill="currentColor"/>',
    wallet:   '<path d="M20 7H5a2 2 0 0 1 0-4h13v4"/><path d="M3 5v14a2 2 0 0 0 2 2h15V7"/><path d="M16 14h.01"/>',
    coins:    '<circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18M7 6h1v4M16.71 13.88l.7.71-2.82 2.82"/>',
    trend:    '<path d="m22 7-8.5 8.5-5-5L2 17"/><path d="M16 7h6v6"/>',
    target:   '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
    user:     '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    cursor:   '<path d="m3 3 7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/>',
    mail:     '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
    eye:      '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
    upload:   '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>',
    search:   '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>',
  };

  const NAV = [
    ['overview', 'Огляд', 'overview'],
    ['channels', 'Канали', 'channels'],
    ['journal', 'Журнал', 'journal'],
    ['clients', 'Клієнти', 'clients'],
    ['settings', 'Налаштування', 'settings'],
  ];

  // ---------------------------------------------------------------------------
  // Utils
  // ---------------------------------------------------------------------------
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const icon = (name) => `<span data-icon aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONS[name] || ''}</svg></span>`;
  const num = (v) => {
    if (v === null || v === undefined || v === '') return 0;
    const n = parseFloat(String(v).replace(/\s| /g, '').replace(',', '.'));
    return Number.isFinite(n) ? n : 0;
  };
  const div = (a, b) => (b ? a / b : null);

  const pad = (n) => String(n).padStart(2, '0');
  const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const fromISO = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
  const today = () => toISO(new Date());
  const addDays = (iso, n) => { const d = fromISO(iso); d.setDate(d.getDate() + n); return toISO(d); };
  const daysBetween = (a, b) => Math.round((fromISO(b) - fromISO(a)) / 86400000);
  const startOfWeek = (iso) => { const d = fromISO(iso); const wd = (d.getDay() + 6) % 7; d.setDate(d.getDate() - wd); return toISO(d); };

  const fmtInt = new Intl.NumberFormat('uk-UA', { maximumFractionDigits: 0 });
  const fmtDec = new Intl.NumberFormat('uk-UA', { maximumFractionDigits: 1 });
  const fmtCompact = new Intl.NumberFormat('uk-UA', { notation: 'compact', maximumFractionDigits: 1 });
  const fmtDate = new Intl.DateTimeFormat('uk-UA', { day: 'numeric', month: 'short' });
  const fmtDateLong = new Intl.DateTimeFormat('uk-UA', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
  const fmtMonth = new Intl.DateTimeFormat('uk-UA', { month: 'short', year: '2-digit' });

  let moneyFmt, moneyFmtCompact;
  function setCurrency(cur) {
    try {
      moneyFmt = new Intl.NumberFormat('uk-UA', { style: 'currency', currency: cur, maximumFractionDigits: 0 });
      moneyFmtCompact = new Intl.NumberFormat('uk-UA', { style: 'currency', currency: cur, notation: 'compact', maximumFractionDigits: 1 });
    } catch {
      moneyFmt = moneyFmtCompact = new Intl.NumberFormat('uk-UA', { maximumFractionDigits: 0 });
    }
  }
  const money = (v) => (v === null || v === undefined ? '—' : moneyFmt.format(v));
  const moneyPrecise = (v) => {
    if (v === null || v === undefined) return '—';
    if (Math.abs(v) >= 100) return moneyFmt.format(v);
    return new Intl.NumberFormat('uk-UA', { style: 'currency', currency: state.settings.currency, maximumFractionDigits: 2 }).format(v);
  };
  const int = (v) => (v === null || v === undefined ? '—' : fmtInt.format(v));
  const pct = (v, digits = 1) => (v === null || v === undefined ? '—' : `${(v * 100).toFixed(digits).replace('.', ',')}%`);
  const ratio = (v) => (v === null || v === undefined ? '—' : `${v.toFixed(2).replace('.', ',')}×`);

  function readableInk(hex) {
    const h = hex.replace('#', '');
    const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
    const L = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return L > 0.4 ? '#14161F' : '#FFFFFF';
  }
  const cssVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const seriesColor = (slot) => cssVar(`--s${(slot % SERIES) + 1}`);

  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------
  function defaultState() {
    return {
      version: 1,
      settings: {
        business: 'Webhjerte',
        currency: 'DKK',
        brand: '#E63950',
        theme: 'auto',
        goals: { budget: 0, revenue: 0, emailsPerDay: 30, leads: 0 },
      },
      channels: DEFAULT_CHANNELS.map((c) => ({ ...c, archived: false })),
      entries: [],
      deals: [],
      ui: { period: '30d', channel: 'all', chartBucket: 'auto', sort: { key: 'spend', dir: -1 } },
    };
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (!raw) return defaultState();
      return normalize(JSON.parse(raw));
    } catch {
      return defaultState();
    }
  }
  function normalize(data) {
    const base = defaultState();
    const s = { ...base, ...data };
    s.settings = { ...base.settings, ...(data.settings || {}) };
    s.settings.goals = { ...base.settings.goals, ...((data.settings || {}).goals || {}) };
    s.ui = { ...base.ui, ...(data.ui || {}) };
    s.channels = Array.isArray(data.channels) && data.channels.length ? data.channels : base.channels;
    s.entries = Array.isArray(data.entries) ? data.entries : [];
    s.deals = Array.isArray(data.deals) ? data.deals : [];
    return s;
  }
  let state = load();
  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); }
    catch { toast('Не вдалося зберегти дані в браузері'); }
  }

  const channelById = (id) => state.channels.find((c) => c.id === id);
  const activeChannels = () => state.channels.filter((c) => !c.archived);
  const chColor = (ch) => seriesColor(ch ? ch.color : 7);

  // ---------------------------------------------------------------------------
  // Periods & aggregation
  // ---------------------------------------------------------------------------
  function earliestDate() {
    let min = today();
    for (const e of state.entries) if (e.date < min) min = e.date;
    for (const d of state.deals) if (d.date < min) min = d.date;
    return min;
  }

  function periodRange(key) {
    const t = today();
    const d = fromISO(t);
    switch (key) {
      case '7d': return { from: addDays(t, -6), to: t };
      case '30d': return { from: addDays(t, -29), to: t };
      case '90d': return { from: addDays(t, -89), to: t };
      case 'mtd': return { from: toISO(new Date(d.getFullYear(), d.getMonth(), 1)), to: t };
      case 'lm': return { from: toISO(new Date(d.getFullYear(), d.getMonth() - 1, 1)), to: toISO(new Date(d.getFullYear(), d.getMonth(), 0)) };
      case 'ytd': return { from: toISO(new Date(d.getFullYear(), 0, 1)), to: t };
      default: return { from: earliestDate(), to: t };
    }
  }
  function previousRange({ from, to }) {
    const len = daysBetween(from, to) + 1;
    return { from: addDays(from, -len), to: addDays(from, -1) };
  }

  function emptyTotals() {
    const t = { revenue: 0, clients: 0, pipeline: 0 };
    METRIC_KEYS.forEach((k) => (t[k] = 0));
    return t;
  }
  function derive(t) {
    return {
      ...t,
      ctr: div(t.clicks, t.impressions),
      // cost metrics are meaningless for free channels — show "—" instead of 0
      cpc: t.spend ? div(t.spend, t.clicks) : null,
      cpl: t.spend ? div(t.spend, t.leads) : null,
      cac: t.spend ? div(t.spend, t.clients) : null,
      roas: div(t.revenue, t.spend),
      profit: t.revenue - t.spend,
      roi: div(t.revenue - t.spend, t.spend),
      replyRate: div(t.replies, t.emails),
      leadToClient: div(t.clients, t.leads),
      clickToLead: div(t.leads, t.clicks),
    };
  }

  /** Aggregate entries + won deals within range (inclusive), optional channel filter. */
  function aggregate({ from, to }, channelId = 'all') {
    const total = emptyTotals();
    const byChannel = {};
    const take = (id) => (byChannel[id] ||= emptyTotals());
    for (const e of state.entries) {
      if (e.date < from || e.date > to) continue;
      if (channelId !== 'all' && e.channelId !== channelId) continue;
      const c = take(e.channelId);
      for (const k of METRIC_KEYS) { const v = num(e[k]); total[k] += v; c[k] += v; }
    }
    for (const d of state.deals) {
      if (d.date < from || d.date > to) continue;
      if (channelId !== 'all' && d.channelId !== channelId) continue;
      const c = take(d.channelId);
      if (d.status === 'won') {
        total.revenue += num(d.value); c.revenue += num(d.value);
        total.clients += 1; c.clients += 1;
      } else if (d.status !== 'lost') {
        total.pipeline += num(d.value); c.pipeline += num(d.value);
      }
    }
    const out = { total: derive(total), byChannel: {} };
    for (const [id, t] of Object.entries(byChannel)) out.byChannel[id] = derive(t);
    return out;
  }

  function pickBucket({ from, to }) {
    const pref = state.ui.chartBucket;
    if (pref && pref !== 'auto') return pref;
    const len = daysBetween(from, to) + 1;
    if (len <= 35) return 'day';
    if (len <= 200) return 'week';
    return 'month';
  }
  const bucketKey = (iso, bucket) => (bucket === 'day' ? iso : bucket === 'week' ? startOfWeek(iso) : iso.slice(0, 7) + '-01');
  function bucketLabel(key, bucket) {
    const d = fromISO(key);
    if (bucket === 'month') return fmtMonth.format(d);
    return fmtDate.format(d);
  }
  function timeSeries(range, channelId, bucket) {
    const keys = [];
    let cur = bucketKey(range.from, bucket);
    const end = bucketKey(range.to, bucket);
    let guard = 0;
    while (cur <= end && guard++ < 2000) {
      keys.push(cur);
      if (bucket === 'day') cur = addDays(cur, 1);
      else if (bucket === 'week') cur = addDays(cur, 7);
      else { const d = fromISO(cur); cur = toISO(new Date(d.getFullYear(), d.getMonth() + 1, 1)); }
    }
    const map = Object.fromEntries(keys.map((k) => [k, { spend: 0, revenue: 0, leads: 0, emails: 0, clicks: 0 }]));
    for (const e of state.entries) {
      if (e.date < range.from || e.date > range.to) continue;
      if (channelId !== 'all' && e.channelId !== channelId) continue;
      const b = map[bucketKey(e.date, bucket)]; if (!b) continue;
      b.spend += num(e.spend); b.leads += num(e.leads); b.emails += num(e.emails); b.clicks += num(e.clicks);
    }
    for (const d of state.deals) {
      if (d.status !== 'won' || d.date < range.from || d.date > range.to) continue;
      if (channelId !== 'all' && d.channelId !== channelId) continue;
      const b = map[bucketKey(d.date, bucket)]; if (b) b.revenue += num(d.value);
    }
    return { keys, labels: keys.map((k) => bucketLabel(k, bucket)), data: keys.map((k) => map[k]) };
  }

  // ---------------------------------------------------------------------------
  // Charts (Chart.js)
  // ---------------------------------------------------------------------------
  const charts = [];
  function destroyCharts() { while (charts.length) charts.pop().destroy(); }
  function chartTheme() {
    return {
      ink: cssVar('--ink'), ink2: cssVar('--ink-2'), muted: cssVar('--muted'),
      grid: cssVar('--grid'), surface: cssVar('--surface'), line: cssVar('--line-strong'),
    };
  }
  function baseOptions(th, { moneyAxis = false, indexAxis = 'x' } = {}) {
    const fmtTick = (v) => (moneyAxis ? moneyFmtCompact.format(v) : fmtCompact.format(v));
    const valueAxis = {
      beginAtZero: true, border: { display: false },
      grid: { color: th.grid, drawTicks: false },
      ticks: { color: th.muted, font: { size: 11 }, padding: 8, maxTicksLimit: 5, callback: fmtTick },
    };
    const catAxis = {
      border: { color: th.line }, grid: { display: false },
      ticks: { color: th.muted, font: { size: 11 }, maxRotation: 0, autoSkipPadding: 12 },
    };
    return {
      responsive: true, maintainAspectRatio: false, indexAxis,
      animation: { duration: 350 },
      interaction: { mode: 'index', intersect: false },
      layout: { padding: { top: 4 } },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: th.ink, titleColor: th.surface, bodyColor: th.surface,
          padding: 10, cornerRadius: 10, boxPadding: 4, usePointStyle: true,
          titleFont: { weight: '700' },
        },
      },
      scales: indexAxis === 'x' ? { x: catAxis, y: valueAxis } : { y: catAxis, x: valueAxis },
    };
  }

  function renderSpendRevenueChart(canvas, series) {
    if (!window.Chart || !canvas) return;
    const th = chartTheme();
    const opts = baseOptions(th, { moneyAxis: true });
    opts.plugins.tooltip.callbacks = { label: (c) => ` ${c.dataset.label}: ${money(c.parsed.y)}` };
    const ds = (label, key, color) => ({
      label, data: series.data.map((d) => d[key]), backgroundColor: color,
      borderRadius: 4, borderSkipped: 'start', maxBarThickness: 22, categoryPercentage: 0.72, barPercentage: 0.9,
      borderColor: th.surface, borderWidth: { left: 1, right: 1 },
    });
    charts.push(new Chart(canvas, {
      type: 'bar',
      data: { labels: series.labels, datasets: [ds('Витрати', 'spend', seriesColor(0)), ds('Дохід', 'revenue', seriesColor(2))] },
      options: opts,
    }));
  }

  function renderLeadsByChannel(canvas, rows) {
    if (!window.Chart || !canvas) return;
    const th = chartTheme();
    const opts = baseOptions(th, { indexAxis: 'y' });
    opts.interaction = { mode: 'nearest', axis: 'y', intersect: false };
    opts.plugins.tooltip.callbacks = {
      label: (c) => {
        const r = rows[c.dataIndex];
        return [` Ліди: ${int(r.t.leads)}`, ` Клієнти: ${int(r.t.clients)}`, ` CPL: ${moneyPrecise(r.t.cpl)}`];
      },
    };
    charts.push(new Chart(canvas, {
      type: 'bar',
      data: {
        labels: rows.map((r) => r.ch.name),
        datasets: [{
          label: 'Ліди', data: rows.map((r) => r.t.leads),
          backgroundColor: rows.map((r) => chColor(r.ch)), borderRadius: 4, borderSkipped: 'start', maxBarThickness: 22,
        }],
      },
      options: opts,
    }));
  }

  function renderEmailsChart(canvas, series, goal) {
    if (!window.Chart || !canvas) return;
    const th = chartTheme();
    const opts = baseOptions(th);
    opts.plugins.tooltip.callbacks = { label: (c) => ` ${c.dataset.label}: ${int(c.parsed.y)}` };
    const datasets = [{
      type: 'bar', label: 'Листів', data: series.data.map((d) => d.emails), backgroundColor: seriesColor(1),
      borderRadius: 4, borderSkipped: 'start', maxBarThickness: 18,
    }];
    if (goal && pickBucket(currentRange()) === 'day') {
      datasets.push({
        type: 'line', label: 'Ціль', data: series.data.map(() => goal), borderColor: th.muted,
        borderDash: [4, 4], borderWidth: 1.5, pointRadius: 0, pointHoverRadius: 0,
      });
    }
    charts.push(new Chart(canvas, { type: 'bar', data: { labels: series.labels, datasets }, options: opts }));
  }

  function sparkline(values, color) {
    const w = 240, h = 44, n = values.length;
    if (!n || values.every((v) => !v)) return `<svg class="spark" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none"><line x1="0" x2="${w}" y1="${h - 2}" y2="${h - 2}" stroke="var(--grid)" stroke-width="2"/></svg>`;
    const max = Math.max(...values) || 1;
    const pts = values.map((v, i) => [n === 1 ? w / 2 : (i / (n - 1)) * w, h - 3 - (v / max) * (h - 8)]);
    const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
    return `<svg class="spark" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true">
      <path d="${d} L${w},${h} L0,${h} Z" fill="${color}" opacity=".12"/>
      <path d="${d}" fill="none" stroke="${color}" stroke-width="2" vector-effect="non-scaling-stroke" stroke-linejoin="round"/>
    </svg>`;
  }

  // ---------------------------------------------------------------------------
  // Shared UI bits
  // ---------------------------------------------------------------------------
  const currentRange = () => periodRange(state.ui.period);

  function periodChips() {
    return `<div class="chips" role="group" aria-label="Період">${PERIODS.map(([k, l]) =>
      `<button class="chip" data-action="period" data-value="${k}" aria-pressed="${state.ui.period === k}">${l}</button>`).join('')}</div>`;
  }
  function channelSelect(value, { all = true, action = 'filter-channel', cls = 'select select-sm' } = {}) {
    return `<select class="${cls}" data-change="${action}" aria-label="Канал">
      ${all ? `<option value="all">Усі канали</option>` : ''}
      ${state.channels.map((c) => `<option value="${esc(c.id)}" ${c.id === value ? 'selected' : ''}>${esc(c.name)}${c.archived ? ' (архів)' : ''}</option>`).join('')}
    </select>`;
  }
  function rangeText(r) { return `${fmtDate.format(fromISO(r.from))} — ${fmtDate.format(fromISO(r.to))} ${fromISO(r.to).getFullYear()}`; }

  function delta(cur, prev, { invert = false, neutral = false } = {}) {
    if (cur === null || prev === null || prev === undefined || cur === undefined) return '';
    if (!prev) return cur ? `<span class="delta">нове</span>` : '';
    const d = (cur - prev) / Math.abs(prev);
    if (Math.abs(d) < 0.005) return `<span class="delta">0%</span>`;
    const up = d > 0;
    const good = neutral ? '' : (up !== invert ? 'good' : 'bad');
    return `<span class="delta ${good}" title="порівняно з попереднім періодом">${up ? '↑' : '↓'} ${Math.abs(d * 100) >= 999 ? '999+' : Math.round(Math.abs(d * 100))}%</span>`;
  }

  function kpi({ label, ico, value, sub = '', hero = false }) {
    return `<article class="card kpi ${hero ? 'is-hero' : ''}">
      <div class="kpi-label">${icon(ico)}${label}</div>
      <div class="kpi-value num">${value}</div>
      <div class="kpi-sub">${sub}</div>
    </article>`;
  }

  function toast(msg) {
    const el = $('#toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toast.t);
    toast.t = setTimeout(() => el.classList.remove('show'), 2400);
  }

  // ---------------------------------------------------------------------------
  // Views
  // ---------------------------------------------------------------------------
  function viewEmpty() {
    return `<section class="card empty">
      <span class="brand-mark" aria-hidden="true"></span>
      <h2>Почнімо рахувати клієнтів</h2>
      <p>Додавайте вручну витрати, покази, кліки, листи й ліди по кожному каналу — дашборд сам порахує CTR, CPL, CAC, ROAS і покаже, що приносить гроші.</p>
      <div class="empty-actions">
        <button class="btn btn-primary" data-action="add-entry">${icon('plus')} Додати перший запис</button>
        <button class="btn" data-action="import-csv">${icon('upload')} Імпорт CSV</button>
        <button class="btn btn-ghost" data-action="demo">Показати демо-дані</button>
      </div>
    </section>`;
  }

  function viewOverview() {
    if (!state.entries.length && !state.deals.length) return { html: viewEmpty() };
    const range = currentRange();
    const ch = state.ui.channel;
    const cur = aggregate(range, ch);
    const prev = aggregate(previousRange(range), ch);
    const t = cur.total, p = prev.total;
    const bucket = pickBucket(range);
    const series = timeSeries(range, ch, bucket);
    const goals = state.settings.goals;

    const kpis = [
      kpi({ label: 'Витрачено', ico: 'wallet', value: money(t.spend), sub: `${delta(t.spend, p.spend, { neutral: true })} ${t.clients ? `CAC ${money(t.cac)}` : ''}` }),
      kpi({ label: 'Отримано', ico: 'coins', value: money(t.revenue), hero: true, sub: `${delta(t.revenue, p.revenue)} ${t.pipeline ? `у воронці ${money(t.pipeline)}` : ''}` }),
      kpi({ label: 'Прибуток', ico: 'trend', value: `<span class="${t.profit >= 0 ? '' : 'bad-t'}">${money(t.profit)}</span>`, sub: `ROI ${pct(t.roi, 0)} · ROAS ${ratio(t.roas)}` }),
      kpi({ label: 'Клієнти', ico: 'user', value: int(t.clients), sub: `${delta(t.clients, p.clients)} конверсія ліда ${pct(t.leadToClient, 0)}` }),
      kpi({ label: 'Ліди', ico: 'target', value: int(t.leads), sub: `${delta(t.leads, p.leads)} CPL ${moneyPrecise(t.cpl)}` }),
      kpi({ label: 'Трафік (кліки)', ico: 'cursor', value: int(t.clicks), sub: `${delta(t.clicks, p.clicks)} CPC ${moneyPrecise(t.cpc)}` }),
      kpi({ label: 'CTR', ico: 'eye', value: pct(t.ctr, 2), sub: `${int(t.impressions)} показів` }),
      kpi({ label: 'Листів надіслано', ico: 'mail', value: int(t.emails), sub: `${delta(t.emails, p.emails)} відповіді ${pct(t.replyRate, 0)}` }),
    ].join('');

    // per-channel rows
    const rows = state.channels
      .map((c) => ({ ch: c, t: cur.byChannel[c.id] }))
      .filter((r) => r.t && (ch === 'all' || r.ch.id === ch));
    const leadRows = rows.filter((r) => r.t.leads > 0).sort((a, b) => b.t.leads - a.t.leads);

    // funnel
    const stages = [
      ['Покази', t.impressions], ['Кліки', t.clicks], ['Ліди', t.leads], ['Зустрічі', t.meetings], ['Клієнти', t.clients],
    ];
    const fMax = Math.max(...stages.map((s) => s[1]), 1);
    const funnel = stages.map(([label, v], i) => {
      const w = Math.max(0, Math.min(100, Math.sqrt(v / fMax) * 100));
      const conv = i > 0 && stages[i - 1][1] ? `<div class="funnel-conv">↳ ${pct(v / stages[i - 1][1], 1)} з попереднього етапу</div>` : '';
      return `${conv}<div class="funnel-row"><span class="label">${label}</span><div class="funnel-bar"><i style="width:${w}%;--c:${seriesColor(i === 4 ? 2 : 0)};opacity:${1 - i * 0.12}"></i></div><span class="val num">${int(v)}</span></div>`;
    }).join('');

    // cold outreach today
    const todayAgg = aggregate({ from: today(), to: today() }, 'all').total;
    const emailGoal = num(goals.emailsPerDay);
    const emailPct = emailGoal ? Math.min(1, todayAgg.emails / emailGoal) : 0;
    let streak = 0;
    if (emailGoal) {
      let d = todayAgg.emails >= emailGoal ? today() : addDays(today(), -1);
      while (streak < 366 && aggregate({ from: d, to: d }).total.emails >= emailGoal) { streak++; d = addDays(d, -1); }
    }

    // monthly goals
    const mtd = aggregate(periodRange('mtd')).total;
    const goalRow = (label, val, target, fmt, invert = false) => {
      if (!num(target)) return '';
      const r = val / num(target);
      const cls = invert ? (r > 1 ? 'bad' : r > 0.85 ? 'warn' : '') : (r >= 1 ? 'good' : '');
      return `<div class="goal"><div class="goal-top"><strong>${label}</strong><span class="num">${fmt(val)} / ${fmt(num(target))}</span></div>
        <div class="progress ${cls}"><i style="width:${Math.min(100, r * 100)}%"></i></div></div>`;
    };
    const goalsHtml = [
      goalRow('Бюджет місяця', mtd.spend, goals.budget, money, true),
      goalRow('Дохід місяця', mtd.revenue, goals.revenue, money),
      goalRow('Ліди місяця', mtd.leads, goals.leads, int),
    ].join('') || `<p class="muted">Задайте цілі на місяць у <a href="#/settings" style="color:var(--brand);font-weight:600">налаштуваннях</a>: бюджет, дохід, кількість лідів.</p>`;

    const html = `
      <section class="toolbar">${periodChips()}<div class="toolbar-right">${channelSelect(ch)}</div></section>
      <p class="range-label">${rangeText(range)} · порівняння з попереднім таким самим періодом</p>
      <section class="kpis">${kpis}</section>
      <section class="grid grid-3">
        <article class="card span-2">
          <div class="card-head">
            <div><h2>Витрати vs дохід</h2><p>Дохід — з угод зі статусом «Клієнт»</p></div>
            <div class="seg" role="group" aria-label="Групування">${[['auto', 'Авто'], ['day', 'Дні'], ['week', 'Тижні'], ['month', 'Міс.']].map(([k, l]) =>
              `<button data-action="bucket" data-value="${k}" aria-pressed="${state.ui.chartBucket === k}">${l}</button>`).join('')}</div>
          </div>
          <div class="legend" style="margin-bottom:10px"><span><i style="--c:${seriesColor(0)}"></i>Витрати ${money(t.spend)}</span><span><i style="--c:${seriesColor(2)}"></i>Дохід ${money(t.revenue)}</span></div>
          <div class="chart-box tall"><canvas id="ch-spend" role="img" aria-label="Витрати та дохід по періодах"></canvas></div>
        </article>
        <article class="card">
          <div class="card-head"><div><h2>Воронка</h2><p>Від показу до клієнта</p></div></div>
          <div class="funnel">${funnel}</div>
        </article>
        <article class="card">
          <div class="card-head"><div><h2>Холодні листи</h2><p>Сьогодні та за період</p></div><button class="btn btn-sm" data-action="add-entry" data-channel="${esc((state.channels.find((c) => c.kind === 'outreach' && !c.archived) || {}).id || '')}">${icon('plus')} Листи</button></div>
          ${emailGoal ? `<div class="goal" style="margin-bottom:14px"><div class="goal-top"><strong>Сьогодні ${int(todayAgg.emails)} з ${int(emailGoal)}</strong><span>${streak ? `🔥 ${streak} дн. поспіль` : 'ціль на день'}</span></div>
            <div class="progress ${emailPct >= 1 ? 'good' : ''}"><i style="width:${emailPct * 100}%"></i></div></div>` : ''}
          <div class="mini-stats">
            <div><small>Надіслано</small><strong class="num">${int(t.emails)}</strong></div>
            <div><small>Відповіді</small><strong class="num">${int(t.replies)}</strong></div>
            <div><small>Reply rate</small><strong class="num">${pct(t.replyRate, 1)}</strong></div>
            <div><small>Листів на 1 лід</small><strong class="num">${(() => { const o = rows.filter((r) => r.ch.kind === 'outreach').reduce((a, r) => [a[0] + r.t.emails, a[1] + r.t.leads], [0, 0]); return o[1] ? fmtDec.format(o[0] / o[1]) : '—'; })()}</strong></div>
          </div>
          <div class="chart-box short" style="margin-top:14px"><canvas id="ch-emails" role="img" aria-label="Надіслані листи по періодах"></canvas></div>
        </article>
        <article class="card">
          <div class="card-head"><div><h2>Ліди по каналах</h2><p>Звідки приходять заявки</p></div></div>
          ${leadRows.length ? `<div class="chart-box short" style="height:${Math.max(160, leadRows.length * 40 + 30)}px"><canvas id="ch-leads" role="img" aria-label="Ліди по каналах"></canvas></div>` : `<p class="hint">За цей період лідів ще немає</p>`}
        </article>
        <article class="card">
          <div class="card-head"><div><h2>Цілі місяця</h2><p>${new Intl.DateTimeFormat('uk-UA', { month: 'long', year: 'numeric' }).format(new Date())}</p></div></div>
          ${goalsHtml}
        </article>
        <article class="card span-3">
          <div class="card-head"><div><h2>Ефективність каналів</h2><p>Натисніть на заголовок колонки, щоб відсортувати</p></div></div>
          ${channelTable(rows, t)}
        </article>
      </section>`;

    return {
      html,
      after() {
        renderSpendRevenueChart($('#ch-spend'), series);
        renderEmailsChart($('#ch-emails'), series, emailGoal);
        if (leadRows.length) renderLeadsByChannel($('#ch-leads'), leadRows);
      },
    };
  }

  const TABLE_COLS = [
    ['spend', 'Витрати', money], ['impressions', 'Покази', int], ['clicks', 'Кліки', int], ['ctr', 'CTR', (v) => pct(v, 2)],
    ['cpc', 'CPC', moneyPrecise], ['emails', 'Листи', int], ['replyRate', 'Відп.', (v) => pct(v, 0)], ['posts', 'Пости', int],
    ['leads', 'Ліди', int], ['cpl', 'CPL', moneyPrecise], ['clients', 'Клієнти', int], ['cac', 'CAC', moneyPrecise],
    ['revenue', 'Дохід', money], ['roas', 'ROAS', ratio],
  ];
  function channelTable(rows, total) {
    if (!rows.length) return `<p class="hint">Немає даних за цей період</p>`;
    const { key, dir } = state.ui.sort;
    const sorted = [...rows].sort((a, b) => {
      if (key === 'name') return a.ch.name.localeCompare(b.ch.name) * dir;
      return ((a.t[key] ?? -Infinity) - (b.t[key] ?? -Infinity)) * dir;
    });
    const sortAttr = (k) => (key === k ? ` aria-sort="${dir > 0 ? 'ascending' : 'descending'}"` : '');
    const arrow = (k) => (key === k ? (dir > 0 ? ' ↑' : ' ↓') : '');
    const roasCls = (v) => (v === null ? '' : v >= 1 ? 'good-t' : 'bad-t');
    return `<div class="table-wrap"><table>
      <thead><tr><th data-action="sort" data-value="name"${sortAttr('name')}>Канал${arrow('name')}</th>${TABLE_COLS.map(([k, l]) => `<th data-action="sort" data-value="${k}"${sortAttr(k)}>${l}${arrow(k)}</th>`).join('')}</tr></thead>
      <tbody>${sorted.map((r) => `<tr><td><span class="ch-name"><span class="dot" style="--c:${chColor(r.ch)}"></span>${esc(r.ch.name)}</span></td>${TABLE_COLS.map(([k, , f]) =>
        `<td class="${k === 'roas' ? roasCls(r.t.roas) : ''}">${f(r.t[k])}</td>`).join('')}</tr>`).join('')}</tbody>
      ${rows.length > 1 ? `<tfoot><tr><td>Разом</td>${TABLE_COLS.map(([k, , f]) => `<td class="${k === 'roas' ? roasCls(total.roas) : ''}">${f(total[k])}</td>`).join('')}</tr></tfoot>` : ''}
    </table></div>`;
  }

  function viewChannels() {
    const range = currentRange();
    const agg = aggregate(range);
    const bucket = pickBucket(range);
    const cards = state.channels.map((c) => {
      const t = agg.byChannel[c.id] || derive(emptyTotals());
      const ts = timeSeries(range, c.id, bucket);
      const color = chColor(c);
      const kindMetrics = {
        ads: [['Витрати', money(t.spend)], ['CTR', pct(t.ctr, 2)], ['CPC', moneyPrecise(t.cpc)]],
        outreach: [['Листів', int(t.emails)], ['Відповіді', pct(t.replyRate, 0)], ['Зустрічі', int(t.meetings)]],
        organic: [['Постів', int(t.posts)], ['Охоплення', fmtCompact.format(t.impressions)], ['Кліки', int(t.clicks)]],
        other: [['Витрати', money(t.spend)], ['Кліки', int(t.clicks)], ['CTR', pct(t.ctr, 2)]],
      }[c.kind] || [];
      const common = [['Ліди', int(t.leads)], ['Клієнти', int(t.clients)], ['Дохід', money(t.revenue)]];
      const sparkKey = c.kind === 'outreach' ? 'emails' : c.kind === 'ads' ? 'spend' : 'leads';
      const sparkLabel = { emails: 'листи', spend: 'витрати', leads: 'ліди' }[sparkKey];
      return `<article class="card ch-card ${c.archived ? 'is-archived' : ''}">
        <div class="ch-card-head">
          <span class="ch-avatar" style="--c:${color}">${esc(c.name.trim().charAt(0).toUpperCase())}</span>
          <div style="flex:1;min-width:0"><h3>${esc(c.name)}</h3><span class="tag">${KINDS[c.kind]?.label || ''}${c.archived ? ' · архів' : ''}</span></div>
          <button class="icon-btn" data-action="edit-channel" data-id="${esc(c.id)}" aria-label="Редагувати канал">${icon('settings')}</button>
        </div>
        <div class="ch-metrics">${[...kindMetrics, ...common].map(([l, v]) => `<div><small>${l}</small><strong class="num">${v}</strong></div>`).join('')}</div>
        <div><small class="muted" style="font-size:11px">Динаміка: ${sparkLabel}</small>${sparkline(ts.data.map((d) => d[sparkKey]), color)}</div>
        <div class="ch-actions">
          <button class="btn btn-sm btn-primary" data-action="add-entry" data-channel="${esc(c.id)}">${icon('plus')} Дані</button>
          <a class="btn btn-sm" href="#/journal" data-action="journal-channel" data-id="${esc(c.id)}">Журнал</a>
        </div>
      </article>`;
    }).join('');
    return {
      html: `<section class="toolbar">${periodChips()}</section>
        <p class="range-label">${rangeText(range)}</p>
        <section class="grid grid-3">${cards}
          <button class="card add-card" data-action="add-channel">${icon('plus')}<span>Додати канал</span><small class="muted" style="font-weight:400">TikTok, SEO, рекомендації, Upwork…</small></button>
        </section>`,
    };
  }

  let journalLimit = 60;
  let journalQuery = '';
  function viewJournal() {
    const ch = state.ui.channel;
    const q = journalQuery.trim().toLowerCase();
    const list = state.entries
      .filter((e) => ch === 'all' || e.channelId === ch)
      .filter((e) => !q || (e.note || '').toLowerCase().includes(q) || (channelById(e.channelId)?.name || '').toLowerCase().includes(q))
      .sort((a, b) => (b.date + (b.updated || '')).localeCompare(a.date + (a.updated || '')));
    const shown = list.slice(0, journalLimit);
    const groups = {};
    shown.forEach((e) => (groups[e.date] ||= []).push(e));
    const body = Object.entries(groups).map(([date, items]) => {
      const spend = items.reduce((s, e) => s + num(e.spend), 0);
      const leads = items.reduce((s, e) => s + num(e.leads), 0);
      return `<section class="day-group">
        <div class="day-head"><strong>${fmtDateLong.format(fromISO(date))}</strong><span class="num">${money(spend)} · ${int(leads)} лідів</span></div>
        <div class="list">${items.map(entryRow).join('')}</div>
      </section>`;
    }).join('');
    return {
      html: `<section class="toolbar">
          <div style="flex:1 1 240px;position:relative">
            <input class="input" style="min-height:38px;font-size:14px;padding-left:38px" type="search" placeholder="Пошук по нотатках і каналах" value="${esc(journalQuery)}" data-input="journal-search" aria-label="Пошук" />
            <span style="position:absolute;left:12px;top:9px;color:var(--muted)">${icon('search')}</span>
          </div>
          <div class="toolbar-right">${channelSelect(ch)}<button class="btn btn-sm btn-primary" data-action="add-entry">${icon('plus')} Запис</button></div>
        </section>
        ${list.length ? `<p class="range-label">${int(list.length)} записів</p>${body}` : (state.entries.length ? `<p class="hint">Нічого не знайдено</p>` : viewEmpty())}
        ${list.length > journalLimit ? `<div style="text-align:center;margin-top:16px"><button class="btn" data-action="more">Показати ще</button></div>` : ''}`,
    };
  }
  function entryRow(e) {
    const c = channelById(e.channelId);
    const parts = [];
    if (num(e.spend)) parts.push(`<span><b>${money(num(e.spend))}</b></span>`);
    if (num(e.impressions)) parts.push(`<span><b>${int(num(e.impressions))}</b> показів</span>`);
    if (num(e.clicks)) parts.push(`<span><b>${int(num(e.clicks))}</b> кліків${num(e.impressions) ? ` · CTR ${pct(num(e.clicks) / num(e.impressions), 2)}` : ''}</span>`);
    if (num(e.emails)) parts.push(`<span><b>${int(num(e.emails))}</b> листів</span>`);
    if (num(e.replies)) parts.push(`<span><b>${int(num(e.replies))}</b> відповідей</span>`);
    if (num(e.posts)) parts.push(`<span><b>${int(num(e.posts))}</b> постів</span>`);
    if (num(e.meetings)) parts.push(`<span><b>${int(num(e.meetings))}</b> зустрічей</span>`);
    return `<button class="row" data-action="edit-entry" data-id="${esc(e.id)}">
      <span class="dot" style="--c:${chColor(c)}"></span>
      <span class="row-main">
        <span class="row-title">${esc(c ? c.name : 'Невідомий канал')}</span>
        <span class="row-meta">${parts.join('') || '<span class="muted">без метрик</span>'}</span>
        ${e.note ? `<span class="row-note">${esc(e.note)}</span>` : ''}
      </span>
      <span class="row-side">${num(e.leads) ? `<strong class="num">${int(num(e.leads))}</strong><small class="muted">лідів</small>` : ''}</span>
    </button>`;
  }

  let dealFilter = 'open';
  function viewClients() {
    const counts = Object.fromEntries(STATUSES.map(([k]) => [k, { n: 0, v: 0 }]));
    state.deals.forEach((d) => { const c = counts[d.status] || counts.lead; c.n++; c.v += num(d.value); });
    const filters = [['open', 'Активні'], ['won', 'Клієнти'], ['lost', 'Втрачені'], ['all', 'Усі']];
    const list = state.deals
      .filter((d) => dealFilter === 'all' || (dealFilter === 'open' ? !['won', 'lost'].includes(d.status) : d.status === dealFilter))
      .filter((d) => state.ui.channel === 'all' || d.channelId === state.ui.channel)
      .sort((a, b) => b.date.localeCompare(a.date));
    const pipeline = STATUSES.map(([k, l]) => `<article class="card" data-action="deal-filter" data-value="${k === 'won' || k === 'lost' ? k : 'open'}">
        <small>${l}</small><strong class="num">${counts[k].n}</strong><span class="num">${money(counts[k].v)}</span></article>`).join('');
    const rows = list.map((d) => {
      const c = channelById(d.channelId);
      return `<button class="row" data-action="edit-deal" data-id="${esc(d.id)}">
        <span class="dot" style="--c:${chColor(c)}"></span>
        <span class="row-main">
          <span class="row-title">${esc(d.name || 'Без назви')}</span>
          <span class="row-meta"><span>${esc(c ? c.name : '—')}</span><span>${fmtDate.format(fromISO(d.date))}</span></span>
          ${d.note ? `<span class="row-note">${esc(d.note)}</span>` : ''}
        </span>
        <span class="row-side"><strong class="num">${money(num(d.value))}</strong><span class="pill st-${esc(d.status)}">${STATUS_LABEL[d.status] || d.status}</span></span>
      </button>`;
    }).join('');
    return {
      html: `<section class="pipeline">${pipeline}</section>
        <section class="toolbar">
          <div class="chips" role="group" aria-label="Фільтр">${filters.map(([k, l]) => `<button class="chip" data-action="deal-filter" data-value="${k}" aria-pressed="${dealFilter === k}">${l}</button>`).join('')}</div>
          <div class="toolbar-right">${channelSelect(state.ui.channel)}<button class="btn btn-sm btn-primary" data-action="add-deal">${icon('plus')} Клієнт</button></div>
        </section>
        ${rows ? `<div class="list">${rows}</div>` : `<section class="card empty"><h2>Тут будуть ваші клієнти</h2><p>Додавайте кожен лід або угоду з каналом і сумою. Статус «Клієнт» рахується як дохід на дату угоди — так видно реальний ROAS і CAC кожного каналу.</p><button class="btn btn-primary" data-action="add-deal">${icon('plus')} Додати клієнта</button></section>`}`,
    };
  }

  function viewSettings() {
    const s = state.settings;
    const g = s.goals;
    return {
      html: `<div class="grid grid-2">
        <section class="card settings-section">
          <h2>Бізнес і бренд</h2><p>Назва, валюта та фірмовий колір інтерфейсу.</p>
          <div class="form-grid">
            <label class="field"><span>Назва</span><input class="input" data-setting="business" value="${esc(s.business)}" /></label>
            <label class="field"><span>Валюта</span><select class="select" data-setting="currency">${CURRENCIES.map((c) => `<option ${c === s.currency ? 'selected' : ''}>${c}</option>`).join('')}</select></label>
            <div class="field full"><span>Фірмовий колір</span>
              <div class="swatches">${BRAND_PRESETS.map((c) => `<button type="button" class="swatch" style="--c:${c}" data-action="brand" data-value="${c}" aria-pressed="${c.toLowerCase() === s.brand.toLowerCase()}" aria-label="${c}"></button>`).join('')}
                <input type="color" class="color-input" value="${esc(s.brand)}" data-setting="brand" aria-label="Свій колір" /></div>
            </div>
            <div class="field full"><span>Тема</span>
              <div class="chips">${[['auto', 'Як у системі'], ['light', 'Світла'], ['dark', 'Темна']].map(([k, l]) => `<button type="button" class="chip" data-action="theme" data-value="${k}" aria-pressed="${s.theme === k}">${l}</button>`).join('')}</div>
            </div>
          </div>
        </section>
        <section class="card settings-section">
          <h2>Цілі</h2><p>Показуються на «Огляді» як прогрес-бари. 0 — не відстежувати.</p>
          <div class="form-grid">
            <label class="field"><span>Бюджет на місяць</span><input class="input" inputmode="decimal" data-goal="budget" value="${g.budget || ''}" placeholder="0" /></label>
            <label class="field"><span>Дохід на місяць</span><input class="input" inputmode="decimal" data-goal="revenue" value="${g.revenue || ''}" placeholder="0" /></label>
            <label class="field"><span>Лідів на місяць</span><input class="input" inputmode="numeric" data-goal="leads" value="${g.leads || ''}" placeholder="0" /></label>
            <label class="field"><span>Листів на день</span><input class="input" inputmode="numeric" data-goal="emailsPerDay" value="${g.emailsPerDay || ''}" placeholder="0" /></label>
          </div>
        </section>
        <section class="card settings-section">
          <h2>Канали</h2><p>Додавайте, перейменовуйте або архівуйте канали залучення.</p>
          <div class="list">${state.channels.map((c) => `<button class="row" data-action="edit-channel" data-id="${esc(c.id)}"><span class="dot" style="--c:${chColor(c)}"></span><span class="row-main"><span class="row-title">${esc(c.name)}</span><span class="row-meta">${KINDS[c.kind]?.label || ''}${c.archived ? ' · архів' : ''}</span></span></button>`).join('')}</div>
          <div class="btn-row" style="margin-top:12px"><button class="btn" data-action="add-channel">${icon('plus')} Новий канал</button></div>
        </section>
        <section class="card settings-section">
          <h2>Дані</h2><p>Усе зберігається локально в цьому браузері. Щоб перенести дані між телефоном і ноутбуком — експортуйте JSON та імпортуйте на іншому пристрої.</p>
          <div class="btn-row">
            <button class="btn" data-action="export-json">${icon('download')} Бекап JSON</button>
            <button class="btn" data-action="import-json">${icon('upload')} Відновити JSON</button>
            <button class="btn" data-action="export-csv">${icon('download')} Експорт CSV</button>
            <button class="btn" data-action="import-csv">${icon('upload')} Імпорт CSV</button>
            <button class="btn btn-ghost" data-action="csv-template">Шаблон CSV</button>
          </div>
          <p class="muted" style="font-size:13px;margin-top:14px">Формат CSV (кома або крапка з комою): <code>date,channel,spend,impressions,clicks,emails,replies,posts,leads,meetings,note</code>. Канал — назва або id; нові канали створяться автоматично.</p>
          <div class="btn-row" style="margin-top:14px">
            <button class="btn btn-ghost" data-action="demo">Завантажити демо-дані</button>
            <button class="btn btn-ghost btn-danger" data-action="reset">Видалити всі дані</button>
          </div>
          <p class="muted" style="font-size:12px;margin-top:12px">${int(state.entries.length)} записів · ${int(state.deals.length)} клієнтів/угод · ${int(state.channels.length)} каналів</p>
        </section>
      </div>`,
    };
  }

  // ---------------------------------------------------------------------------
  // Sheets (forms)
  // ---------------------------------------------------------------------------
  const sheet = $('#sheet');
  let sheetSubmit = null;
  function openSheet({ title, body, foot, onSubmit, onOpen }) {
    $('#sheet-title').textContent = title;
    $('#sheet-body').innerHTML = body;
    $('#sheet-foot').innerHTML = foot;
    sheetSubmit = onSubmit;
    if (!sheet.open) sheet.showModal();
    onOpen && onOpen($('#sheet-body'));
  }
  function closeSheet() { if (sheet.open) sheet.close(); sheetSubmit = null; }
  sheet.addEventListener('click', (e) => { if (e.target === sheet) closeSheet(); });
  $('#sheet-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = e.submitter;
    if (sheetSubmit) sheetSubmit(btn ? btn.value : 'save', new FormData(e.target));
  });

  function entryForm(entry, presetChannel) {
    const isEdit = !!entry;
    const e = entry || { date: today(), channelId: presetChannel || state.ui.lastChannel || activeChannels()[0]?.id };
    const channels = state.channels.filter((c) => !c.archived || c.id === e.channelId);
    if (!channels.length) { toast('Спочатку додайте канал'); return; }
    if (!channelById(e.channelId)) e.channelId = channels[0].id;

    const fieldsHtml = (chId) => {
      const kind = channelById(chId)?.kind || 'other';
      const keys = KINDS[kind].fields;
      const extra = METRIC_KEYS.filter((k) => !keys.includes(k) && num(e[k]));
      return [...keys, ...extra].map((k) => `<label class="field"><span>${FIELDS[k].label}${FIELDS[k].money ? `, ${esc(state.settings.currency)}` : ''}</span>
        <input class="input num" name="${k}" inputmode="${FIELDS[k].money ? 'decimal' : 'numeric'}" autocomplete="off" placeholder="0" value="${num(e[k]) || ''}" /></label>`).join('');
    };

    openSheet({
      title: isEdit ? 'Редагувати запис' : 'Нові дані',
      body: `
        <div class="field"><span>Канал</span>
          <div class="chips chip-wrap">${channels.map((c) => `<button type="button" class="chip ${c.id === e.channelId ? 'is-active' : ''}" data-pick-channel="${esc(c.id)}"><span class="dot" style="--c:${chColor(c)}"></span>${esc(c.name)}</button>`).join('')}</div>
          <input type="hidden" name="channelId" value="${esc(e.channelId)}" />
        </div>
        <label class="field"><span>Дата</span><input class="input" type="date" name="date" value="${esc(e.date)}" max="${addDays(today(), 366)}" required /></label>
        <div class="form-grid" data-fields>${fieldsHtml(e.channelId)}</div>
        <div class="calc-preview" data-preview></div>
        <label class="field"><span>Нотатка</span><textarea class="input" name="note" rows="2" placeholder="Кампанія, креатив, сегмент, що тестували…">${esc(e.note || '')}</textarea></label>`,
      foot: `${isEdit ? `<button type="submit" class="btn btn-ghost btn-danger" value="delete" formnovalidate>Видалити</button>` : `<button type="submit" class="btn" value="again">Зберегти й ще</button>`}
        <button type="submit" class="btn btn-primary" value="save">Зберегти</button>`,
      onOpen(root) {
        const preview = () => {
          const v = (n) => num($(`[name="${n}"]`, root)?.value);
          const out = [];
          if (v('impressions') && v('clicks')) out.push(`CTR ${pct(v('clicks') / v('impressions'), 2)}`);
          if (v('spend') && v('clicks')) out.push(`CPC ${moneyPrecise(v('spend') / v('clicks'))}`);
          if (v('spend') && v('leads')) out.push(`CPL ${moneyPrecise(v('spend') / v('leads'))}`);
          if (v('emails') && v('replies')) out.push(`Reply rate ${pct(v('replies') / v('emails'), 1)}`);
          $('[data-preview]', root).innerHTML = out.map((x) => `<span>${x}</span>`).join('');
        };
        root.addEventListener('input', preview);
        root.addEventListener('click', (ev) => {
          const chip = ev.target.closest('[data-pick-channel]');
          if (!chip) return;
          const keep = Object.fromEntries(METRIC_KEYS.map((k) => [k, $(`[name="${k}"]`, root)?.value]));
          Object.assign(e, keep);
          e.channelId = chip.dataset.pickChannel;
          $('[name="channelId"]', root).value = e.channelId;
          $$('[data-pick-channel]', root).forEach((b) => b.classList.toggle('is-active', b === chip));
          $('[data-fields]', root).innerHTML = fieldsHtml(e.channelId);
          preview();
        });
        preview();
        if (!matchMedia('(pointer: coarse)').matches) $('[data-fields] input', root)?.focus();
      },
      onSubmit(action, fd) {
        if (action === 'delete') {
          if (!confirm('Видалити цей запис?')) return;
          state.entries = state.entries.filter((x) => x.id !== entry.id);
          save(); closeSheet(); render(); toast('Запис видалено');
          return;
        }
        const date = fd.get('date');
        if (!date) { toast('Вкажіть дату'); return; }
        const rec = { id: entry?.id || uid(), date, channelId: fd.get('channelId'), note: String(fd.get('note') || '').trim(), updated: new Date().toISOString() };
        METRIC_KEYS.forEach((k) => { const v = num(fd.get(k)); if (v) rec[k] = v; });
        if (!METRIC_KEYS.some((k) => rec[k]) && !rec.note) { toast('Введіть хоча б одне значення'); return; }
        if (isEdit) state.entries = state.entries.map((x) => (x.id === rec.id ? rec : x));
        else state.entries.push(rec);
        state.ui.lastChannel = rec.channelId;
        save(); render();
        if (action === 'again') { toast('Збережено ✓'); entryForm(null, rec.channelId); $('#sheet [name="date"]').value = date; }
        else { closeSheet(); toast('Збережено ✓'); }
      },
    });
  }

  function dealForm(deal) {
    const isEdit = !!deal;
    const d = deal || { date: today(), status: 'lead', channelId: state.ui.channel !== 'all' ? state.ui.channel : state.ui.lastChannel || activeChannels()[0]?.id };
    openSheet({
      title: isEdit ? 'Клієнт / угода' : 'Новий клієнт або лід',
      body: `
        <label class="field"><span>Назва компанії або ім'я</span><input class="input" name="name" value="${esc(d.name || '')}" placeholder="напр. Bager Hansen ApS" required /></label>
        <div class="form-grid">
          <label class="field"><span>Канал</span>${channelSelect(d.channelId, { all: false, action: '', cls: 'select' }).replace('<select', '<select name="channelId"')}</label>
          <label class="field"><span>Дата</span><input class="input" type="date" name="date" value="${esc(d.date)}" required /></label>
          <label class="field"><span>Сума угоди, ${esc(state.settings.currency)}</span><input class="input num" name="value" inputmode="decimal" value="${num(d.value) || ''}" placeholder="0" /></label>
          <label class="field"><span>Статус</span><select class="select" name="status">${STATUSES.map(([k, l]) => `<option value="${k}" ${k === d.status ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
        </div>
        <label class="field"><span>Нотатка</span><textarea class="input" name="note" rows="2" placeholder="Що потрібно, контакт, наступний крок…">${esc(d.note || '')}</textarea></label>
        <small class="muted">Статус «Клієнт» = дохід на вказану дату. Для виграної угоди ставте дату підписання/оплати.</small>`,
      foot: `${isEdit ? `<button type="submit" class="btn btn-ghost btn-danger" value="delete" formnovalidate>Видалити</button>` : ''}
        <button type="submit" class="btn btn-primary" value="save">Зберегти</button>`,
      onSubmit(action, fd) {
        if (action === 'delete') {
          if (!confirm('Видалити цього клієнта?')) return;
          state.deals = state.deals.filter((x) => x.id !== deal.id);
          save(); closeSheet(); render(); toast('Видалено');
          return;
        }
        const name = String(fd.get('name') || '').trim();
        if (!name) { toast('Вкажіть назву'); return; }
        const rec = { id: deal?.id || uid(), name, channelId: fd.get('channelId'), date: fd.get('date') || today(), value: num(fd.get('value')), status: fd.get('status'), note: String(fd.get('note') || '').trim() };
        if (isEdit) state.deals = state.deals.map((x) => (x.id === rec.id ? rec : x));
        else state.deals.push(rec);
        save(); closeSheet(); render(); toast(rec.status === 'won' ? 'Вітаю з клієнтом! 🎉' : 'Збережено ✓');
      },
    });
  }

  function channelForm(ch) {
    const isEdit = !!ch;
    const used = new Set(state.channels.map((c) => c.color));
    const c = ch || { name: '', kind: 'organic', color: [...Array(SERIES).keys()].find((i) => !used.has(i)) ?? state.channels.length % SERIES };
    const inUse = isEdit && (state.entries.some((e) => e.channelId === ch.id) || state.deals.some((d) => d.channelId === ch.id));
    openSheet({
      title: isEdit ? 'Канал' : 'Новий канал',
      body: `
        <label class="field"><span>Назва</span><input class="input" name="name" value="${esc(c.name)}" placeholder="напр. TikTok, SEO, Рекомендації" required /></label>
        <label class="field"><span>Тип</span><select class="select" name="kind">${Object.entries(KINDS).map(([k, v]) => `<option value="${k}" ${k === c.kind ? 'selected' : ''}>${v.label}</option>`).join('')}</select>
          <small>Тип визначає, які поля показувати у формі: реклама — витрати, покази, кліки; листи — надіслано, відповіді; пости — кількість постів, охоплення.</small></label>
        <div class="field"><span>Колір</span><div class="swatches">${[...Array(SERIES).keys()].map((i) => `<button type="button" class="swatch" style="--c:${seriesColor(i)}" data-pick-color="${i}" aria-pressed="${i === c.color}" aria-label="Колір ${i + 1}"></button>`).join('')}</div>
          <input type="hidden" name="color" value="${c.color}" /></div>
        ${isEdit ? `<label class="field" style="flex-direction:row;align-items:center;gap:10px"><input type="checkbox" name="archived" ${c.archived ? 'checked' : ''} style="width:20px;height:20px;accent-color:var(--brand)" /><span>В архіві (не показувати у формі)</span></label>` : ''}`,
      foot: `${isEdit ? `<button type="submit" class="btn btn-ghost btn-danger" value="delete" formnovalidate>${inUse ? 'Архівувати' : 'Видалити'}</button>` : ''}
        <button type="submit" class="btn btn-primary" value="save">Зберегти</button>`,
      onOpen(root) {
        root.addEventListener('click', (ev) => {
          const b = ev.target.closest('[data-pick-color]');
          if (!b) return;
          $('[name="color"]', root).value = b.dataset.pickColor;
          $$('[data-pick-color]', root).forEach((x) => x.setAttribute('aria-pressed', x === b));
        });
      },
      onSubmit(action, fd) {
        if (action === 'delete') {
          if (inUse) { ch.archived = true; toast('Канал в архіві — історія збережена'); }
          else { if (!confirm('Видалити канал?')) return; state.channels = state.channels.filter((x) => x.id !== ch.id); toast('Канал видалено'); }
          save(); closeSheet(); render();
          return;
        }
        const name = String(fd.get('name') || '').trim();
        if (!name) { toast('Вкажіть назву'); return; }
        const rec = { id: ch?.id || slug(name), name, kind: fd.get('kind'), color: Number(fd.get('color')), archived: fd.get('archived') === 'on' };
        if (isEdit) Object.assign(ch, rec);
        else state.channels.push(rec);
        save(); closeSheet(); render(); toast('Збережено ✓');
      },
    });
  }
  function slug(name) {
    let base = name.toLowerCase().replace(/[^a-z0-9а-яіїєґ]+/gi, '_').replace(/^_|_$/g, '') || 'channel';
    let id = base, i = 2;
    while (channelById(id)) id = `${base}_${i++}`;
    return id;
  }

  // ---------------------------------------------------------------------------
  // Import / export
  // ---------------------------------------------------------------------------
  function download(name, text, type) {
    const blob = new Blob([text], { type });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  const CSV_COLS = ['date', 'channel', ...METRIC_KEYS, 'note'];
  const csvCell = (v) => { const s = String(v ?? ''); return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
  function exportCSV() {
    const lines = [CSV_COLS.join(',')];
    [...state.entries].sort((a, b) => a.date.localeCompare(b.date)).forEach((e) => {
      lines.push([e.date, channelById(e.channelId)?.name || e.channelId, ...METRIC_KEYS.map((k) => num(e[k]) || ''), e.note || ''].map(csvCell).join(','));
    });
    download(`webhjerte-data-${today()}.csv`, '﻿' + lines.join('\n'), 'text/csv;charset=utf-8');
  }
  function csvTemplate() {
    const t = today(), y = addDays(t, -1);
    const lines = [CSV_COLS.join(','),
      `${y},Google Ads,350,4200,96,,,,4,1,Пошукова кампанія "веб-сайт для ресторану"`,
      `${y},Cold mail,,,,40,3,,1,1,Ресторани Орхус`,
      `${t},LinkedIn пости,,1800,22,,,1,1,,Кейс клієнта`,
    ];
    download('webhjerte-template.csv', '﻿' + lines.join('\n'), 'text/csv;charset=utf-8');
  }
  function parseCSV(text) {
    text = text.replace(/^﻿/, '');
    const firstLine = text.split(/\r?\n/)[0] || '';
    const delim = (firstLine.match(/;/g) || []).length > (firstLine.match(/,/g) || []).length ? ';' : (firstLine.includes('\t') && !firstLine.includes(',') ? '\t' : ',');
    const rows = [];
    let row = [], cell = '', q = false;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (q) {
        if (ch === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; }
        else cell += ch;
      } else if (ch === '"') q = true;
      else if (ch === delim) { row.push(cell); cell = ''; }
      else if (ch === '\n' || ch === '\r') {
        if (ch === '\r' && text[i + 1] === '\n') i++;
        row.push(cell); rows.push(row); row = []; cell = '';
      } else cell += ch;
    }
    if (cell || row.length) { row.push(cell); rows.push(row); }
    return rows.filter((r) => r.some((c) => c.trim()));
  }
  const HEADER_ALIASES = {
    date: ['date', 'дата', 'day', 'день'],
    channel: ['channel', 'канал', 'source', 'джерело'],
    spend: ['spend', 'cost', 'витрати', 'вартість', 'budget'],
    impressions: ['impressions', 'impr', 'покази', 'reach', 'охоплення'],
    clicks: ['clicks', 'кліки', 'clicks (all)'],
    emails: ['emails', 'sent', 'листи', 'листів', 'emails sent'],
    replies: ['replies', 'відповіді', 'reply'],
    posts: ['posts', 'пости'],
    leads: ['leads', 'ліди', 'conversions', 'конверсії'],
    meetings: ['meetings', 'зустрічі', 'calls'],
    note: ['note', 'нотатка', 'notes', 'comment', 'campaign', 'кампанія'],
  };
  function normDate(s) {
    s = String(s).trim();
    let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (m) return `${m[1]}-${pad(m[2])}-${pad(m[3])}`;
    m = s.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})/);
    if (m) return `${m[3]}-${pad(m[2])}-${pad(m[1])}`;
    return null;
  }
  function importCSV(text) {
    const rows = parseCSV(text);
    if (rows.length < 2) { toast('CSV порожній'); return; }
    const header = rows[0].map((h) => h.trim().toLowerCase());
    const idx = {};
    for (const [k, aliases] of Object.entries(HEADER_ALIASES)) {
      const i = header.findIndex((h) => aliases.includes(h));
      if (i >= 0) idx[k] = i;
    }
    if (idx.date === undefined || idx.channel === undefined) { toast('Потрібні колонки date і channel'); return; }
    let added = 0, skipped = 0, newCh = 0;
    for (const r of rows.slice(1)) {
      const date = normDate(r[idx.date] || '');
      const chName = (r[idx.channel] || '').trim();
      if (!date || !chName) { skipped++; continue; }
      let ch = state.channels.find((c) => c.id.toLowerCase() === chName.toLowerCase() || c.name.toLowerCase() === chName.toLowerCase());
      if (!ch) {
        ch = { id: slug(chName), name: chName, kind: /mail|лист/i.test(chName) ? 'outreach' : /ads|реклам/i.test(chName) ? 'ads' : 'organic', color: state.channels.length % SERIES, archived: false };
        state.channels.push(ch); newCh++;
      }
      const rec = { id: uid(), date, channelId: ch.id, note: idx.note !== undefined ? (r[idx.note] || '').trim() : '', updated: new Date().toISOString() };
      METRIC_KEYS.forEach((k) => { if (idx[k] !== undefined) { const v = num(r[idx[k]]); if (v) rec[k] = v; } });
      state.entries.push(rec); added++;
    }
    save(); render();
    toast(`Імпортовано ${added} записів${newCh ? `, нових каналів: ${newCh}` : ''}${skipped ? `, пропущено: ${skipped}` : ''}`);
  }

  function demoData() {
    const s = defaultState();
    s.settings = { ...state.settings, goals: { budget: 8000, revenue: 40000, emailsPerDay: 30, leads: 25 } };
    s.ui = state.ui;
    const rnd = Math.random;
    const r = (a, b) => Math.round(a + rnd() * (b - a));
    const names = ['Café Nord', 'Bager Hansen', 'Tandlæge Holm', 'Frisør Lux', 'Auto Jensen', 'Yoga Studio Ø', 'Pizzeria Roma', 'Byg & Bo ApS', 'Fysio Plus', 'Blomster Ida', 'Advokat Berg', 'Hotel Fjord', 'Kaffebar 8000', 'Malerfirma Kim',
      'Tømrer Lund', 'Klinik Smil', 'Vinbar Ost', 'Elektriker Bo', 'Sushi Aros', 'Revisor Dahl', 'Gartner Grøn', 'Bilpleje Pro', 'Optik Klar', 'Dyrlæge Mia', 'Galleri Nyt', 'Surf Shop Vest', 'Burger Bros', 'Massage Ro'];
    for (let i = 119; i >= 0; i--) {
      const date = addDays(today(), -i);
      const wd = fromISO(date).getDay();
      const weekend = wd === 0 || wd === 6;
      const imp = r(1800, 4200);
      s.entries.push({ id: uid(), date, channelId: 'google_ads', spend: r(180, 420), impressions: imp, clicks: Math.round(imp * (0.025 + rnd() * 0.02)), leads: rnd() < 0.45 ? r(1, 2) : 0, meetings: rnd() < 0.2 ? 1 : 0 });
      const mimp = r(3500, 9000);
      s.entries.push({ id: uid(), date, channelId: 'meta_ads', spend: r(120, 300), impressions: mimp, clicks: Math.round(mimp * (0.008 + rnd() * 0.01)), leads: rnd() < 0.3 ? 1 : 0 });
      if (!weekend) {
        const em = r(18, 45);
        s.entries.push({ id: uid(), date, channelId: 'cold_mail', emails: em, replies: Math.round(em * (0.03 + rnd() * 0.06)), leads: rnd() < 0.35 ? 1 : 0, meetings: rnd() < 0.18 ? 1 : 0 });
      }
      if (wd === 2 || wd === 4) s.entries.push({ id: uid(), date, channelId: 'linkedin', posts: 1, impressions: r(600, 2600), clicks: r(5, 40), leads: rnd() < 0.3 ? 1 : 0 });
      if (wd === 1 || wd === 3 || wd === 5) s.entries.push({ id: uid(), date, channelId: 'instagram', posts: 1, impressions: r(300, 1500), clicks: r(2, 18), leads: rnd() < 0.12 ? 1 : 0 });
      if (wd === 3) s.entries.push({ id: uid(), date, channelId: 'facebook', posts: 1, impressions: r(200, 900), clicks: r(1, 12), leads: rnd() < 0.1 ? 1 : 0, spend: rnd() < 0.3 ? 150 : 0 });
    }
    const chs = ['google_ads', 'google_ads', 'cold_mail', 'cold_mail', 'cold_mail', 'meta_ads', 'linkedin', 'instagram'];
    names.forEach((name, i) => {
      const st = i < 16 ? 'won' : ['lead', 'meeting', 'proposal', 'lost', 'proposal', 'meeting', 'lead', 'lost', 'meeting', 'proposal', 'lead', 'lost'][i - 16];
      s.deals.push({ id: uid(), name, channelId: chs[i % chs.length], date: addDays(today(), -r(1, 110)), value: [7500, 12000, 15000, 9900, 24000, 6500][i % 6], status: st, note: '' });
    });
    return s;
  }

  // ---------------------------------------------------------------------------
  // Shell, routing & events
  // ---------------------------------------------------------------------------
  const VIEWS = { overview: viewOverview, channels: viewChannels, journal: viewJournal, clients: viewClients, settings: viewSettings };
  const TITLES = Object.fromEntries(NAV.map(([k, l]) => [k, l]));
  const route = () => { const r = location.hash.replace(/^#\/?/, '').split('?')[0]; return VIEWS[r] ? r : 'overview'; };

  function applySettings() {
    const s = state.settings;
    const root = document.documentElement;
    root.style.setProperty('--brand', s.brand);
    root.style.setProperty('--brand-ink', readableInk(s.brand));
    if (s.theme === 'auto') root.removeAttribute('data-theme'); else root.setAttribute('data-theme', s.theme);
    $('meta[name="theme-color"]').setAttribute('content', s.brand);
    $$('[data-bind="business"]').forEach((el) => (el.textContent = s.business || 'Webhjerte'));
    document.title = `${s.business || 'Webhjerte'} Growth`;
    setCurrency(s.currency);
  }

  function renderShell(r) {
    $('[data-nav]').innerHTML = NAV.map(([k, l, ic]) => `<a href="#/${k}" ${k === r ? 'aria-current="page"' : ''}>${icon(ic)}${l}</a>`).join('');
    const items = NAV.filter(([k]) => k !== 'settings');
    $('[data-bottom-nav]').innerHTML = [
      ...items.slice(0, 2).map(([k, l, ic]) => `<a href="#/${k}" ${k === r ? 'aria-current="page"' : ''}>${icon(ic)}${l}</a>`),
      `<button class="fab" data-action="add-entry" aria-label="Додати дані">${icon('plus')}</button>`,
      ...items.slice(2).map(([k, l, ic]) => `<a href="#/${k}" ${k === r ? 'aria-current="page"' : ''}>${icon(ic)}${l}</a>`),
    ].join('');
    $('[data-page-title]').textContent = TITLES[r];
  }

  function render() {
    const r = route();
    applySettings();
    renderShell(r);
    destroyCharts();
    const { html, after } = VIEWS[r]();
    $('#view').innerHTML = html;
    after && after();
  }

  const ACTIONS = {
    'add-entry': (el) => entryForm(null, el.dataset.channel || (state.ui.channel !== 'all' ? state.ui.channel : '')),
    'edit-entry': (el) => entryForm(state.entries.find((e) => e.id === el.dataset.id)),
    'add-deal': () => dealForm(),
    'edit-deal': (el) => dealForm(state.deals.find((d) => d.id === el.dataset.id)),
    'add-channel': () => channelForm(),
    'edit-channel': (el) => channelForm(channelById(el.dataset.id)),
    'close-sheet': closeSheet,
    period: (el) => { state.ui.period = el.dataset.value; save(); render(); },
    bucket: (el) => { state.ui.chartBucket = el.dataset.value; save(); render(); },
    sort: (el) => {
      const k = el.dataset.value;
      state.ui.sort = state.ui.sort.key === k ? { key: k, dir: -state.ui.sort.dir } : { key: k, dir: k === 'name' ? 1 : -1 };
      save(); render();
    },
    'deal-filter': (el) => { dealFilter = el.dataset.value; render(); },
    'journal-channel': (el) => { state.ui.channel = el.dataset.id; save(); },
    more: () => { journalLimit += 60; render(); },
    'toggle-theme': () => {
      const dark = document.documentElement.getAttribute('data-theme') === 'dark' || (state.settings.theme === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
      state.settings.theme = dark ? 'light' : 'dark'; save(); render();
    },
    theme: (el) => { state.settings.theme = el.dataset.value; save(); render(); },
    brand: (el) => { state.settings.brand = el.dataset.value; save(); render(); },
    'export-json': () => download(`webhjerte-backup-${today()}.json`, JSON.stringify(state, null, 2), 'application/json'),
    'import-json': () => $('#file-json').click(),
    'export-csv': exportCSV,
    'import-csv': () => $('#file-csv').click(),
    'csv-template': csvTemplate,
    demo: () => {
      if ((state.entries.length || state.deals.length) && !confirm('Демо-дані замінять поточні дані. Спершу зробіть бекап. Продовжити?')) return;
      state = demoData(); save(); render(); toast('Демо-дані завантажено');
    },
    reset: () => {
      if (!confirm('Видалити всі записи, клієнтів і канали? Це не можна скасувати.')) return;
      const s = defaultState(); s.settings = state.settings; state = s; save(); render(); toast('Дані очищено');
    },
  };

  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-action]');
    if (!el) return;
    const fn = ACTIONS[el.dataset.action];
    if (!fn) return;
    if (el.tagName !== 'A') e.preventDefault();
    fn(el, e);
  });
  document.addEventListener('change', (e) => {
    const el = e.target;
    if (el.dataset.change === 'filter-channel') { state.ui.channel = el.value; journalLimit = 60; save(); render(); return; }
    if (el.dataset.setting) {
      const k = el.dataset.setting;
      state.settings[k] = k === 'business' ? el.value.trim() || 'Webhjerte' : el.value;
      save(); render(); toast('Збережено ✓');
      return;
    }
    if (el.dataset.goal) { state.settings.goals[el.dataset.goal] = num(el.value); save(); toast('Ціль збережено ✓'); }
  });
  let searchTimer;
  document.addEventListener('input', (e) => {
    if (e.target.dataset.input !== 'journal-search') return;
    clearTimeout(searchTimer);
    const pos = e.target.selectionStart;
    searchTimer = setTimeout(() => {
      journalQuery = e.target.value; journalLimit = 60; render();
      const inp = $('[data-input="journal-search"]'); if (inp) { inp.focus(); inp.setSelectionRange(pos, pos); }
    }, 200);
  });

  const readFile = (input, cb) => input.addEventListener('change', () => {
    const f = input.files[0]; if (!f) return;
    const rd = new FileReader();
    rd.onload = () => { cb(String(rd.result)); input.value = ''; };
    rd.readAsText(f);
  });
  readFile($('#file-json'), (text) => {
    try {
      const data = JSON.parse(text);
      if (!data || !Array.isArray(data.entries)) throw new Error('bad');
      if (!confirm(`Відновити бекап: ${data.entries.length} записів, ${(data.deals || []).length} клієнтів? Поточні дані буде замінено.`)) return;
      state = normalize(data); save(); render(); toast('Бекап відновлено ✓');
    } catch { toast('Це не схоже на бекап Webhjerte'); }
  });
  readFile($('#file-csv'), importCSV);

  window.addEventListener('hashchange', () => { closeSheet(); render(); window.scrollTo(0, 0); });
  matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', () => { if (state.settings.theme === 'auto') render(); });
  window.addEventListener('storage', (e) => { if (e.key === STORE_KEY) { state = load(); render(); } });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'n' && !sheet.open && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName) && !e.metaKey && !e.ctrlKey) { e.preventDefault(); entryForm(null); }
  });

  $$('[data-icon]').forEach((el) => { if (!el.innerHTML) el.outerHTML = icon(el.getAttribute('data-icon')); });
  render();
})();
