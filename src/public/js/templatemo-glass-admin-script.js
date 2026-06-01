(function() {
    'use strict';

    // ============================================
    // Theme Toggle
    // ============================================
    function initThemeToggle() {
        const themeToggle = document.getElementById('theme-toggle');
        if (!themeToggle) return;

        const iconSun = themeToggle.querySelector('.icon-sun');
        const iconMoon = themeToggle.querySelector('.icon-moon');
        
        function setTheme(theme) {
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
            
            if (iconSun && iconMoon) {
                if (theme === 'light') {
                    iconSun.style.display = 'none';
                    iconMoon.style.display = 'block';
                } else {
                    iconSun.style.display = 'block';
                    iconMoon.style.display = 'none';
                }
            }
        }
        
        // Check for saved theme preference or default to dark
        const savedTheme = localStorage.getItem('theme') || 'dark';
        setTheme(savedTheme);
        
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            setTheme(currentTheme === 'dark' ? 'light' : 'dark');
        });
    }

    // ============================================
    // 3D Tilt Effect
    // ============================================
    function initTiltEffect() {
        document.querySelectorAll('.glass-card-3d').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = (y - centerY) / 20;
                const rotateY = (centerX - x) / 20;
                
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
            });
        });
    }

    // ============================================
    // Animated Counters
    // ============================================
    function animateCounter(element, target, duration = 2000) {
        const start = 0;
        const startTime = performance.now();
        
        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(start + (target - start) * easeOut);
            
            if (element.dataset.prefix) {
                element.textContent = element.dataset.prefix + current.toLocaleString() + (element.dataset.suffix || '');
            } else {
                element.textContent = current.toLocaleString() + (element.dataset.suffix || '');
            }
            
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }
        
        requestAnimationFrame(update);
    }

    function initCounters() {
        const counters = document.querySelectorAll('.stat-value');
        counters.forEach(counter => {
            const text = counter.textContent;
            const value = parseInt(text.replace(/[^0-9]/g, ''));
            if (Number.isNaN(value)) return;
            
            if (text.includes('$')) {
                counter.dataset.prefix = '$';
            }
            if (text.includes('%')) {
                counter.dataset.suffix = '%';
            }
            
            animateCounter(counter, value);
        });
    }

    // ============================================
    // Mobile Menu Toggle
    // ============================================
    function initMobileMenu() {
        const menuToggle = document.querySelector('.mobile-menu-toggle');
        const sidebar = document.getElementById('sidebar');
        
        if (menuToggle && sidebar) {
            menuToggle.addEventListener('click', () => {
                sidebar.classList.toggle('open');
            });

            // Close sidebar when clicking outside
            document.addEventListener('click', (e) => {
                if (sidebar.classList.contains('open') && 
                    !sidebar.contains(e.target) && 
                    !menuToggle.contains(e.target)) {
                    sidebar.classList.remove('open');
                }
            });
        }
    }

    const navigationSections = [
        {
            title: "Menu Principal",
            links: [
                ["/PainelPrincipal", "Dashboard"],
                ["/tcc", "TCC"],
                ["/Agendar", "Defesa"],
                ["/Estudantes", "Estudantes"],
                ["/Professores", "Professores"],
                ["/Subdireccoes", "Subdirecções"],
                ["/Bancas", "Bancas"],
            ],
        },
        {
            title: "Configurações",
            links: [
                ["/AreadeFormacao", "Área de Formação"],
                ["/Curso", "Cursos"],
                ["/users", "Utilizadores"],
                ["/Perfis", "Papeis"],
                ["/ConfigSobre", "Sobre"],
            ],
        },
        {
            title: "Conta",
            links: [
                ["/MeusDados", "Meu Perfil"],
                ["/auth/form-login", "Sair"],
            ],
        },
    ];

    function initStableNavigation() {
        const navMenu = document.querySelector('.nav-menu');
        if (!navMenu) return;

        navMenu.innerHTML = navigationSections.map((section) => `
            <li class="nav-section">
                <span class="nav-section-title">${section.title}</span>
                <ul>
                    ${section.links.map(([href, label]) => `
                        <li class="nav-item">
                            <a href="${href}" class="nav-link" data-route="${href}">${label}</a>
                        </li>
                    `).join('')}
                </ul>
            </li>
        `).join('');

        navMenu.querySelectorAll('.nav-link').forEach((link) => {
            link.classList.toggle('active', link.getAttribute('href') === window.location.pathname);
        });
    }

    function initOperationalNavigation() {}

    function initSettingsNavigation() {}

    function initNavigationIcons() {
        const icons = {
            '/PainelPrincipal': '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
            '/tcc': '<path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>',
            '/ConfigUtilizadores': '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
            '/Perfis': '<path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z"/><path d="M9 12l2 2 4-4"/>',
            '/Curso': '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5z"/>',
            '/Estudantes': '<path d="M17 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9.5" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/>',
            '/Professores': '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/><path d="M12 14l2 3 2-3"/>',
            '/DetalhesTcc': '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M8 13h8"/><path d="M8 17h6"/>',
            '/Agendar': '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/>',
            '/Subdireccoes': '<path d="M3 21h18"/><path d="M6 21V8l6-4 6 4v13"/><path d="M9 21v-6h6v6"/>',
            '/Bancas': '<path d="M4 21v-7"/><path d="M20 21v-7"/><path d="M12 21v-9"/><path d="M2 14h20"/><path d="M12 3l9 5H3z"/>',
            '/ProfessorBancas': '<path d="M4 21v-7"/><path d="M20 21v-7"/><path d="M2 14h20"/><circle cx="12" cy="7" r="3"/>',
            '/Documentos': '<path d="M6 2h9l5 5v15H6z"/><path d="M14 2v6h6"/><path d="M9 13h6"/><path d="M9 17h6"/>',
            '/Avaliacoes': '<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
            '/Aprovacoes': '<circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-6"/>',
            '/AprovacaoTccs': '<circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-6"/>',
            '/AprovacaoBancas': '<circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-6"/>',
            '/AprovacaoDefesas': '<circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-6"/>',
            '/Relatorios': '<path d="M3 3v18h18"/><rect x="7" y="12" width="3" height="5"/><rect x="12" y="8" width="3" height="9"/><rect x="17" y="5" width="3" height="12"/>',
            '/MeusDados': '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
            '/ConfigUtilizadores': '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/>',
            '/AreadeFormacao': '<path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 21v-7h6v7"/>',
            '/Curso': '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5z"/>',
            '/ConfigSobre': '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
        };

        document.querySelectorAll('.nav-menu .nav-link').forEach(link => {
            if (link.querySelector('.nav-icon')) return;

            const icon = icons[link.getAttribute('href')];
            if (!icon) return;

            link.insertAdjacentHTML('afterbegin', `
                <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    ${icon}
                </svg>
            `);
        });
    }

    // ============================================
    // Form Validation (for login/register)
    // ============================================
    function initFormValidation() {
        const forms = document.querySelectorAll('form[data-validate]');
        
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                
                let isValid = true;
                const inputs = form.querySelectorAll('.form-input[required]');
                
                inputs.forEach(input => {
                    if (!input.value.trim()) {
                        isValid = false;
                        input.style.borderColor = '#ff6b6b';
                    } else {
                        input.style.borderColor = '';
                    }
                });

                // Email validation
                const emailInput = form.querySelector('input[type="email"]');
                if (emailInput && emailInput.value) {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(emailInput.value)) {
                        isValid = false;
                        emailInput.style.borderColor = '#ff6b6b';
                    }
                }

                if (isValid) {
                    // Form is valid - you can add your submission logic here
                    console.log('Form is valid');
                    // For demo purposes, redirect to dashboard
                    if (form.dataset.redirect) {
                        window.location.href = form.dataset.redirect;
                    }
                }
            });
        });
    }

    // ============================================
    // Password Visibility Toggle
    // ============================================
    function initPasswordToggle() {
        const toggleButtons = document.querySelectorAll('.password-toggle');
        
        toggleButtons.forEach(button => {
            button.addEventListener('click', () => {
                const input = button.parentElement.querySelector('input');
                const icon = button.querySelector('svg');
                
                if (input.type === 'password') {
                    input.type = 'text';
                    icon.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>';
                } else {
                    input.type = 'password';
                    icon.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
                }
            });
        });
    }

    // ============================================
    // Smooth Page Transitions
    // ============================================
    function initPageTransitions() {
        const links = document.querySelectorAll('a[href$=".html"]');
        
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                // Skip external links
                if (link.hostname !== window.location.hostname) return;
                
                e.preventDefault();
                const href = link.getAttribute('href');
                
                document.body.style.opacity = '0';
                document.body.style.transition = 'opacity 0.3s ease';
                
                setTimeout(() => {
                    window.location.href = href;
                }, 300);
            });
        });

        // Fade in on page load
        window.addEventListener('load', () => {
            document.body.style.opacity = '1';
        });
    }

    // ============================================
    // Settings Tab Navigation
    // ============================================
    function initSettingsTabs() {
        const tabLinks = document.querySelectorAll('.settings-nav-link[data-tab]');
        
        if (tabLinks.length === 0) return;

        tabLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Get target tab
                const tabId = link.getAttribute('data-tab');
                
                // Remove active class from all nav links
                document.querySelectorAll('.settings-nav-link').forEach(navLink => {
                    navLink.classList.remove('active');
                });
                
                // Add active class to clicked link
                link.classList.add('active');
                
                // Hide all tab contents
                document.querySelectorAll('.settings-tab-content').forEach(tab => {
                    tab.classList.remove('active');
                });
                
                // Show target tab content
                const targetTab = document.getElementById('tab-' + tabId);
                if (targetTab) {
                    targetTab.classList.add('active');
                }
            });
        });

        // Theme select sync with toggle
        const themeSelect = document.getElementById('theme-select');
        if (themeSelect) {
            const currentTheme = localStorage.getItem('theme') || 'dark';
            themeSelect.value = currentTheme;
            
            themeSelect.addEventListener('change', () => {
                const theme = themeSelect.value;
                if (theme === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
                } else {
                    document.documentElement.setAttribute('data-theme', theme);
                    localStorage.setItem('theme', theme);
                }
                
                // Update theme toggle icons
                const iconSun = document.querySelector('#theme-toggle .icon-sun');
                const iconMoon = document.querySelector('#theme-toggle .icon-moon');
                if (iconSun && iconMoon) {
                    const effectiveTheme = document.documentElement.getAttribute('data-theme');
                    if (effectiveTheme === 'light') {
                        iconSun.style.display = 'none';
                        iconMoon.style.display = 'block';
                    } else {
                        iconSun.style.display = 'block';
                        iconMoon.style.display = 'none';
                    }
                }
            });
        }
    }

    function initPlaceholderActions() {
        const pendingButtonLabels = [
            'Visualizar todos',
            'Mensalmente',
            'Semanalmente',
            'Diariamente',
            'Editar',
            'Revogar',
            'Guardar Alterações',
            'Cancelar',
            'Atualizar Senha',
            'Guardar Dados Acadêmicos',
            'Repor Padrão',
            'Aplicar Alterações',
            'Atualizar TCC',
            'Enviar Documento',
            'Novo TCC',
            'Novo Curso',
            'Novo Utilizador',
            'Nova Área',
            'Nova Defesa',
        ];

        document.querySelectorAll('button').forEach((button) => {
            const label = button.textContent.trim();
            const isOperational = button.closest('[data-operational-form]') || button.matches('[data-export-action], [data-primary-action]');
            const isControl = button.type === 'submit' || button.id === 'theme-toggle' || button.classList.contains('mobile-menu-toggle') || button.classList.contains('social-btn');

            if (isOperational || isControl || !pendingButtonLabels.includes(label)) return;

            button.type = 'button';
            button.title = 'Funcionalidade ainda por implementar';
            button.classList.add('pending-action');
            button.addEventListener('click', (event) => event.preventDefault());
        });

        document.querySelectorAll('a[href="#"]').forEach((link) => {
            link.title = 'Funcionalidade ainda por implementar';
            link.classList.add('pending-action');
            link.addEventListener('click', (event) => event.preventDefault());
        });
    }

    // ============================================
    // Initialize All Functions
    // ============================================
    function init() {
        initThemeToggle();
        initTiltEffect();
        initCounters();
        initMobileMenu();
        initStableNavigation();
        initOperationalNavigation();
        initSettingsNavigation();
        initNavigationIcons();
        initFormValidation();
        initPasswordToggle();
        initPageTransitions();
        initSettingsTabs();
        initPlaceholderActions();
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
