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


/* ---------- DADOS DOS MUNICÍPIOS (78 CIDADES - 100% ESTÁTICO) ---------- */
const municipios = [
  { nome: 'Vitória', acidentes: 3241, fatalidades: 58, risco: 'alto' },
  { nome: 'Serra', acidentes: 2876, fatalidades: 51, risco: 'alto' },
  { nome: 'Vila Velha', acidentes: 2514, fatalidades: 44, risco: 'alto' },
  { nome: 'Cariacica', acidentes: 1987, fatalidades: 36, risco: 'medio' },
  { nome: 'Cachoeiro de Itapemirim', acidentes: 1203, fatalidades: 24, risco: 'medio' },
  { nome: 'Linhares', acidentes: 892, fatalidades: 18, risco: 'baixo' },
  { nome: 'São Mateus', acidentes: 643, fatalidades: 12, risco: 'baixo' },
  { nome: 'Colatina', acidentes: 521, fatalidades: 9, risco: 'baixo' },
  { nome: 'Guarapari', acidentes: 487, fatalidades: 8, risco: 'baixo' },
  { nome: 'Aracruz', acidentes: 398, fatalidades: 7, risco: 'baixo' },
  { nome: 'Viana', acidentes: 310, fatalidades: 6, risco: 'medio' },
  { nome: 'Nova Venécia', acidentes: 285, fatalidades: 5, risco: 'baixo' },
  { nome: 'Barra de São Francisco', acidentes: 242, fatalidades: 4, risco: 'baixo' },
  { nome: 'Santa Maria de Jetibá', acidentes: 215, fatalidades: 3, risco: 'baixo' },
  { nome: 'Castelo', acidentes: 198, fatalidades: 3, risco: 'baixo' },
  { nome: 'Marataízes', acidentes: 188, fatalidades: 3, risco: 'baixo' },
  { nome: 'São Gabriel da Palha', acidentes: 175, fatalidades: 2, risco: 'baixo' },
  { nome: 'Jaguaré', acidentes: 168, fatalidades: 3, risco: 'baixo' },
  { nome: 'Anchieta', acidentes: 162, fatalidades: 2, risco: 'baixo' },
  { nome: 'Itapemirim', acidentes: 158, fatalidades: 4, risco: 'baixo' },
  { nome: 'São Roque do Canaã', acidentes: 145, fatalidades: 3, risco: 'baixo' },
  { nome: 'Alegre', acidentes: 138, fatalidades: 2, risco: 'baixo' },
  { nome: 'Baixo Guandu', acidentes: 125, fatalidades: 2, risco: 'baixo' },
  { nome: 'Sooretama', acidentes: 122, fatalidades: 5, risco: 'baixo' },
  { nome: 'Guaçuí', acidentes: 118, fatalidades: 2, risco: 'baixo' },
  { nome: 'Ibatiba', acidentes: 112, fatalidades: 3, risco: 'baixo' },
  { nome: 'Pinheiros', acidentes: 108, fatalidades: 2, risco: 'baixo' },
  { nome: 'Pedro Canário', acidentes: 104, fatalidades: 3, risco: 'baixo' },
  { nome: 'Mimoso do Sul', acidentes: 98, fatalidades: 2, risco: 'baixo' },
  { nome: 'Ecoporanga', acidentes: 95, fatalidades: 2, risco: 'baixo' },
  { nome: 'Venda Nova do Imigrante', acidentes: 92, fatalidades: 1, risco: 'baixo' },
  { nome: 'Pancas', acidentes: 88, fatalidades: 2, risco: 'baixo' },
  { nome: 'Santa Teresa', acidentes: 85, fatalidades: 1, risco: 'baixo' },
  { nome: 'Montanha', acidentes: 82, fatalidades: 2, risco: 'baixo' },
  { nome: 'Afonso Cláudio', acidentes: 79, fatalidades: 1, risco: 'baixo' },
  { nome: 'Domingos Martins', acidentes: 77, fatalidades: 2, risco: 'baixo' },
  { nome: 'Conceição da Barra', acidentes: 75, fatalidades: 3, risco: 'baixo' },
  { nome: 'Ibiraçu', acidentes: 72, fatalidades: 1, risco: 'baixo' },
  { nome: 'João Neiva', acidentes: 68, fatalidades: 1, risco: 'baixo' },
  { nome: 'Muqui', acidentes: 65, fatalidades: 1, risco: 'baixo' },
  { nome: 'Vargem Alta', acidentes: 62, fatalidades: 1, risco: 'baixo' },
  { nome: 'Iúna', acidentes: 60, fatalidades: 1, risco: 'baixo' },
  { nome: 'Piúma', acidentes: 58, fatalidades: 2, risco: 'baixo' },
  { nome: 'Presidente Kennedy', acidentes: 55, fatalidades: 2, risco: 'baixo' },
  { nome: 'Boa Esperança', acidentes: 52, fatalidades: 1, risco: 'baixo' },
  { nome: 'Rio Bananal', acidentes: 49, fatalidades: 1, risco: 'baixo' },
  { nome: 'Alfredo Chaves', acidentes: 47, fatalidades: 1, risco: 'baixo' },
  { nome: 'Iconha', acidentes: 45, fatalidades: 1, risco: 'baixo' },
  { nome: 'Fundão', acidentes: 43, fatalidades: 1, risco: 'baixo' },
  { nome: 'Itarana', acidentes: 41, fatalidades: 0, risco: 'baixo' },
  { nome: 'Marechal Floriano', acidentes: 39, fatalidades: 1, risco: 'baixo' },
  { nome: 'Jerônimo Monteiro', acidentes: 37, fatalidades: 1, risco: 'baixo' },
  { nome: 'Muniz Freire', acidentes: 35, fatalidades: 1, risco: 'baixo' },
  { nome: 'Itaguaçu', acidentes: 33, fatalidades: 0, risco: 'baixo' },
  { nome: 'Santa Leopoldina', acidentes: 31, fatalidades: 1, risco: 'baixo' },
  { nome: 'São José do Calçado', acidentes: 29, fatalidades: 0, risco: 'baixo' },
  { nome: 'Vila Valério', acidentes: 27, fatalidades: 0, risco: 'baixo' },
  { nome: 'Atílio Vivácqua', acidentes: 25, fatalidades: 1, risco: 'baixo' },
  { nome: 'Rio Novo do Sul', acidentes: 23, fatalidades: 0, risco: 'baixo' },
  { nome: 'Marilândia', acidentes: 21, fatalidades: 0, risco: 'baixo' },
  { nome: 'Governador Lindenberg', acidentes: 19, fatalidades: 0, risco: 'baixo' },
  { nome: 'São Domingos do Norte', acidentes: 17, fatalidades: 0, risco: 'baixo' },
  { nome: 'Brejetuba', acidentes: 15, fatalidades: 1, risco: 'baixo' },
  { nome: 'Água Doce do Norte', acidentes: 13, fatalidades: 0, risco: 'baixo' },
  { nome: 'Laranja da Terra', acidentes: 12, fatalidades: 0, risco: 'baixo' },
  { nome: 'Conceição do Castelo', acidentes: 11, fatalidades: 0, risco: 'baixo' },
  { nome: 'Irupi', acidentes: 10, fatalidades: 0, risco: 'baixo' },
  { nome: 'Mantenópolis', acidentes: 9, fatalidades: 0, risco: 'baixo' },
  { nome: 'Apiacá', acidentes: 8, fatalidades: 0, risco: 'baixo' },
  { nome: 'Bom Jesus do Norte', acidentes: 7, fatalidades: 0, risco: 'baixo' },
  { nome: 'Águia Branca', acidentes: 6, fatalidades: 0, risco: 'baixo' },
  { nome: 'Vila Pavão', acidentes: 5, fatalidades: 0, risco: 'baixo' },
  { nome: 'Alto Rio Novo', acidentes: 4, fatalidades: 0, risco: 'baixo' },
  { nome: 'Ponto Belo', acidentes: 3, fatalidades: 0, risco: 'baixo' },
  { nome: 'Ibitirama', acidentes: 3, fatalidades: 0, risco: 'baixo' },
  { nome: 'Dores do Rio Preto', acidentes: 2, fatalidades: 0, risco: 'baixo' },
  { nome: 'Mucurici', acidentes: 2, fatalidades: 0, risco: 'baixo' },
  { nome: 'Divino de São Lourenço', acidentes: 1, fatalidades: 0, risco: 'baixo' }
].sort((a, b) => b.acidentes - a.acidentes);


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
    
    // Atualiza texto do botão "Todos" para mostrar quantidade
    const txt = btn.dataset.filter === 'todos' ? 'Todos (78)' : btn.textContent;
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
const layersByName   = {};

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

  atualizarGraficos(mun);
}

