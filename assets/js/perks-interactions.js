/* ==========================================================================
   Perks — camada interativa
   - CTAs -> WhatsApp (mensagem pré-preenchida)
   - Seletor de condições (multi-seleção) -> popup -> WhatsApp
   - Botão flutuante de WhatsApp
   - Navegação suave (menu/rodapé)
   O número e as mensagens vêm de window.PERKS_CONFIG (definido no functions.php).
   ========================================================================== */
(function () {
  'use strict';

  var CFG = window.PERKS_CONFIG || {};
  var WA_NUMBER = (CFG.wa || '5599999999999').replace(/\D/g, ''); // placeholder trocável no functions.php
  var MSG = CFG.messages || {};

  var MSG_DEFAULT = {
    agendar: 'Olá! Vim pelo site e gostaria de agendar minha consulta de Cannabis Medicinal (R$ 99).',
    falar:   'Olá! Gostaria de falar com a Perks e tirar algumas dúvidas sobre o tratamento.',
    condicoes: 'Olá! Vim pelo site e quero iniciar meu tratamento com Cannabis Medicinal.',
    float:   'Olá! Vim pelo site da Perks e gostaria de mais informações.'
  };
  function msg(key) { return MSG[key] || MSG_DEFAULT[key] || MSG_DEFAULT.float; }

  function waURL(text) {
    return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(text || msg('float'));
  }
  function openWA(text) { window.open(waURL(text), '_blank', 'noopener'); }

  /* ---------- navegação suave ---------- */
  function scrollToEl(el) {
    if (!el) return;
    var rect = el.getBoundingClientRect(); // inclui a escala (transform) do palco
    var y = rect.top + window.pageYOffset - 24;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }
  function findByText(substr) {
    var nodes = document.querySelectorAll('#perks-stage div');
    for (var i = 0; i < nodes.length; i++) {
      var t = (nodes[i].textContent || '').trim();
      if (t.indexOf(substr) === 0 || t === substr) return nodes[i];
    }
    return null;
  }
  var SECTIONS = {
    'como-funciona': 'Mais cuidado',
    'tratamentos':   'Diferentes soluções',
    'faq':           'Perguntas que quase',
    'sobre':         'Sobre',
    'depoimentos':   'Quem já passou'
  };
  function scrollToSection(key) { scrollToEl(findByText(SECTIONS[key])); }

  /* ---------- seleção de condições ---------- */
  var selected = []; // ordem de seleção
  function toggleChip(el) {
    var cond = el.getAttribute('data-condition');
    var idx = selected.indexOf(cond);
    if (idx >= 0) { selected.splice(idx, 1); el.classList.remove('perks-sel'); }
    else { selected.push(cond); el.classList.add('perks-sel'); }
  }

  /* ---------- popup / modal ---------- */
  var overlay, condsWrap, ctaBtn;
  var WA_SVG = '<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M16 .4C7.4.4.5 7.3.5 15.9c0 2.8.7 5.4 2 7.8L.4 31.6l8.1-2.1c2.3 1.2 4.8 1.9 7.5 1.9 8.6 0 15.5-7 15.5-15.5S24.6.4 16 .4zm0 28.3c-2.4 0-4.7-.6-6.7-1.8l-.5-.3-4.8 1.3 1.3-4.7-.3-.5c-1.3-2.1-2-4.5-2-7 0-7.2 5.9-13 13.1-13S29 8.7 29 15.9s-5.9 12.8-13 12.8zm7.2-9.6c-.4-.2-2.3-1.1-2.7-1.3-.4-.1-.6-.2-.9.2s-1 1.3-1.3 1.5c-.2.2-.5.3-.9.1-.4-.2-1.7-.6-3.2-2-1.2-1-2-2.4-2.2-2.8-.2-.4 0-.6.2-.8.2-.2.4-.5.6-.7.2-.2.3-.4.4-.7.1-.3 0-.5 0-.7-.1-.2-.9-2.1-1.2-2.9-.3-.8-.6-.7-.9-.7h-.8c-.3 0-.7.1-1 .5-.4.4-1.4 1.3-1.4 3.2s1.4 3.7 1.6 4c.2.3 2.8 4.2 6.7 5.9.9.4 1.7.6 2.2.8.9.3 1.8.3 2.4.2.7-.1 2.3-.9 2.6-1.9.3-.9.3-1.7.2-1.9-.1-.2-.3-.3-.7-.5z"/></svg>';

  function buildModal() {
    overlay = document.createElement('div');
    overlay.id = 'perks-modal-overlay';
    overlay.innerHTML =
      '<div class="perks-modal" role="dialog" aria-modal="true" aria-label="Iniciar tratamento">' +
        '<button class="perks-modal__close" aria-label="Fechar">&times;</button>' +
        '<span class="perks-modal__tag">Comece agora</span>' +
        '<h3 class="perks-modal__title">Vamos cuidar de você</h3>' +
        '<p class="perks-modal__sub">Confirme e continue no WhatsApp — um atendimento humano vai te orientar em cada etapa, sem compromisso.</p>' +
        '<div class="perks-modal__conds"></div>' +
        '<a class="perks-modal__btn" href="#" target="_blank" rel="noopener">' + WA_SVG + '<span>Continuar no WhatsApp</span></a>' +
        '<p class="perks-modal__note">Resposta rápida • Sem compromisso • R$ 99 a consulta</p>' +
      '</div>';
    document.body.appendChild(overlay);
    condsWrap = overlay.querySelector('.perks-modal__conds');
    ctaBtn = overlay.querySelector('.perks-modal__btn');
    overlay.querySelector('.perks-modal__close').addEventListener('click', closeModal);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) closeModal(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });
  }

  function openModal() {
    if (!overlay) buildModal();
    // render selected conditions
    if (selected.length) {
      condsWrap.className = 'perks-modal__conds';
      condsWrap.innerHTML = selected.map(function (c) {
        return '<span class="perks-modal__cond">' + c + '</span>';
      }).join('');
    } else {
      condsWrap.className = 'perks-modal__empty';
      condsWrap.textContent = 'Você ainda não selecionou uma condição — tudo bem! Podemos avaliar seu caso individualmente na conversa.';
    }
    // build message
    var text = msg('condicoes');
    if (selected.length) {
      text += '\n\nCondição(ões): ' + selected.join(', ') + '.';
    }
    ctaBtn.setAttribute('href', waURL(text));
    overlay.classList.add('perks-open');
    document.body.style.overflow = 'hidden';
  }
  function closeModal() {
    if (!overlay) return;
    overlay.classList.remove('perks-open');
    document.body.style.overflow = '';
  }

  /* ---------- CTAs ---------- */
  function handleCTA(label) {
    var l = (label || '').toLowerCase();
    if (l.indexOf('começe') === 0 || l.indexOf('comece') === 0 || l.indexOf('come') === 0) { openModal(); return; }
    if (l.indexOf('como funciona') === 0) { scrollToSection('como-funciona'); return; }
    if (l.indexOf('falar') === 0) { openWA(msg('falar')); return; }
    // "Agendar consulta" e demais
    openWA(msg('agendar'));
  }

  /* ---------- botão flutuante ---------- */
  function buildFloat() {
    var btn = document.createElement('button');
    btn.id = 'perks-wa-float';
    btn.setAttribute('aria-label', 'Falar no WhatsApp');
    btn.innerHTML = '<span class="perks-wa-label">Fale com a Perks</span>' + WA_SVG.replace('viewBox="0 0 32 32"', 'viewBox="0 0 32 32" width="34" height="34"');
    btn.addEventListener('click', function () { openWA(msg('float')); });
    document.body.appendChild(btn);
  }

  /* ---------- wiring ---------- */
  function init() {
    // CTAs
    document.querySelectorAll('#perks-stage [data-perks-cta]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        handleCTA(el.getAttribute('data-cta-label'));
      });
    });
    // chips
    document.querySelectorAll('#perks-stage [data-perks-chip]').forEach(function (el) {
      el.addEventListener('click', function (e) { e.preventDefault(); toggleChip(el); });
    });
    // menu / rodapé (por texto)
    var navMap = [
      ['Como funciona', 'como-funciona'], ['Tratamentos', 'tratamentos'],
      ['FAQ', 'faq'], ['Perguntas frequentes', 'faq'], ['Depoimentos', 'depoimentos'],
      ['Sobre a Perks', 'sobre']
    ];
    var leaves = document.querySelectorAll('#perks-stage div');
    leaves.forEach(function (el) {
      if (el.querySelector('div')) return;           // só folhas de texto
      if (el.hasAttribute('data-perks-cta')) return; // já tratado
      var t = (el.textContent || '').trim();
      for (var i = 0; i < navMap.length; i++) {
        if (t === navMap[i][0]) {
          el.setAttribute('data-perks-nav', navMap[i][1]);
          el.addEventListener('click', function (key) {
            return function (e) { e.preventDefault(); scrollToSection(key); };
          }(navMap[i][1]));
          break;
        }
      }
    });
    buildFloat();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
