// script.js — versão robusta (substitui tudo)
document.addEventListener('DOMContentLoaded', () => {// Remove a classe no-transition depois de carregar

    const tipo = 'aluno';
    const email = localStorage.getItem('email');
    const password = localStorage.getItem('password');

    // Se não estivermos logados, força o redirect para login
    if (!email || !password) {
        console.warn('Usuário não autenticado — redirecionando para login.');
        window.location.href = '/auth/form-login';
        return;
    }

    // Opcional: mostrar saudação no header (se houver container)
    const sauda = document.getElementById('saudacao-usuario');
    if (sauda) {
    sauda.textContent = `Bem-vindo, ${email} (${tipo})`;
    }

    // ===== LOGOUT =====
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('email');
        localStorage.removeItem('password');
        // Mantemos dark mode guardado (opcional): se preferires limpar, descomente a linha seguinte
        // localStorage.removeItem('darkMode');
        // window.location.href = '/auth/form-login';
      });
    }
});
