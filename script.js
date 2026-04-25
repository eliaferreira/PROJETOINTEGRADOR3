/* ---------- MENU HAMBURGUER ---------- */
const hamburger = document.getElementById('hamburger');
const nav       = document.getElementById('nav');

hamburger.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('open');
  hamburger.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', isOpen);
});

// Fecha o menu ao clicar em um link
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    nav.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', false);
  });
});

// Marca link ativo ao scrollar
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

// Dispara quando o hero aparece na tela
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
  { nome: 'Vitória',                   acidentes: 3241, fatalidades: 58, risco: 'alto'  },
  { nome: 'Serra',                     acidentes: 2876, fatalidades: 51, risco: 'alto'  },
  { nome: 'Vila Velha',                acidentes: 2514, fatalidades: 44, risco: 'alto'  },
  { nome: 'Cariacica',                 acidentes: 1987, fatalidades: 36, risco: 'medio' },
  { nome: 'Cachoeiro de Itapemirim',   acidentes: 1203, fatalidades: 24, risco: 'medio' },
  { nome: 'Linhares',                  acidentes:  892, fatalidades: 18, risco: 'baixo' },
  { nome: 'São Mateus',                acidentes:  643, fatalidades: 12, risco: 'baixo' },
  { nome: 'Colatina',                  acidentes:  521, fatalidades:  9, risco: 'baixo' },
  { nome: 'Guarapari',                 acidentes:  487, fatalidades:  8, risco: 'baixo' },
  { nome: 'Aracruz',                   acidentes:  398, fatalidades:  7, risco: 'baixo' },
];

function renderTabela(filtro) {
  const tbody = document.getElementById('tabelaBody');
  if (!tbody) return;

  const lista = filtro === 'todos'
    ? municipios
    : municipios.filter(m => m.risco === filtro);

  tbody.innerHTML = lista.map((m, i) => `
    <tr>
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
}

renderTabela('todos');

// Botões de filtro
document.querySelectorAll('.filtro-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderTabela(btn.dataset.filter);
  });
});


/* ---------- SCROLL SUAVE P/ LINKS INTERNOS ---------- */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const alvo = document.querySelector(link.getAttribute('href'));
    if (alvo) {
      e.preventDefault();

      // Mede a altura real do header em tempo real (funciona em qualquer dispositivo)
      const header = document.querySelector('.header');
      const alturaHeader = header ? header.offsetHeight : 70;

      const top = alvo.getBoundingClientRect().top + window.scrollY - alturaHeader - 16;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});
