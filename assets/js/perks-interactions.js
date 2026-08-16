/* ==========================================================================
   Perks — camada interativa
   - CTAs -> abrem o POPUP de captação (Nome + 1 condição)
   - Popup -> WhatsApp com mensagem VARIÁVEL (nome + condição do paciente)
   - Seleção ÚNICA de condição (uma por paciente), sincronizada com os chips da página
   - Botão flutuante de WhatsApp -> abre o mesmo popup
   - Navegação suave (menu / rodapé / "Como funciona")
   Número e mensagens vêm de window.PERKS_CONFIG (definido no functions.php).
   ========================================================================== */
(function () {
  'use strict';

  var CFG = window.PERKS_CONFIG || {};
  var WA_NUMBER = (CFG.wa || '5511994300213').replace(/\D/g, '');

  // Estado do paciente (uma condição por paciente)
  var state = { name: '', condition: null };

  var WA_SVG = '<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M16 .4C7.4.4.5 7.3.5 15.9c0 2.8.7 5.4 2 7.8L.4 31.6l8.1-2.1c2.3 1.2 4.8 1.9 7.5 1.9 8.6 0 15.5-7 15.5-15.5S24.6.4 16 .4zm0 28.3c-2.4 0-4.7-.6-6.7-1.8l-.5-.3-4.8 1.3 1.3-4.7-.3-.5c-1.3-2.1-2-4.5-2-7 0-7.2 5.9-13 13.1-13S29 8.7 29 15.9s-5.9 12.8-13 12.8zm7.2-9.6c-.4-.2-2.3-1.1-2.7-1.3-.4-.1-.6-.2-.9.2s-1 1.3-1.3 1.5c-.2.2-.5.3-.9.1-.4-.2-1.7-.6-3.2-2-1.2-1-2-2.4-2.2-2.8-.2-.4 0-.6.2-.8.2-.2.4-.5.6-.7.2-.2.3-.4.4-.7.1-.3 0-.5 0-.7-.1-.2-.9-2.1-1.2-2.9-.3-.8-.6-.7-.9-.7h-.8c-.3 0-.7.1-1 .5-.4.4-1.4 1.3-1.4 3.2s1.4 3.7 1.6 4c.2.3 2.8 4.2 6.7 5.9.9.4 1.7.6 2.2.8.9.3 1.8.3 2.4.2.7-.1 2.3-.9 2.6-1.9.3-.9.3-1.7.2-1.9-.1-.2-.3-.3-.7-.5z"/></svg>';
  var LEAF_SVG = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2c-1 3-1 5 0 7 .6-2 1.6-3.6 3.2-4.8-.7 2-1 3.6-.9 5C16 8 17.6 7 19.6 6.6c-1.2 1.6-2 3-2.4 4.6 1.4-.6 2.9-.8 4.8-.6-1.8 1-3.2 2-4.2 3.2 1.5.1 3 .6 4.4 1.6-2 .4-3.6 1-4.8 2 1.2.5 2.3 1.4 3.2 2.8-1.9-.6-3.5-.7-4.9-.4.6 1.2 1 2.6 1 4.2-1.4-1.2-2.6-2-3.7-2.4V24h-.8v-2.8c-1.1.4-2.3 1.2-3.7 2.4 0-1.6.4-3 1-4.2-1.4-.3-3-.2-4.9.4.9-1.4 2-2.3 3.2-2.8-1.2-1-2.8-1.6-4.8-2 1.4-1 2.9-1.5 4.4-1.6-1-1.2-2.4-2.2-4.2-3.2 1.9-.2 3.4 0 4.8.6C6.4 9.6 5.6 8.2 4.4 6.6 6.4 7 8 8 9.7 9.2c.1-1.4-.2-3-.9-5C10.4 5.4 11.4 7 12 9c1-2 1-4 0-7z"/></svg>';

  function waURL(text) {
    return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(text);
  }

  // Mensagem variável com nome + condição (sintoma) do paciente
  var TPL     = CFG.template     || 'Olá! Meu nome é {nome}. Estou buscando ajuda para {sintoma} e gostaria de entender como funciona a avaliação da PERKS CANNABIS.';
  var TPL_SEM = CFG.template_sem || 'Olá! Meu nome é {nome}. Gostaria de entender como funciona a avaliação da PERKS CANNABIS.';
  function buildMessage() {
    var t = state.condition ? TPL : TPL_SEM;
    return t.replace('{nome}', state.name || '').replace('{sintoma}', state.condition || '');
  }

  /* ---------- navegação suave ---------- */
  function scrollToEl(el) {
    if (!el) return;
    var rect = el.getBoundingClientRect();
    window.scrollTo({ top: rect.top + window.pageYOffset - 24, behavior: 'smooth' });
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
    'como-funciona': 'Mais cuidado', 'tratamentos': 'Diferentes soluções',
    'faq': 'Perguntas que quase', 'sobre': 'Sobre', 'depoimentos': 'Quem já passou'
  };
  function scrollToSection(key) { scrollToEl(findByText(SECTIONS[key])); }

  /* ---------- condições (fonte: chips da página) ---------- */
  function getConditions() {
    var list = [], seen = {};
    document.querySelectorAll('#perks-stage [data-perks-chip]').forEach(function (el) {
      var c = el.getAttribute('data-condition');
      if (c && !seen[c]) { seen[c] = 1; list.push(c); }
    });
    return list;
  }
  // seleção única — sincroniza chips da página + chips do modal
  function setCondition(cond) {
    state.condition = (state.condition === cond) ? null : cond;
    document.querySelectorAll('#perks-stage [data-perks-chip]').forEach(function (el) {
      el.classList.toggle('perks-sel', el.getAttribute('data-condition') === state.condition);
    });
    if (modalConds) {
      modalConds.querySelectorAll('.perks-cond').forEach(function (el) {
        el.classList.toggle('perks-cond--sel', el.getAttribute('data-condition') === state.condition);
      });
    }
  }

  /* ---------- popup / modal ---------- */
  var overlay, modalConds, nameInput, nameField, waBtn;

  function buildModal() {
    overlay = document.createElement('div');
    overlay.id = 'perks-modal-overlay';
    overlay.innerHTML =
      '<div class="perks-modal" role="dialog" aria-modal="true" aria-label="Iniciar tratamento">' +
        '<button class="perks-modal__close" aria-label="Fechar">&times;</button>' +
        '<div class="perks-modal__head">' +
          '<div class="perks-modal__badges">' +
            '<span class="perks-modal__badge perks-modal__badge--green">' + LEAF_SVG + '</span>' +
            '<span class="perks-modal__badge perks-modal__badge--olive">' + LEAF_SVG + '</span>' +
          '</div>' +
          '<p class="perks-modal__headline"><b>Falta pouco</b> para você iniciar sua jornada com a Perks!</p>' +
        '</div>' +
        '<label class="perks-field" id="perks-name-field">' +
          '<span class="perks-field__label">Nome <i>*</i></span>' +
          '<input type="text" class="perks-input" id="perks-name" placeholder="Como você se chama?" autocomplete="name">' +
          '<span class="perks-field__err">Por favor, preencha seu nome.</span>' +
        '</label>' +
        '<div class="perks-field">' +
          '<span class="perks-field__label">Qual a sua condição? <small>(escolha 1)</small></span>' +
          '<div class="perks-conds" role="radiogroup"></div>' +
        '</div>' +
        '<div class="perks-modal__actions">' +
          '<button class="perks-modal__btn perks-modal__btn--ghost" type="button" data-perks-close>Voltar</button>' +
          '<button class="perks-modal__btn perks-modal__btn--wa" type="button">' + WA_SVG + '<span>Falar no WhatsApp</span></button>' +
        '</div>' +
        '<p class="perks-modal__note">Resposta rápida • Sem compromisso • R$ 99 a consulta</p>' +
      '</div>';
    document.body.appendChild(overlay);

    modalConds = overlay.querySelector('.perks-conds');
    nameInput  = overlay.querySelector('#perks-name');
    nameField  = overlay.querySelector('#perks-name-field');
    waBtn      = overlay.querySelector('.perks-modal__btn--wa');

    // popular condições
    getConditions().forEach(function (cond) {
      var b = document.createElement('div');
      b.className = 'perks-cond';
      b.setAttribute('data-condition', cond);
      b.setAttribute('role', 'radio');
      b.textContent = cond;
      b.addEventListener('click', function () { setCondition(cond); });
      modalConds.appendChild(b);
    });

    nameInput.addEventListener('input', function () {
      state.name = nameInput.value.trim();
      if (state.name) nameField.classList.remove('perks-error');
    });
    overlay.querySelector('.perks-modal__close').addEventListener('click', closeModal);
    overlay.querySelector('[data-perks-close]').addEventListener('click', closeModal);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) closeModal(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });

    waBtn.addEventListener('click', function () {
      if (!state.name) {
        nameField.classList.add('perks-error');
        nameInput.focus();
        return;
      }
      window.open(waURL(buildMessage()), '_blank', 'noopener');
    });
  }

  function openModal() {
    if (!overlay) buildModal();
    // refletir estado atual (condição vinda dos chips da página, nome já digitado)
    modalConds.querySelectorAll('.perks-cond').forEach(function (el) {
      el.classList.toggle('perks-cond--sel', el.getAttribute('data-condition') === state.condition);
    });
    nameInput.value = state.name;
    nameField.classList.remove('perks-error');
    overlay.classList.add('perks-open');
    document.body.style.overflow = 'hidden';
    setTimeout(function () { nameInput.focus(); }, 60);
  }
  function closeModal() {
    if (!overlay) return;
    overlay.classList.remove('perks-open');
    document.body.style.overflow = '';
  }

  /* ---------- CTAs ---------- */
  function handleCTA(label) {
    var l = (label || '').toLowerCase();
    if (l.indexOf('como funciona') === 0) { scrollToSection('como-funciona'); return; }
    openModal(); // Agendar consulta, Começe Agora, Falar com a Perks -> popup
  }

  /* ---------- botão flutuante ---------- */
  function buildFloat() {
    var btn = document.createElement('button');
    btn.id = 'perks-wa-float';
    btn.setAttribute('aria-label', 'Falar no WhatsApp');
    btn.innerHTML = '<span class="perks-wa-label">Fale com a Perks</span>' + WA_SVG;
    btn.addEventListener('click', openModal);
    document.body.appendChild(btn);
  }

  /* ---------- wiring ---------- */
  function init() {
    document.querySelectorAll('#perks-stage [data-perks-cta]').forEach(function (el) {
      el.addEventListener('click', function (e) { e.preventDefault(); handleCTA(el.getAttribute('data-cta-label')); });
    });
    // chips da página: seleção única
    document.querySelectorAll('#perks-stage [data-perks-chip]').forEach(function (el) {
      el.addEventListener('click', function (e) { e.preventDefault(); setCondition(el.getAttribute('data-condition')); });
    });
    // menu / rodapé (por texto) -> rolagem
    var navMap = [
      ['Como funciona', 'como-funciona'], ['Tratamentos', 'tratamentos'],
      ['FAQ', 'faq'], ['Perguntas frequentes', 'faq'], ['Depoimentos', 'depoimentos'],
      ['Sobre a Perks', 'sobre']
    ];
    document.querySelectorAll('#perks-stage div').forEach(function (el) {
      if (el.querySelector('div')) return;
      if (el.hasAttribute('data-perks-cta')) return;
      var t = (el.textContent || '').trim();
      for (var i = 0; i < navMap.length; i++) {
        if (t === navMap[i][0]) {
          el.setAttribute('data-perks-nav', navMap[i][1]);
          el.addEventListener('click', (function (key) {
            return function (e) { e.preventDefault(); scrollToSection(key); };
          })(navMap[i][1]));
          break;
        }
      }
    });
    buildFloat();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
