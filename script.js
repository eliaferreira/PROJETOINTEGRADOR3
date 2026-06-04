/* =========================================================
   APP — Mapeamento de Acidentes de Trânsito ES
   Banco de dados estático: data/db.json
   ========================================================= */

const DB_URL = 'data/db.json';
const GEOJSON_URL = 'https://raw.githubusercontent.com/tbrugz/geodata-br/master/geojson/geojs-32-mun.json';

const fontFamily = "'Inter', sans-serif";
const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

let DB = null;
let municipios = [];

let mapaLeaflet     = null;
let geojsonLayer    = null;
let layerSelecionado = null;
const layersByName  = {};

let trendChart    = null;
let stackedChart  = null;
let doughnutChart = null;
let regionChart   = null;

/* ---------- Utils ---------- */
const _diacriticRe = new RegExp('[\\u0300-\\u036f]', 'g');
function normalizar(str) {
  return (str || '').normalize('NFD').replace(_diacriticRe, '').toLowerCase().trim();
}

function fmt(n) {
  return (n || 0).toLocaleString('pt-BR');
}

function buscarMunicipio(nome) {
  const n = normalizar(nome);
  return municipios.find(m => normalizar(m.nome) === n) || null;
}

function getCorRisco(risco) {
  if (risco === 'alto')  return '#dc2626';
  if (risco === 'medio') return '#ea580c';
  if (risco === 'baixo') return '#16a34a';
  return '#a3a3a3';
}

function corPorIndex(i) {
  const paleta = ['#003B6F', '#0060B0', '#ea580c', '#ca8a04', '#dc2626', '#16a34a', '#7c3aed', '#0284c7', '#a3a3a3', '#525252'];
  return paleta[i % paleta.length];
}

/* ---------- Hidratação dos índices / hero ---------- */
function hidratarIndices() {
  const t = DB.totais;

  // Hero counters — animate
  animarContador(document.getElementById('count1'), t.sinistros,      1800);
  animarContador(document.getElementById('count2'), t.vitimasFatais,  1400);
  animarContador(document.getElementById('count3'), t.municipios,      900);

  // Atualiza data-target (compat)
  document.getElementById('count1')?.setAttribute('data-target', t.sinistros);
  document.getElementById('count2')?.setAttribute('data-target', t.vitimasFatais);
  document.getElementById('count3')?.setAttribute('data-target', t.municipios);

  // Cards de métricas (por data-metric)
  const sets = {
    'sinistros':       fmt(t.sinistros),
    'sinistros-cv':    fmt(t.sinistrosComVitimas),
    'vitimas-fatais':  fmt(t.vitimasFatais),
    'vitimas-parciais':fmt(t.vitimasParciais),
    'municipios':      `${t.municipios} / 78`,
  };
  for (const [k, v] of Object.entries(sets)) {
    const el = document.querySelector(`[data-metric="${k}"]`);
    if (el) el.textContent = v;
  }

  // Fase do dia mais crítica
  const faseTotais = DB.mensal.reduce((acc, m) => {
    acc.amanhecer  += m.amanhecer;
    acc.plenoDia   += m.plenoDia;
    acc.anoitecer  += m.anoitecer;
    acc.plenaNoite += m.plenaNoite;
    return acc;
  }, { amanhecer: 0, plenoDia: 0, anoitecer: 0, plenaNoite: 0 });
  const labelFase = {
    amanhecer: 'Amanhecer', plenoDia: 'Pleno dia', anoitecer: 'Anoitecer', plenaNoite: 'Plena noite'
  };
  const fasePico = Object.entries(faseTotais).sort((a, b) => b[1] - a[1])[0];
  const elFase = document.querySelector('[data-metric="fase-pico"]');
  if (elFase) elFase.textContent = labelFase[fasePico[0]];
  const elFaseSub = document.querySelector('[data-metric="fase-pico-sub"]');
  if (elFaseSub) elFaseSub.textContent = `${fmt(fasePico[1])} sinistros`;

  // Subtítulo dos índices
  const subIndices = document.querySelector('[data-meta="periodo"]');
  if (subIndices) subIndices.textContent = `${DB.meta.periodo} — atualizado em ${DB.meta.atualizacao}`;

  // Hero stat labels
  const heroLabels = document.querySelectorAll('[data-hero-label]');
  heroLabels.forEach(el => {
    const key = el.getAttribute('data-hero-label');
    if (key === 'sinistros')      el.textContent = 'sinistros registrados (2024–2025)';
    if (key === 'fatais')         el.textContent = 'vítimas fatais';
    if (key === 'municipios')     el.textContent = 'municípios monitorados';
  });

  // Sobre — fonte / atualização (não muda layout, só preenche valores)
  const fonteEl = document.querySelector('[data-info="fonte"]');
  if (fonteEl) fonteEl.textContent = DB.meta.fontes.join(' e ');
  const atualEl = document.querySelector('[data-info="atualizacao"]');
  if (atualEl) atualEl.textContent = DB.meta.atualizacao;
}

