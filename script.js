// Theme Toggle Functionality
const themeToggle = document.getElementById('themeToggle');
const body = document.body;

if (themeToggle) {
    // Check for saved theme preference or default to dark
    const currentTheme = localStorage.getItem('theme') || 'dark';
    body.classList.add(`${currentTheme}-theme`);

    // Update theme toggle button text and icon
    function updateThemeButton(theme) {
        const icon = themeToggle.querySelector('.icon');
        const text = themeToggle.querySelector('.theme-text');

        if (icon && text) {
            if (theme === 'dark') {
                icon.textContent = '🌙';
                text.textContent = 'Dark';
            } else {
                icon.textContent = '☀️';
                text.textContent = 'Light';
            }
        }
    }

    updateThemeButton(currentTheme);

    themeToggle.addEventListener('click', () => {
        const isDark = body.classList.contains('dark-theme');

        if (isDark) {
            body.classList.remove('dark-theme');
            body.classList.add('light-theme');
            localStorage.setItem('theme', 'light');
            updateThemeButton('light');
        } else {
            body.classList.remove('light-theme');
            body.classList.add('dark-theme');
            localStorage.setItem('theme', 'dark');
            updateThemeButton('dark');
        }
    });
} else {
    // If no theme toggle, still apply saved theme
    const currentTheme = localStorage.getItem('theme') || 'dark';
    body.classList.add(`${currentTheme}-theme`);
}

// Language Toggle Functionality
const langSelector = document.getElementById('langSelector');

/**
 * Actualiza todos los elementos de la página con las traducciones del idioma actual
 * @param {string} lang - Código del idioma (es, en)
 */
async function updateLanguage(lang) {
    // Asegurar que i18n está inicializado
    if (!i18n.isLoaded()) {
        await i18n.init(lang);
    } else {
        await i18n.setLanguage(lang);
    }

    const t = (key) => i18n.t(key);

    if (langSelector) {
        const langText = langSelector.querySelector('.lang-text');
        if (langText) {
            langText.textContent = lang.toUpperCase();
        }
    }

    // Update page content (only if elements exist)
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle && heroTitle.closest('.hero')) {
        heroTitle.textContent = t('heroTitle');
    }

    const heroDescription = document.querySelector('.hero-description');
    if (heroDescription) {
        heroDescription.textContent = t('heroDescription');
    }

    // Update nav links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach((link) => {
        const key = link.getAttribute('data-i18n');
        if (key) {
            link.textContent = t(key);
        }
    });

    // Update section titles
    const gamesTitle = document.querySelector('#games .section-title');
    if (gamesTitle) gamesTitle.textContent = t('navGames');

    // Update donate section title if it exists
    const donateTitle = document.querySelector('#donate .section-title');
    if (donateTitle) donateTitle.textContent = t('donateTitle');

    // Update empty states
    const emptyMessages = document.querySelectorAll('.empty-message');
    emptyMessages.forEach((msg) => {
        const section = msg.closest('.games-section');
        if (section) {
            const sectionId = section.id;
            if (sectionId === 'puzzle') {
                msg.textContent = t('comingSoonPuzzle');
            } else if (sectionId === 'retro') {
                msg.textContent = t('comingSoonRetro');
            } else if (sectionId === 'classics') {
                msg.textContent = t('comingSoonClassics');
            }
        }
    });

    // Update game cards
    const gameCards = document.querySelectorAll('.game-card');

    gameCards.forEach((card) => {
        const playBtn = card.querySelector('.play-button');
        const gameKey = playBtn ? playBtn.getAttribute('data-game') : null;

        if (gameKey) {
            const titleEl = card.querySelector('.game-title');
            const descEl = card.querySelector('.game-description');

            if (titleEl) titleEl.textContent = t(`${gameKey}.title`);
            if (descEl) descEl.textContent = t(`${gameKey}.description`);
            if (playBtn) playBtn.textContent = t('play');

            const tags = card.querySelectorAll('.tag');
            if (tags.length >= 2) {
                tags[0].textContent = t('offline');
                tags[1].textContent = t('noRegister');
            }
        }
    });

    // Update footer
    const footerText = document.querySelector('.footer-left p');
    if (footerText) {
        footerText.innerHTML = `${t('madeBy')} <span class="footer-brand">FreeUniTools</span>`;
    }

    const donateButton = document.querySelector('.donate-button');
    if (donateButton) {
        donateButton.textContent = t('donate');
    }

    // Update donate section
    const donateDescription = document.querySelector('.donate-description');
    if (donateDescription) {
        donateDescription.textContent = t('donateDescription');
    }

    const donateWithPayPal = document.querySelector('.donate-paypal-button span[data-i18n="donateWithPayPal"]') ||
        document.querySelector('.donate-paypal-button span:not(.paypal-icon)');
    if (donateWithPayPal) {
        donateWithPayPal.textContent = t('donateWithPayPal');
    }

    const donateNote = document.querySelector('.donate-note');
    if (donateNote) {
        donateNote.textContent = t('donateNote');
    }

    // Update promo section elements
    const promoBadge = document.querySelector('.promo-badge');
    if (promoBadge) {
        promoBadge.textContent = t('promoBadge');
    }

    const promoTitle = document.querySelector('.promo-title');
    if (promoTitle) {
        promoTitle.textContent = t('promoTitle');
    }

    const promoSubtitle = document.querySelector('.promo-subtitle');
    if (promoSubtitle) {
        promoSubtitle.textContent = t('promoSubtitle');
    }

    // Update promo features
    const promoFeatures = document.querySelectorAll('.promo-feature span[data-i18n]');
    promoFeatures.forEach((feature) => {
        const key = feature.getAttribute('data-i18n');
        if (key) {
            feature.textContent = t(key);
        }
    });

    // Update promo button
    const promoButton = document.querySelector('.promo-button span[data-i18n="promoButton"]');
    if (promoButton) {
        promoButton.textContent = t('promoButton');
    }

    // Update snake game page elements
    const gameScoreLabel = document.querySelector('.game-score span');
    if (gameScoreLabel && (gameScoreLabel.textContent.includes('Puntuación') || gameScoreLabel.textContent.includes('Score'))) {
        const scoreValue = document.getElementById('score')?.textContent || '0';
        gameScoreLabel.innerHTML = `${t('snake.score')} <span id="score">${scoreValue}</span>`;
    }

    const gameOverTitle = document.querySelector('#gameOver h2');
    if (gameOverTitle) {
        gameOverTitle.textContent = t('snake.gameOver');
    }

    const pausedTitle = document.querySelector('#gamePaused h2');
    if (pausedTitle) {
        pausedTitle.textContent = t('snake.paused');
    }

    const restartBtn = document.getElementById('restartBtn');
    if (restartBtn) {
        restartBtn.textContent = t('snake.playAgain');
    }

    const resumeBtn = document.getElementById('resumeBtn');
    if (resumeBtn) {
        resumeBtn.textContent = t('snake.resume');
    }

    const instructionsTitle = document.querySelector('.game-instructions h3');
    if (instructionsTitle) {
        instructionsTitle.textContent = t('snake.controls');
    }

    const instructions = document.querySelectorAll('.game-instructions p');
    if (instructions.length >= 3) {
        instructions[0].innerHTML = `<strong>${t('snake.desktopControls')}</strong>`;
        instructions[1].innerHTML = `<strong>${t('snake.mobileControls')}</strong>`;
        instructions[2].innerHTML = `<strong>${t('snake.pauseControls')}</strong>`;
    }
}