/* ---- Select city (map + table sync) ---- */
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

      mapaLeaflet.fitBounds(geojsonLayer.getBounds(), { padding: [10, 10] });
    })
    .catch(err => {
      console.error('Erro ao carregar mapa:', err);
      if (loadingEl) loadingEl.textContent = 'Não foi possível carregar o mapa.';
    });
}


/* =========================================================
   GRÁFICOS (Chart.js) COM CÁLCULOS DETERMINÍSTICOS (ESTÁTICOS)
   ========================================================= */
let trendChart = null;
let stackedChart = null;
let doughnutChart = null;
const fontFamily = "'Inter', sans-serif";

const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const pesosMensais = [0.072, 0.068, 0.082, 0.080, 0.087, 0.092, 0.091, 0.090, 0.086, 0.085, 0.079, 0.088];

// Removida a aleatoriedade (Math.random). Agora os dados serão sempre calculados com a mesma proporção.
function gerarMensais(total) {
  return pesosMensais.map(p => Math.round(total * p));
}

function gerarMensaisAnoAnterior(total, variacaoPercent) {
  const totalAnterior = Math.round(total / (1 + variacaoPercent / 100));
  return gerarMensais(totalAnterior);
}

// Proporções fixas para gerar as colunas empilhadas (Horários)
function gerarDadosHorarios(total) {
  const prop = [0.15, 0.25, 0.20, 0.40];
  const leves = prop.map(p => Math.round(total * p * 0.7)); 
  const graves = prop.map(p => Math.round(total * p * 0.3)); 
  return { leves, graves };
}