/* ---------- Animação dos contadores ---------- */
function animarContador(el, target, duracao) {
  if (!el) return;
  const inicio = performance.now();
  const update = (agora) => {
    const progresso = Math.min((agora - inicio) / duracao, 1);
    const ease = 1 - Math.pow(1 - progresso, 3);
    const valor = Math.round(ease * target);
    el.textContent = valor.toLocaleString('pt-BR');
    if (progresso < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

/* ---------- Menu / nav / scroll ---------- */
function initNavBehavior() {
  const hamburger = document.getElementById('hamburger');
  const nav       = document.getElementById('nav');
  if (hamburger && nav) {
    hamburger.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      hamburger.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', isOpen);
    });
  }

  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      nav?.classList.remove('open');
      hamburger?.classList.remove('open');
      hamburger?.setAttribute('aria-expanded', false);
    });
  });

  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY + 100;
    sections.forEach(sec => {
      const top    = sec.offsetTop;
      const bottom = top + sec.offsetHeight;
      const id     = sec.getAttribute('id');
      const link   = document.querySelector(`.nav-link[href="#${id}"]`);
      if (link) link.classList.toggle('active', scrollPos >= top && scrollPos < bottom);
    });
  }, { passive: true });

  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const alvo = document.querySelector(link.getAttribute('href'));
      if (alvo) {
        e.preventDefault();
        const header = document.querySelector('.header');
        const alturaHeader = header ? header.offsetHeight : 70;
        const top = alvo.getBoundingClientRect().top + window.scrollY - alturaHeader - 16;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
}

/* ---------- Tabela ---------- */
function renderTabela(filtro) {
  const tbody = document.getElementById('tabelaBody');
  if (!tbody) return;

  const lista = filtro === 'todos'
    ? municipios
    : municipios.filter(m => m.risco === filtro);

  tbody.innerHTML = lista.map((m, i) => `
    <tr class="tabela-row" data-nome="${m.nome}" style="cursor:pointer">
      <td><span class="num-rank">${i + 1}</span></td>
      <td><span class="municipio-nome">${m.nome}</span></td>
      <td>${fmt(m.sinistros)}</td>
      <td>${m.fatalidades}</td>
      <td><span class="badge-risco badge-${m.risco}">${
        m.risco === 'alto'  ? 'Alto'  :
        m.risco === 'medio' ? 'Médio' : 'Baixo'
      }</span></td>
    </tr>
  `).join('');

  tbody.querySelectorAll('.tabela-row').forEach(tr => {
    tr.addEventListener('click', () => {
      const nome = tr.dataset.nome;
      const mun  = buscarMunicipio(nome);
      if (!mun) return;
      const entry = layersByName[normalizar(mun.nome)];
      if (entry) {
        mapaLeaflet.fitBounds(entry.layer.getBounds(), { padding: [40, 40], maxZoom: 12 });
        selecionarCidade(mun, entry.layer);
      } else {
        selecionarCidade(mun, null);
      }
    });
  });

  // Atualiza contador no botão "Todos"
  const btnTodos = document.querySelector('.filtro-btn[data-filter="todos"]');
  if (btnTodos) btnTodos.textContent = `Todos (${municipios.length})`;
}