// Initialize language when DOM is ready
async function initLanguage() {
    const currentLang = i18n.getCurrentLanguage();

    // Inicializar i18n
    await i18n.init(currentLang);

    // Aplicar traducciones
    await updateLanguage(currentLang);

    // Configurar el selector de idioma
    if (langSelector) {
        langSelector.addEventListener('click', async () => {
            const currentLang = i18n.getCurrentLanguage();
            const newLang = currentLang === 'es' ? 'en' : 'es';
            await updateLanguage(newLang);
        });
    }
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLanguage);
} else {
    initLanguage();
}

// Play button functionality (only on index page)
const playButtons = document.querySelectorAll('.play-button');
if (playButtons.length > 0) {
    playButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const gameTitle = button.getAttribute('data-game');
            if (gameTitle === 'snake') {
                window.location.href = '/games/snake/snake.html';
            } else if (gameTitle === 'flappy') {
                window.location.href = '/games/flappy/flappy.html';
            } else if (gameTitle === 'pong') {
                window.location.href = '/games/pong/pong.html';
            } else if (gameTitle === 'minesweeper') {
                window.location.href = '/games/minesweeper/minesweeper.html';
            } else if (gameTitle === 'wordle') {
                window.location.href = '/games/wordle/wordle.html';
            } else if (gameTitle === 'breakout') {
                window.location.href = '/games/breakout/breakout.html';
            } else if (gameTitle === '2048') {
                window.location.href = '/games/2048/2048.html';
            } else {
                console.log(`Playing ${gameTitle}`);
                const comingSoonMsg = i18n.isLoaded()
                    ? `${i18n.t('comingSoon')} ${gameTitle}`
                    : `Próximamente: ${gameTitle}`;
                alert(comingSoonMsg);
            }
        });
    });
}

