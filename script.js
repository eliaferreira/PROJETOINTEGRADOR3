/* ---------- MENU HAMBURGUER ---------- */
const hamburger = document.getElementById('hamburger');
const nav       = document.getElementById('nav');

hamburger.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('open');
  hamburger.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', isOpen);
});

document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    nav.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', false);
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
    if (link) {
      link.classList.toggle('active', scrollPos >= top && scrollPos < bottom);
    }
  });
}, { passive: true });


/* ---------- CONTADOR ANIMADO ---------- */
function animarContador(el, target, duracao) {
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

const heroStats = document.querySelector('.hero-stats');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animarContador(document.getElementById('count1'), 14382, 1800);
      animarContador(document.getElementById('count2'),   412, 1400);
      animarContador(document.getElementById('count3'),    78,  900);
      observer.disconnect();
    }
  });
}, { threshold: 0.3 });

if (heroStats) observer.observe(heroStats);


/* ---------- DADOS DOS MUNICÍPIOS ---------- */
const municipios = [
  { nome: 'Vitória',                 acidentes: 3241, fatalidades: 58, risco: 'alto'  },
  { nome: 'Serra',                   acidentes: 2876, fatalidades: 51, risco: 'alto'  },
  { nome: 'Vila Velha',              acidentes: 2514, fatalidades: 44, risco: 'alto'  },
  { nome: 'Cariacica',               acidentes: 1987, fatalidades: 36, risco: 'medio' },
  { nome: 'Cachoeiro de Itapemirim', acidentes: 1203, fatalidades: 24, risco: 'medio' },
  { nome: 'Linhares',                acidentes:  892, fatalidades: 18, risco: 'baixo' },
  { nome: 'São Mateus',              acidentes:  643, fatalidades: 12, risco: 'baixo' },
  { nome: 'Colatina',                acidentes:  521, fatalidades:  9, risco: 'baixo' },
  { nome: 'Guarapari',               acidentes:  487, fatalidades:  8, risco: 'baixo' },
  { nome: 'Aracruz',                 acidentes:  398, fatalidades:  7, risco: 'baixo' },
];