function bindFiltros() {
  document.querySelectorAll('.filtro-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderTabela(btn.dataset.filter);
    });
  });
}

/* ---------- Mapa ---------- */
function estilizarFeature(feature) {
  const mun = buscarMunicipio(feature.properties.name || '');
  return {
    fillColor:   mun ? getCorRisco(mun.risco) : '#cbd5e1',
    fillOpacity: mun ? 0.60 : 0.18,
    color:       '#ffffff',
    weight:      1,
    opacity:     0.9,
  };
}
function destacarLayer(layer) {
  layer.setStyle({ fillOpacity: 0.88, weight: 2.5, color: '#003B6F' });
  layer.bringToFront();
}
function resetLayer(layer) {
  if (geojsonLayer) geojsonLayer.resetStyle(layer);
}

function inicializarMapa() {
  const container = document.getElementById('leaflet-map');
  if (!container || typeof L === 'undefined') return;

  mapaLeaflet = L.map('leaflet-map', {
    center: [-19.5, -40.6],
    zoom: 7,
    zoomControl: true,
    scrollWheelZoom: false,
  });

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '© OpenStreetMap contributors © CARTO',
    subdomains: 'abcd',
    maxZoom: 18,
  }).addTo(mapaLeaflet);

  const loadingEl = document.getElementById('mapaLoading');

  fetch(GEOJSON_URL)
    .then(r => { if (!r.ok) throw new Error('GeoJSON fetch failed'); return r.json(); })
    .then(data => {
      if (loadingEl) loadingEl.style.display = 'none';

      geojsonLayer = L.geoJSON(data, {
        style: estilizarFeature,
        onEachFeature: (feature, layer) => {
          const nome = feature.properties.name || '';
          const mun  = buscarMunicipio(nome);

          if (mun) layersByName[normalizar(mun.nome)] = { layer, mun };

          layer.on({
            mouseover(e) {
              if (layerSelecionado !== e.target) destacarLayer(e.target);
              const label = mun
                ? `<strong>${mun.nome}</strong><br>Sinistros: ${fmt(mun.sinistros)}<br>Fatalidades: ${mun.fatalidades}<br>Risco: ${mun.risco === 'alto' ? 'Alto' : mun.risco === 'medio' ? 'Médio' : 'Baixo'}`
                : `<strong>${nome}</strong>`;
              layer.bindTooltip(label, { direction: 'top', sticky: true, className: 'mapa-tooltip' }).openTooltip();
            },
            mouseout(e) {
              if (layerSelecionado !== e.target) resetLayer(e.target);
              layer.closeTooltip();
            },
            click() {
              if (mun) selecionarCidade(mun, layer);
            },
          });
        },
      }).addTo(mapaLeaflet);

      mapaLeaflet.fitBounds(geojsonLayer.getBounds(), { padding: [10, 10] });
    })
    .catch(err => {
      console.error('Erro ao carregar mapa:', err);
      if (loadingEl) loadingEl.textContent = 'Não foi possível carregar o mapa.';
    });
}

