// script.js — versão robusta (substitui tudo)
document.addEventListener('DOMContentLoaded', () => {// Remove a classe no-transition depois de carregar
  document.body.classList.add('no-transition');
  window.addEventListener('load', () => {
    document.body.classList.remove('no-transition');
    document.body.classList.add('ready');
  });

  try {
    const tipo = 'aluno';
    // --- Helpers ---
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => Array.from(document.querySelectorAll(sel));

    // Elementos possíveis nas páginas
    const toggleBtn = document.getElementById('toggle-dark');
    const logoutBtn = document.getElementById('logout-btn');
    const loginForm = document.getElementById('loginForm');
    const tabBtns = $$('.tab-btn');
    const tabContents = $$('.tab-content');

    // ===== LOGIN (se existir loginForm) =====
    if (loginForm) {
      loginForm.addEventListener('submit', (ev) => {
        ev.preventDefault();
        const email = (document.getElementById('email') || {}).value?.trim();
        const password = (document.getElementById('password') || {}).value?.trim();
        

        if (!email || !password) {
          alert('Preencha todos os campos do login.');
          return;
        }

        // Aqui estamos a simular autenticação
        localStorage.setItem('email', email);
        localStorage.setItem('password', password);
        // Mantemos preferência de tema (se existir)
        window.location.href = '/';
      });

      // Não continua execuções do resto se estamos na página de login
      // (mas deixamos o dark mode funcionar se o botão existir na login)
    }

    // ===== DARK MODE (persistente) =====
    function applyDark(isDark) {
      document.body.classList.toggle('dark-mode', isDark);
      if (toggleBtn) toggleBtn.textContent = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';
    }

    // Inicializa dark mode a partir do localStorage
    const saved = localStorage.getItem('darkMode');
    if (saved === 'true') applyDark(true);

    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const isDark = document.body.classList.toggle('dark-mode');
        toggleBtn.textContent = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';
        localStorage.setItem('darkMode', isDark ? 'true' : 'false');
      });
    }

    // ===== Se estamos na página principal (index.html) então controla abas e acesso =====
    const onIndex = document.body && tabBtns.length > 0 && tabContents.length > 0;

    if (onIndex) {
      const email = localStorage.getItem('email');
      const password = localStorage.getItem('password');

      // Se não estivermos logados, força o redirect para login
      if (!email || !password) {
        console.warn('Usuário não autenticado — redirecionando para login.');
        window.location.href = '/auth/form-login';
        return;
      }

      // Permissões por tipo
      const permissoes = {
        aluno: ['inicio', 'aluno', 'sobre'],
        orientador: ['inicio', 'orientador', 'sobre'],
        coordenador: ['inicio', 'coordenador', 'sobre']
      };
      const permitido = permissoes[tipo] || ['inicio', 'sobre'];

      // Esconder botões/contents não permitidos (usa style.display para preservar o layout)
      tabBtns.forEach(btn => {
        if (!permitido.includes(btn.dataset.tab)) btn.style.display = 'none';
        else btn.style.display = '';
      });
      tabContents.forEach(content => {
        if (!permitido.includes(content.id)) content.style.display = 'none';
        else content.style.display = '';
        // remover classe active antiga para evitar conflitos
        content.classList.remove('active');
      });

      // Ativa os botões visíveis com event listeners
      const visibleBtns = tabBtns.filter(b => b.style.display !== 'none');
      visibleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          visibleBtns.forEach(b => b.classList.remove('active'));
          tabContents.forEach(c => c.classList.remove('active'));
          btn.classList.add('active');
          const id = btn.dataset.tab;
          const el = document.getElementById(id);
          if (el) el.classList.add('active');
        });
      });

      // Define aba inicial: prioriza aba do tipo (ex: 'aluno'), senão a primeira visível
      let abaInicial = permitido.find(x => x !== 'inicio') || 'inicio';
      let botaoInicial = document.querySelector(`.tab-btn[data-tab="${abaInicial}"]`);
      let conteudoInicial = document.getElementById(abaInicial);

      if (!botaoInicial || botaoInicial.style.display === 'none') {
        botaoInicial = visibleBtns[0];
        conteudoInicial = botaoInicial ? document.getElementById(botaoInicial.dataset.tab) : null;
      }

      if (botaoInicial && conteudoInicial) {
        botaoInicial.classList.add('active');
        conteudoInicial.classList.add('active');
      }

      // Opcional: mostrar saudação no header (se houver container)
      const sauda = document.getElementById('saudacao-usuario');
      if (sauda) {
        sauda.textContent = `Bem-vindo, ${email} (${tipo})`;
      }
    }

    // ===== LOGOUT =====
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('email');
        localStorage.removeItem('password');
        // Mantemos dark mode guardado (opcional): se preferires limpar, descomente a linha seguinte
        // localStorage.removeItem('darkMode');
        window.location.href = '/auth/form-login';
      });
    }
  } catch (err) {
    console.error('Erro no script principal:', err);
    alert('Ocorreu um erro no script. Abre a consola (F12) e cola a mensagem aqui, por favor.');
  }
});
