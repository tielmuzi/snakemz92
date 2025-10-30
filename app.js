/**
 * Aplicação Principal - Snake MZ92
 * Gerencia navegação, configurações e integração de todos os componentes
 */

class SnakeApp {
    constructor() {
        this.currentScreen = 'welcome';
        this.settings = {
            theme: 'light',
            difficulty: 'normal',
            controlType: 'keyboard',
            fontSize: 'medium',
            highContrast: false,
            masterVolume: 70,
            soundEffects: true,
            backgroundMusic: true
        };
        
        this.init();
    }

    /**
     * Inicializa a aplicação
     */
    init() {
        this.loadSettings();
        this.setupEventListeners();
        this.applySettings();
        this.showScreen('welcome');
        
        // Inicia música do menu
        setTimeout(() => {
            if (window.audioManager) {
                window.audioManager.playMenuMusic();
            }
        }, 500);
    }

    /**
     * Carrega configurações salvas
     */
    loadSettings() {
        const savedSettings = localStorage.getItem('snakeMZ92_settings');
        if (savedSettings) {
            this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
        }
    }

    /**
     * Salva configurações
     */
    saveSettings() {
        localStorage.setItem('snakeMZ92_settings', JSON.stringify(this.settings));
    }

    /**
     * Configura event listeners
     */
    setupEventListeners() {
        // Botões principais
        const playBtn = document.getElementById('playBtn');
        const settingsBtn = document.getElementById('settingsBtn');
        const statsBtn = document.getElementById('statsBtn');
        const creditsBtn = document.getElementById('creditsBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        const backToMenuBtn = document.getElementById('backToMenuBtn');
        
        if (playBtn) {
            playBtn.addEventListener('click', () => {
                this.startGame();
            });
        }
        
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.showScreen('settings');
            });
        }
        
        if (statsBtn) {
            statsBtn.addEventListener('click', () => {
                this.showScreen('stats');
            });
        }
        
        if (creditsBtn) {
            creditsBtn.addEventListener('click', () => {
                this.showScreen('credits');
            });
        }
        
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => this.togglePause());
        }
        
        if (backToMenuBtn) {
            backToMenuBtn.addEventListener('click', () => this.backToMenu());
        }

        // Botões de voltar
        document.getElementById('backFromSettings').addEventListener('click', () => this.showScreen('welcome'));
        document.getElementById('backFromStats').addEventListener('click', () => this.showScreen('welcome'));
        document.getElementById('backFromCredits').addEventListener('click', () => this.showScreen('welcome'));

        // Controles do jogo
        document.getElementById('pauseBtn').addEventListener('click', () => {
            if (window.snakeGame) {
                window.snakeGame.togglePause();
            }
        });

        document.getElementById('backToMenuBtn').addEventListener('click', () => this.backToMenu());

        // Modal de pausa
        document.getElementById('resumeBtn').addEventListener('click', () => {
            if (window.snakeGame) {
                window.snakeGame.resumeGame();
            }
        });

        document.getElementById('restartBtn').addEventListener('click', () => this.restartGame());
        document.getElementById('quitBtn').addEventListener('click', () => this.backToMenu());

        // Modal de game over
        document.getElementById('playAgainBtn').addEventListener('click', () => this.restartGame());
        document.getElementById('backToMenuFromGameOver').addEventListener('click', () => this.backToMenu());

        // Configurações - Tema
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const theme = btn.dataset.theme;
                this.setTheme(theme);
            });
        });

        // Configurações - Dificuldade
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const difficulty = btn.dataset.difficulty;
                this.setDifficulty(difficulty);
            });
        });

        // Configurações - Controles
        document.getElementById('highContrast').addEventListener('change', (e) => {
            this.setHighContrast(e.target.checked);
        });

        document.getElementById('fontSize').addEventListener('change', (e) => {
            this.setFontSize(e.target.value);
        });

        document.getElementById('controlType').addEventListener('change', (e) => {
            this.setControlType(e.target.value);
        });

        // Configurações - Som
        document.getElementById('masterVolume').addEventListener('input', (e) => {
            this.setMasterVolume(e.target.value);
        });

        document.getElementById('soundEffects').addEventListener('change', (e) => {
            this.setSoundEffects(e.target.checked);
        });

        document.getElementById('backgroundMusic').addEventListener('change', (e) => {
            this.setBackgroundMusic(e.target.checked);
        });

        // Estatísticas
        document.getElementById('resetStats').addEventListener('click', () => this.resetStats());

        // Redimensionamento da janela
        window.addEventListener('resize', () => this.handleResize());

        // Previne zoom em dispositivos móveis
        document.addEventListener('touchstart', (e) => {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        });

        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
    }

    /**
     * Mostra uma tela específica
     */
    showScreen(screenName) {
        // Esconde todas as telas
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
            screen.style.display = 'none'; // Força esconder
        });

        // Mostra a tela solicitada
        const targetScreen = document.getElementById(screenName + 'Screen');
        if (targetScreen) {
            targetScreen.classList.add('active');
            targetScreen.style.display = 'flex'; // Força mostrar
            targetScreen.style.visibility = 'visible';
            targetScreen.style.opacity = '1';
            targetScreen.style.width = '100%';
            targetScreen.style.height = '100vh';
            targetScreen.style.position = 'relative';
            targetScreen.style.zIndex = '10';
            this.currentScreen = screenName;
        }

        // Atualiza música de fundo
        if (window.audioManager) {
            if (screenName === 'welcome') {
                window.audioManager.playMenuMusic();
            } else if (screenName === 'game') {
                window.audioManager.playThemeMusic(this.settings.theme);
            }
        }

        // Atualiza dados específicos da tela
        if (screenName === 'stats') {
            this.updateStatsDisplay();
        }
    }

    /**
     * Inicia o jogo
     */
    startGame() {
        if (window.snakeGame) {
            this.showScreen('game');
            
            // Aguarda um pouco para garantir que o DOM foi atualizado
            setTimeout(() => {
                window.snakeGame.init();
                
                setTimeout(() => {
                    window.snakeGame.startGame();
                }, 100);
            }, 100);
        }
    }

    /**
     * Reinicia o jogo
     */
    restartGame() {
        // Fecha modais
        document.getElementById('pauseModal').classList.remove('active');
        document.getElementById('gameOverModal').classList.remove('active');
        
        if (window.snakeGame) {
            window.snakeGame.resetGame();
            window.snakeGame.startGame();
        }
    }

    /**
     * Volta ao menu principal
     */
    backToMenu() {
        // Fecha modais
        document.getElementById('pauseModal').classList.remove('active');
        document.getElementById('gameOverModal').classList.remove('active');
        
        if (window.snakeGame) {
            window.snakeGame.stopGame();
        }
        
        this.showScreen('welcome');
    }

    /**
     * Define o tema
     */
    setTheme(theme) {
        this.settings.theme = theme;
        
        // Atualiza botões de tema
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.theme === theme) {
                btn.classList.add('active');
            }
        });
        
        // Aplica tema ao body
        document.body.setAttribute('data-theme', theme);
        
        // Atualiza jogo se estiver rodando
        if (window.snakeGame) {
            window.snakeGame.setTheme(theme);
        }
        
        // Atualiza música de fundo
        if (window.audioManager && this.currentScreen === 'game') {
            window.audioManager.playThemeMusic(theme);
        }
        
        this.saveSettings();
    }

    /**
     * Define a dificuldade
     */
    setDifficulty(difficulty) {
        this.settings.difficulty = difficulty;
        
        // Atualiza botões de dificuldade
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.difficulty === difficulty) {
                btn.classList.add('active');
            }
        });
        
        // Atualiza jogo se estiver rodando
        if (window.snakeGame) {
            window.snakeGame.setDifficulty(difficulty);
        }
        
        this.saveSettings();
    }

    /**
     * Define o tipo de controle
     */
    setControlType(controlType) {
        this.settings.controlType = controlType;
        
        // Atualiza jogo se estiver rodando
        if (window.snakeGame) {
            window.snakeGame.setControlType(controlType);
        }
        
        this.saveSettings();
    }

    /**
     * Define alto contraste
     */
    setHighContrast(enabled) {
        this.settings.highContrast = enabled;
        
        if (enabled) {
            document.body.classList.add('high-contrast');
        } else {
            document.body.classList.remove('high-contrast');
        }
        
        this.saveSettings();
    }

    /**
     * Define o tamanho da fonte
     */
    setFontSize(size) {
        this.settings.fontSize = size;
        
        // Remove classes anteriores
        document.body.classList.remove('font-small', 'font-medium', 'font-large');
        
        // Adiciona nova classe
        document.body.classList.add('font-' + size);
        
        this.saveSettings();
    }

    /**
     * Define o volume principal
     */
    setMasterVolume(volume) {
        this.settings.masterVolume = parseInt(volume);
        
        if (window.audioManager) {
            window.audioManager.setMasterVolume(volume / 100);
        }
        
        this.saveSettings();
    }

    /**
     * Define efeitos sonoros
     */
    setSoundEffects(enabled) {
        this.settings.soundEffects = enabled;
        
        if (window.audioManager) {
            window.audioManager.setEffectsEnabled(enabled);
        }
        
        this.saveSettings();
    }

    /**
     * Define música de fundo
     */
    setBackgroundMusic(enabled) {
        this.settings.backgroundMusic = enabled;
        
        if (window.audioManager) {
            window.audioManager.setMusicEnabled(enabled);
        }
        
        this.saveSettings();
    }

    /**
     * Aplica todas as configurações
     */
    applySettings() {
        // Tema
        this.setTheme(this.settings.theme);
        
        // Dificuldade
        this.setDifficulty(this.settings.difficulty);
        
        // Alto contraste
        this.setHighContraste(this.settings.highContrast);
        
        // Tamanho da fonte
        this.setFontSize(this.settings.fontSize);
        
        // Atualiza controles da interface
        document.getElementById('highContrast').checked = this.settings.highContrast;
        document.getElementById('fontSize').value = this.settings.fontSize;
        document.getElementById('controlType').value = this.settings.controlType;
        document.getElementById('masterVolume').value = this.settings.masterVolume;
        document.getElementById('soundEffects').checked = this.settings.soundEffects;
        document.getElementById('backgroundMusic').checked = this.settings.backgroundMusic;
        
        // Áudio - com tratamento de erro
        try {
            if (window.audioManager) {
                window.audioManager.setMasterVolume(this.settings.masterVolume / 100);
                window.audioManager.setEffectsEnabled(this.settings.soundEffects);
                window.audioManager.setMusicEnabled(this.settings.backgroundMusic);
            }
        } catch (error) {
            console.warn('⚠️ Erro ao aplicar configurações de áudio:', error);
        }
    }



    /**
     * Define a dificuldade
     */
    setDifficulty(difficulty) {
        this.settings.difficulty = difficulty;
        this.saveSettings();
        
        // Atualiza botões de dificuldade
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-difficulty="${difficulty}"]`).classList.add('active');
        
        // Atualiza configuração no jogo se disponível
        if (window.snakeGame) {
            window.snakeGame.setDifficulty(difficulty);
        }
    }

    /**
     * Define alto contraste
     */
    setHighContraste(enabled) {
        this.settings.highContrast = enabled;
        this.saveSettings();
        
        if (enabled) {
            document.body.classList.add('high-contrast');
        } else {
            document.body.classList.remove('high-contrast');
        }
    }

    /**
     * Define tamanho da fonte
     */
    setFontSize(size) {
        this.settings.fontSize = size;
        this.saveSettings();
        
        document.body.classList.remove('font-small', 'font-medium', 'font-large');
        document.body.classList.add(`font-${size}`);
    }

    /**
     * Atualiza exibição das estatísticas
     */
    updateStatsDisplay() {
        const stats = this.loadStats();
        
        document.getElementById('highScore').textContent = stats.highScore.toLocaleString();
        document.getElementById('gamesPlayed').textContent = stats.gamesPlayed.toLocaleString();
        document.getElementById('maxLevel').textContent = stats.maxLevel;
        document.getElementById('totalFood').textContent = stats.totalFood.toLocaleString();
        
        // Formata tempo total
        const hours = Math.floor(stats.totalTime / 3600);
        const minutes = Math.floor((stats.totalTime % 3600) / 60);
        document.getElementById('totalTime').textContent = `${hours}h ${minutes}m`;
    }

    /**
     * Carrega estatísticas
     */
    loadStats() {
        const defaultStats = {
            highScore: 0,
            gamesPlayed: 0,
            totalTime: 0,
            maxLevel: 1,
            totalFood: 0
        };
        
        const saved = localStorage.getItem('snakeMZ92_stats');
        return saved ? { ...defaultStats, ...JSON.parse(saved) } : defaultStats;
    }

    /**
     * Reseta estatísticas
     */
    resetStats() {
        if (confirm('Tem certeza que deseja resetar todas as estatísticas? Esta ação não pode ser desfeita.')) {
            localStorage.removeItem('snakeMZ92_stats');
            this.updateStatsDisplay();
            
            if (window.audioManager) {
                window.audioManager.playEffect('dead');
            }
        }
    }

    /**
     * Manipula redimensionamento da janela
     */
    handleResize() {
        // Atualiza controles mobile baseado no tamanho da tela
        const mobileControls = document.getElementById('mobileControls');
        if (window.innerWidth <= 768 || this.settings.controlType === 'touch') {
            mobileControls.style.display = 'block';
        } else {
            mobileControls.style.display = 'none';
        }
        
        // Redimensiona canvas do jogo se necessário
        if (window.snakeGame && this.currentScreen === 'game') {
            window.snakeGame.resize();
        }
    }

    /**
     * Obtém configurações atuais
     */
    getSettings() {
        return { ...this.settings };
    }

    /**
     * Define configurações
     */
    setSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        this.applySettings();
        this.saveSettings();
    }
}

// Inicializa a aplicação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.snakeApp = new SnakeApp();
});

// Previne comportamentos padrão em dispositivos móveis
document.addEventListener('touchmove', (e) => {
    if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
    }
}, { passive: false });

// Manipula visibilidade da página para pausar/retomar música
document.addEventListener('visibilitychange', () => {
    if (window.audioManager) {
        if (document.hidden) {
            window.audioManager.pauseMusic();
        } else {
            window.audioManager.resumeMusic();
        }
    }
});

// Exporta para uso em outros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SnakeApp;
}