/* ---------- Painel de cidade ---------- */
function mostrarInfoCidade(mun) {
  const placeholder = document.getElementById('cityInfoPlaceholder');
  const content     = document.getElementById('cityInfoContent');
  if (!placeholder || !content) return;

  if (!mun) {
    placeholder.style.display = 'flex';
    content.style.display     = 'none';
    return;
  }
  placeholder.style.display = 'none';
  content.style.display     = 'block';

  const riscoLabel = mun.risco === 'alto' ? 'Alto' : mun.risco === 'medio' ? 'Médio' : 'Baixo';
  const taxaFatal  = mun.sinistros > 0 ? ((mun.fatalidades / mun.sinistros) * 100).toFixed(2) : '0,00';
  const rank       = municipios.findIndex(m => normalizar(m.nome) === normalizar(mun.nome)) + 1;

  content.innerHTML = `
    <div class="city-top">
      <span class="city-nome">${mun.nome}</span>
      <span class="badge-risco badge-${mun.risco}">${riscoLabel} risco</span>
      <span class="city-rank">#${rank} de ${municipios.length}</span>
    </div>
    <div class="city-stats-row">
      <div class="city-stat-item">
        <span class="city-stat-val">${fmt(mun.sinistros)}</span>
        <span class="city-stat-lbl">Sinistros</span>
      </div>
      <div class="city-stat-sep"></div>
      <div class="city-stat-item">
        <span class="city-stat-val">${mun.fatalidades}</span>
        <span class="city-stat-lbl">Fatalidades</span>
      </div>
      <div class="city-stat-sep"></div>
      <div class="city-stat-item">
        <span class="city-stat-val">${taxaFatal.replace('.', ',')}%</span>
        <span class="city-stat-lbl">Taxa fatal</span>
      </div>
    </div>
  `;

  atualizarGraficosParaCidade(mun);
}

function selecionarCidade(mun, layer) {
  if (layerSelecionado) resetLayer(layerSelecionado);
  layerSelecionado = layer;
  if (layer) destacarLayer(layer);

  mostrarInfoCidade(mun);

  document.querySelectorAll('#tabelaBody .tabela-row').forEach(tr => {
    const active = tr.dataset.nome === mun.nome;
    tr.classList.toggle('row-ativa', active);
    if (active) tr.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  });
}

/* =========================================================
   GRÁFICOS
   ========================================================= */

/* Helpers para datasets escalados pela razão cidade/estado */
function escalar(arr, ratio) {
  return arr.map(v => Math.round(v * ratio));
}
function ratioCidadeEstado(mun) {
  if (!mun || DB.totais.sinistros === 0) return 1;
  return mun.sinistros / DB.totais.sinistros;
}

/* --- 1. Tendência mensal (linha) --- */
function initTrendChart() {
  const canvas = document.getElementById('trendChart');
  if (!canvas) return;

  const totais     = DB.mensal.map(m => m.total);
  const comVitimas = DB.mensal.map(m => m.parcial + m.fatal);

  trendChart = new Chart(canvas.getContext('2d'), {
    type: 'line',
    data: {
      labels: meses,
      datasets: [
        {
          label: 'Total de sinistros',
          data: totais,
          borderColor: '#0060B0',
          backgroundColor: 'rgba(0,96,176,0.10)',
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: '#0060B0',
          borderWidth: 2.5,
        },
        {
          label: 'Sinistros com vítimas',
          data: comVitimas,
          borderColor: '#dc2626',
          backgroundColor: 'transparent',
          fill: false,
          tension: 0.4,
          pointRadius: 3,
          pointBackgroundColor: '#dc2626',
          borderWidth: 2,
          borderDash: [6, 4],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { intersect: false, mode: 'index' },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1a1a2e',
          titleFont: { family: "'Syne', sans-serif", size: 13, weight: '600' },
          bodyFont:  { family: fontFamily, size: 12 },
          padding: 12,
          cornerRadius: 8,
          callbacks: { label: ctx => ` ${ctx.dataset.label}: ${fmt(ctx.parsed.y)}` }
        },
      },
      scales: {
        x: { grid: { display: false }, ticks: { font: { family: fontFamily, size: 11 }, color: '#71717a' } },
        y: { grid: { color: 'rgba(0,0,0,0.05)' }, border: { display: false }, ticks: { font: { family: fontFamily, size: 11 }, color: '#71717a' } },
      },
    },
  });
}