// Proporções fixas para gerar os dados do gráfico de Rosca (Veículos)
function gerarDadosVeiculos(total) {
  return [
    Math.round(total * 0.45), // Carros 
    Math.round(total * 0.35), // Motos 
    Math.round(total * 0.12), // Caminhões 
    Math.round(total * 0.08)  // Outros 
  ];
}


// --- Inicialização Gráfico 1: Linha ---
function inicializarTrendChart() {
  const canvas = document.getElementById('trendChart');
  if (!canvas) return;

  const totalES    = 14382;
  const dados2025  = gerarMensais(totalES);
  const dados2024  = gerarMensaisAnoAnterior(totalES, 3.2);

  trendChart = new Chart(canvas.getContext('2d'), {
    type: 'line',
    data: {
      labels: meses,
      datasets: [
        {
          label: '2025',
          data: dados2025,
          borderColor: '#0060B0',
          backgroundColor: 'rgba(0,96,176,0.10)',
          fill: true,
          tension: 0.45,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: '#0060B0',
          borderWidth: 2.5,
        },
        {
          label: '2024',
          data: dados2024,
          borderColor: '#a3a3a3',
          backgroundColor: 'transparent',
          fill: false,
          tension: 0.45,
          pointRadius: 2,
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
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1a1a2e',
          titleFont: { family: "'Syne', sans-serif", size: 13, weight: '600' },
          bodyFont:  { family: fontFamily, size: 12 },
          padding: 12,
          cornerRadius: 8,
          callbacks: { label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y.toLocaleString('pt-BR')}` }
        },
      },
      scales: {
        x: { grid: { display: false }, ticks: { font: { family: fontFamily, size: 11 }, color: '#71717a' } },
        y: { grid: { color: 'rgba(0,0,0,0.05)' }, border: { display: false }, ticks: { font: { family: fontFamily, size: 11 }, color: '#71717a' } },
      },
    },
  });
}

// --- Inicialização Gráfico 2: Colunas Empilhadas ---
function inicializarStackedChart() {
  const canvas = document.getElementById('stackedChart');
  if (!canvas) return;

  const dadosIniciais = gerarDadosHorarios(14382);

  stackedChart = new Chart(canvas.getContext('2d'), {
    type: 'bar',
    data: {
      labels: ['00h-06h', '06h-12h', '12h-18h', '18h-24h'],
      datasets: [
        {
          label: 'Acidentes Graves/Fatais',
          data: dadosIniciais.graves,
          backgroundColor: '#dc2626', 
        },
        {
          label: 'Sem Vítimas',
          data: dadosIniciais.leves,
          backgroundColor: '#0060B0', 
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { 
          position: 'bottom',
          labels: { usePointStyle: true, boxWidth: 8, font: { family: fontFamily, size: 11 } }
        },
        tooltip: {
          backgroundColor: '#1a1a2e',
          titleFont: { family: "'Syne', sans-serif", size: 13, weight: '600' },
          bodyFont:  { family: fontFamily, size: 12 },
          padding: 12,
          cornerRadius: 8,
        }
      },
      scales: {
        x: { 
          stacked: true, 
          grid: { display: false }, 
          ticks: { font: { family: fontFamily, size: 11 }, color: '#71717a' } 
        },
        y: { 
          stacked: true, 
          grid: { color: 'rgba(0,0,0,0.05)' }, 
          border: { display: false },
          ticks: { font: { family: fontFamily, size: 11 }, color: '#71717a' } 
        }
      }
    }
  });
}

// --- Inicialização Gráfico 3: Rosca (Doughnut) ---
function inicializarDoughnutChart() {
  const canvas = document.getElementById('doughnutChart');
  if (!canvas) return;

  const dadosIniciais = gerarDadosVeiculos(14382);

  doughnutChart = new Chart(canvas.getContext('2d'), {
    type: 'doughnut',
    data: {
      labels: ['Carros', 'Motos', 'Caminhões', 'Outros'],
      datasets: [{
        data: dadosIniciais,
        backgroundColor: ['#003B6F', '#ea580c', '#ca8a04', '#a3a3a3'],
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '70%',
      plugins: {
        legend: { 
          position: 'right',
          labels: { usePointStyle: true, boxWidth: 8, font: { family: fontFamily, size: 11 } }
        },
        tooltip: {
          backgroundColor: '#1a1a2e',
          titleFont: { family: "'Syne', sans-serif", size: 13, weight: '600' },
          bodyFont:  { family: fontFamily, size: 12 },
          padding: 12,
          cornerRadius: 8,
        }
      }
    }
  });
}


// --- Atualização Sincronizada dos Gráficos ---
function atualizarGraficos(mun) {
  if (!trendChart || !stackedChart || !doughnutChart) return;

  // 1. Atualizar Linha Temporal
  const variacao = mun.risco === 'alto' ? 3.2 : mun.risco === 'medio' ? 1.5 : -2.1;
  const dados2025 = gerarMensais(mun.acidentes);
  const dados2024 = gerarMensaisAnoAnterior(mun.acidentes, variacao);

  trendChart.data.datasets[0].data  = dados2025;
  trendChart.data.datasets[1].data  = dados2024;
  trendChart.update();

  const chartTitle = document.getElementById('chartTitle');
  if (chartTitle) chartTitle.textContent = `Evolução mensal — ${mun.nome}`;

  // 2. Atualizar Colunas Empilhadas (Horários)
  const dadosHorarios = gerarDadosHorarios(mun.acidentes);
  stackedChart.data.datasets[0].data = dadosHorarios.graves;
  stackedChart.data.datasets[1].data = dadosHorarios.leves;
  stackedChart.update();

  const stackedTitle = document.getElementById('stackedTitle');
  if (stackedTitle) stackedTitle.textContent = `Horários Críticos — ${mun.nome}`;

  // 3. Atualizar Doughnut (Veículos)
  const dadosVeiculos = gerarDadosVeiculos(mun.acidentes);
  doughnutChart.data.datasets[0].data = dadosVeiculos;
  doughnutChart.update();

  const doughnutTitle = document.getElementById('doughnutTitle');
  if (doughnutTitle) doughnutTitle.textContent = `Veículos Envolvidos — ${mun.nome}`;
}

/* ---- Init everything on DOMContentLoaded ---- */
document.addEventListener('DOMContentLoaded', () => {
  inicializarMapa();
  inicializarTrendChart();
  inicializarStackedChart();
  inicializarDoughnutChart();
});