/* ---------- TABELA ---------- */
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
      <td>${m.acidentes.toLocaleString('pt-BR')}</td>
      <td>${m.fatalidades}</td>
      <td><span class="badge-risco badge-${m.risco}">${
        m.risco === 'alto'  ? 'Alto'  :
        m.risco === 'medio' ? 'Médio' : 'Baixo'
      }</span></td>
    </tr>
  `).join('');

  // Bind click on each row
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
}

renderTabela('todos');

document.querySelectorAll('.filtro-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderTabela(btn.dataset.filter);
  });
});


/* ---------- SCROLL SUAVE ---------- */
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


/* =========================================================
   MAPA LEAFLET
   ========================================================= */
const GEOJSON_URL = 'https://raw.githubusercontent.com/tbrugz/geodata-br/master/geojson/geojs-32-mun.json';

let mapaLeaflet   = null;
let geojsonLayer  = null;
let layerSelecionado = null;
const layersByName   = {};   // normalizedName → { layer, mun }

function normalizar(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
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

/* ---- City info panel ---- */
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
  const taxaFatal  = ((mun.fatalidades / mun.acidentes) * 100).toFixed(1);

  content.innerHTML = `
    <div class="city-top">
      <span class="city-nome">${mun.nome}</span>
      <span class="badge-risco badge-${mun.risco}">${riscoLabel} risco</span>
    </div>
    <div class="city-stats-row">
      <div class="city-stat-item">
        <span class="city-stat-val">${mun.acidentes.toLocaleString('pt-BR')}</span>
        <span class="city-stat-lbl">Acidentes</span>
      </div>
      <div class="city-stat-sep"></div>
      <div class="city-stat-item">
        <span class="city-stat-val">${mun.fatalidades}</span>
        <span class="city-stat-lbl">Fatalidades</span>
      </div>
      <div class="city-stat-sep"></div>
      <div class="city-stat-item">
        <span class="city-stat-val">${taxaFatal}%</span>
        <span class="city-stat-lbl">Taxa fatal</span>
      </div>
    </div>
  `;

  atualizarGrafico(mun);
}

/* ---- Select city (map + table sync) ---- */
function selecionarCidade(mun, layer) {
  // Reset previous highlight
  if (layerSelecionado) resetLayer(layerSelecionado);
  layerSelecionado = layer;
  if (layer) destacarLayer(layer);

  mostrarInfoCidade(mun);

  // Highlight table row
  document.querySelectorAll('#tabelaBody .tabela-row').forEach(tr => {
    const active = tr.dataset.nome === mun.nome;
    tr.classList.toggle('row-ativa', active);
    if (active) tr.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  });
}

/* ---- Initialize Leaflet ---- */
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
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 18,
  }).addTo(mapaLeaflet);

  // Loading indicator
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
                ? `<strong>${mun.nome}</strong><br>Acidentes: ${mun.acidentes.toLocaleString('pt-BR')}<br>Risco: ${mun.risco === 'alto' ? 'Alto' : mun.risco === 'medio' ? 'Médio' : 'Baixo'}`
                : `<strong>${nome}</strong>`;
              layer.bindTooltip(label, { direction: 'top', sticky: true, className: 'mapa-tooltip' }).openTooltip();
            },
            mouseout(e) {
              if (layerSelecionado !== e.target) resetLayer(e.target);
              layer.closeTooltip();
            },
            click() {
              if (mun) {
                selecionarCidade(mun, layer);
              }
            },
          });
        },
      }).addTo(mapaLeaflet);

      // Fit map to ES bounds
      mapaLeaflet.fitBounds(geojsonLayer.getBounds(), { padding: [10, 10] });
    })
    .catch(err => {
      console.error('Erro ao carregar mapa:', err);
      if (loadingEl) loadingEl.textContent = 'Não foi possível carregar o mapa. Verifique sua conexão.';
    });
}


/* =========================================================
   GRÁFICO DE TENDÊNCIA (Chart.js)
   ========================================================= */
let trendChart = null;
const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

// Distribui total anual com sazonalidade realista (pico no 2º semestre)
const pesosMensais = [0.072, 0.068, 0.082, 0.080, 0.087, 0.092, 0.091, 0.090, 0.086, 0.085, 0.079, 0.088];

function gerarMensais(total, ruido = true) {
  return pesosMensais.map(p => {
    const base = Math.round(total * p);
    return ruido ? base + Math.floor((Math.random() - 0.5) * base * 0.08) : base;
  });
}

function gerarMensaisAnoAnterior(total, variacaoPercent) {
  const totalAnterior = Math.round(total / (1 + variacaoPercent / 100));
  return gerarMensais(totalAnterior, true);
}

function inicializarGrafico() {
  const canvas = document.getElementById('trendChart');
  if (!canvas || typeof Chart === 'undefined') return;

  const totalES    = 14382;
  const dados2025  = gerarMensais(totalES, false);
  const dados2024  = gerarMensaisAnoAnterior(totalES, 3.2);

  const fontFamily = "'Inter', sans-serif";

  trendChart = new Chart(canvas.getContext('2d'), {
    type: 'line',
    data: {
      labels: meses,
      datasets: [
        {
          label: 'Espírito Santo — 2025',
          data: dados2025,
          borderColor: '#0060B0',
          backgroundColor: 'rgba(0,96,176,0.10)',
          fill: true,
          tension: 0.45,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: '#0060B0',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          borderWidth: 2.5,
        },
        {
          label: 'Espírito Santo — 2024',
          data: dados2024,
          borderColor: '#a3a3a3',
          backgroundColor: 'transparent',
          fill: false,
          tension: 0.45,
          pointRadius: 3,
          pointHoverRadius: 5,
          pointBackgroundColor: '#a3a3a3',
          borderWidth: 1.5,
          borderDash: [6, 4],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { intersect: false, mode: 'index' },
      plugins: {
        legend: {
          position: 'top',
          align: 'end',
          labels: {
            font: { family: fontFamily, size: 12 },
            usePointStyle: true,
            pointStyleWidth: 10,
            boxHeight: 6,
            color: '#52525b',
            padding: 16,
          },
        },
        tooltip: {
          backgroundColor: '#1a1a2e',
          titleFont: { family: "'Syne', sans-serif", size: 13, weight: '600' },
          bodyFont:  { family: fontFamily, size: 12 },
          padding: 12,
          cornerRadius: 8,
          callbacks: {
            label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y.toLocaleString('pt-BR')} acidentes`,
          },
        },
      },
      scales: {
        x: {
          grid: { color: 'rgba(0,0,0,0.04)', drawBorder: false },
          ticks: { font: { family: fontFamily, size: 12 }, color: '#71717a', padding: 6 },
          border: { dash: [4, 4], color: 'transparent' },
        },
        y: {
          grid: { color: 'rgba(0,0,0,0.05)', drawBorder: false },
          ticks: {
            font: { family: fontFamily, size: 11 },
            color: '#71717a',
            padding: 8,
            callback: v => v.toLocaleString('pt-BR'),
          },
          border: { display: false },
        },
      },
    },
  });
}

function atualizarGrafico(mun) {
  if (!trendChart) return;

  const variacao = mun.risco === 'alto' ? 3.2 : mun.risco === 'medio' ? 1.5 : -2.1;
  const dados2025 = gerarMensais(mun.acidentes, true);
  const dados2024 = gerarMensaisAnoAnterior(mun.acidentes, variacao);

  trendChart.data.datasets[0].label = `${mun.nome} — 2025`;
  trendChart.data.datasets[0].data  = dados2025;
  trendChart.data.datasets[1].label = `${mun.nome} — 2024`;
  trendChart.data.datasets[1].data  = dados2024;
  trendChart.update('active');

  // Update chart title
  const chartTitle = document.getElementById('chartTitle');
  const chartSub   = document.getElementById('chartSub');
  if (chartTitle) chartTitle.textContent = `Evolução mensal — ${mun.nome}`;
  if (chartSub)   chartSub.textContent   = 'Comparativo 2024 vs 2025 · clique em outro município para atualizar';
}

/* ---- Init everything on DOMContentLoaded ---- */
document.addEventListener('DOMContentLoaded', () => {
  inicializarMapa();
  inicializarGrafico();
});