/* --- 2. Mês × Gravidade (barras empilhadas) --- */
function initStackedChart() {
  const canvas = document.getElementById('stackedChart');
  if (!canvas) return;

  const semVitima = DB.mensal.map(m => m.semVitima);
  const parcial   = DB.mensal.map(m => m.parcial);
  const fatal     = DB.mensal.map(m => m.fatal);

  stackedChart = new Chart(canvas.getContext('2d'), {
    type: 'bar',
    data: {
      labels: meses,
      datasets: [
        { label: 'Sem vítima',  data: semVitima, backgroundColor: '#0060B0' },
        { label: 'Com vítimas', data: parcial,   backgroundColor: '#ea580c' },
        { label: 'Fatal',       data: fatal,     backgroundColor: '#dc2626' },
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8, font: { family: fontFamily, size: 11 } } },
        tooltip: {
          backgroundColor: '#1a1a2e',
          titleFont: { family: "'Syne', sans-serif", size: 13, weight: '600' },
          bodyFont:  { family: fontFamily, size: 12 },
          padding: 12,
          cornerRadius: 8,
          callbacks: { label: ctx => ` ${ctx.dataset.label}: ${fmt(ctx.parsed.y)}` }
        }
      },
      scales: {
        x: { stacked: true, grid: { display: false }, ticks: { font: { family: fontFamily, size: 11 }, color: '#71717a' } },
        y: { stacked: true, grid: { color: 'rgba(0,0,0,0.05)' }, border: { display: false }, ticks: { font: { family: fontFamily, size: 11 }, color: '#71717a' } }
      }
    }
  });
}

/* --- 3. Veículos envolvidos (rosca) --- */
function topVeiculos() {
  // Exclui "Sem Informação" (sentinela), pega top 5 + agrega o resto
  const lista = DB.veiculos.filter(v => !/sem informa/i.test(v.label));
  const ordenado = [...lista].sort((a, b) => b.total - a.total);
  const top = ordenado.slice(0, 5);
  const restoSoma = ordenado.slice(5).reduce((s, v) => s + v.total, 0);
  const labels = top.map(v => v.label);
  const valores = top.map(v => v.total);
  if (restoSoma > 0) { labels.push('Outros'); valores.push(restoSoma); }
  return { labels, valores };
}

function initDoughnutChart() {
  const canvas = document.getElementById('doughnutChart');
  if (!canvas) return;

  const { labels, valores } = topVeiculos();

  doughnutChart = new Chart(canvas.getContext('2d'), {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data: valores,
        backgroundColor: labels.map((_, i) => corPorIndex(i)),
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '70%',
      plugins: {
        legend: { position: 'right', labels: { usePointStyle: true, boxWidth: 8, font: { family: fontFamily, size: 11 } } },
        tooltip: {
          backgroundColor: '#1a1a2e',
          titleFont: { family: "'Syne', sans-serif", size: 13, weight: '600' },
          bodyFont:  { family: fontFamily, size: 12 },
          padding: 12,
          cornerRadius: 8,
          callbacks: { label: ctx => ` ${ctx.label}: ${fmt(ctx.parsed)}` }
        }
      }
    }
  });
}

/* --- 4. Sinistros por região (barras horizontais) — sempre estado --- */
function initRegionChart() {
  const canvas = document.getElementById('regionChart');
  if (!canvas) return;

  const regs = DB.regioes
    .filter(r => !/sem informa/i.test(r.nome))
    .sort((a, b) => b.sinistros - a.sinistros);

  regionChart = new Chart(canvas.getContext('2d'), {
    type: 'bar',
    data: {
      labels: regs.map(r => r.nome),
      datasets: [{
        label: 'Sinistros',
        data: regs.map(r => r.sinistros),
        backgroundColor: regs.map((_, i) => corPorIndex(i)),
        borderRadius: 6,
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1a1a2e',
          titleFont: { family: "'Syne', sans-serif", size: 13, weight: '600' },
          bodyFont:  { family: fontFamily, size: 12 },
          padding: 12,
          cornerRadius: 8,
          callbacks: { label: ctx => ` ${fmt(ctx.parsed.x)} sinistros` }
        }
      },
      scales: {
        x: { grid: { color: 'rgba(0,0,0,0.05)' }, border: { display: false }, ticks: { font: { family: fontFamily, size: 11 }, color: '#71717a' } },
        y: { grid: { display: false }, ticks: { font: { family: fontFamily, size: 11 }, color: '#71717a' } }
      }
    }
  });
}

/* --- Reset gráficos para estado --- */
function resetarGraficosEstado() {
  if (!trendChart || !stackedChart || !doughnutChart) return;

  trendChart.data.datasets[0].data = DB.mensal.map(m => m.total);
  trendChart.data.datasets[1].data = DB.mensal.map(m => m.parcial + m.fatal);
  trendChart.update();

  stackedChart.data.datasets[0].data = DB.mensal.map(m => m.semVitima);
  stackedChart.data.datasets[1].data = DB.mensal.map(m => m.parcial);
  stackedChart.data.datasets[2].data = DB.mensal.map(m => m.fatal);
  stackedChart.update();

  const { labels, valores } = topVeiculos();
  doughnutChart.data.labels = labels;
  doughnutChart.data.datasets[0].data = valores;
  doughnutChart.data.datasets[0].backgroundColor = labels.map((_, i) => corPorIndex(i));
  doughnutChart.update();

  setChartTitles('Espírito Santo');
}

/* --- Atualizar gráficos para uma cidade --- */
function atualizarGraficosParaCidade(mun) {
  if (!trendChart || !stackedChart || !doughnutChart) return;

  const ratio = ratioCidadeEstado(mun);

  trendChart.data.datasets[0].data = escalar(DB.mensal.map(m => m.total), ratio);
  trendChart.data.datasets[1].data = escalar(DB.mensal.map(m => m.parcial + m.fatal), ratio);
  trendChart.update();

  stackedChart.data.datasets[0].data = escalar(DB.mensal.map(m => m.semVitima), ratio);
  stackedChart.data.datasets[1].data = escalar(DB.mensal.map(m => m.parcial),   ratio);
  stackedChart.data.datasets[2].data = escalar(DB.mensal.map(m => m.fatal),     ratio);
  stackedChart.update();

  const { labels, valores } = topVeiculos();
  doughnutChart.data.labels = labels;
  doughnutChart.data.datasets[0].data = escalar(valores, ratio);
  doughnutChart.data.datasets[0].backgroundColor = labels.map((_, i) => corPorIndex(i));
  doughnutChart.update();

  setChartTitles(mun.nome);
}

function setChartTitles(local) {
  const el1 = document.getElementById('chartTitle');
  if (el1) el1.textContent = `Evolução mensal — ${local}`;
  const el2 = document.getElementById('stackedTitle');
  if (el2) el2.textContent = `Sinistros mensais por gravidade — ${local}`;
  const el3 = document.getElementById('doughnutTitle');
  if (el3) el3.textContent = `Veículos envolvidos — ${local}`;
}

/* =========================================================
   BOOTSTRAP
   ========================================================= */
function mostrarErroCarregamento(msg) {
  const errBox = document.createElement('div');
  errBox.style.cssText = 'position:fixed;top:80px;left:50%;transform:translateX(-50%);background:#fee2e2;color:#991b1b;padding:1rem 1.5rem;border-radius:8px;border:1px solid #fecaca;font-family:Inter,sans-serif;font-size:14px;z-index:99999;max-width:500px;';
  errBox.innerHTML = `<strong>Erro ao carregar dados</strong><br>${msg || 'Não foi possível carregar data/db.json'}`;
  document.body.appendChild(errBox);
}

async function main() {
  initNavBehavior();

  try {
    const resp = await fetch(DB_URL, { cache: 'no-cache' });
    if (!resp.ok) throw new Error('HTTP ' + resp.status + ' ao carregar ' + DB_URL);
    DB = await resp.json();
  } catch (err) {
    console.error(err);
    mostrarErroCarregamento(err.message);
    return;
  }

  municipios = DB.municipios.slice().sort((a, b) => b.sinistros - a.sinistros);

  hidratarIndices();
  renderTabela('todos');
  bindFiltros();
  inicializarMapa();
  initTrendChart();
  initStackedChart();
  initDoughnutChart();
  initRegionChart();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}
