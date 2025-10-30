/**
 * Sistema de Gerenciamento de Áudio para Snake MZ92
 * Gerencia músicas de fundo e efeitos sonoros
 */

class AudioManager {
    constructor() {
        this.sounds = {
            effects: {},
            background: {
                menu: [],
                lightmode: [],
                darkmode: [],
                neonmode: []
            }
        };
        
        this.currentBackgroundMusic = null;
        this.masterVolume = 0.7;
        this.effectsEnabled = true;
        this.musicEnabled = true;
        this.currentTheme = 'light';
        
        this.init();
    }

    /**
     * Inicializa o sistema de áudio
     */
    init() {
        this.loadEffectSounds();
        this.loadBackgroundMusic();
        this.setupVolumeControls();
    }

    /**
     * Carrega os efeitos sonoros
     */
    loadEffectSounds() {
        const effects = [
            'comer',
            'continuar', 
            'dead',
            'nivel',
            'pause',
            'start'
        ];

        effects.forEach(effect => {
            try {
                const audio = new Audio(`sounds/effects/${effect}.mp3`);
                audio.preload = 'none'; // Não pré-carrega para evitar erros
                audio.volume = this.masterVolume;
                
                // Adiciona listener para erro
                audio.addEventListener('error', () => {
                    console.warn(`Efeito sonoro ${effect}.mp3 não encontrado`);
                });
                
                this.sounds.effects[effect] = audio;
            } catch (error) {
                console.warn(`Não foi possível carregar o efeito sonoro: ${effect}`, error);
                // Cria placeholder silencioso
                this.sounds.effects[effect] = this.createSilentAudio();
            }
        });
    }

    /**
     * Carrega as músicas de fundo
     */
    loadBackgroundMusic() {
        // Música do menu
        try {
            const menuMusic = new Audio('sounds/menu/menu.mp3');
            menuMusic.preload = 'none'; // Não pré-carrega para evitar erros
            menuMusic.loop = true;
            menuMusic.volume = this.masterVolume * 0.6; // Música mais baixa que efeitos
            
            // Adiciona listener para erro
            menuMusic.addEventListener('error', () => {
                console.warn('Música do menu não encontrada');
            });
            
            this.sounds.background.menu.push(menuMusic);
        } catch (error) {
            console.warn('Não foi possível carregar a música do menu', error);
            // Adiciona placeholder silencioso
            this.sounds.background.menu.push(this.createSilentAudio());
        }

        // Músicas dos temas (simulando 7 músicas para cada tema)
        const themes = ['lightmode', 'darkmode', 'neonmode'];
        
        themes.forEach(theme => {
            for (let i = 1; i <= 7; i++) {
                try {
                    // Usar o nome correto do arquivo: lightmode1.mp3, darkmode1.mp3, etc.
                    const music = new Audio(`sounds/background/${theme}/${theme}${i}.mp3`);
                    music.preload = 'none'; // Não pré-carrega para evitar erros
                    music.loop = true;
                    music.volume = this.masterVolume * 0.6;
                    
                    // Adiciona listener para erro
                    music.addEventListener('error', () => {
                        console.warn(`Música ${theme}/${theme}${i}.mp3 não encontrada`);
                    });
                    
                    this.sounds.background[theme].push(music);
                } catch (error) {
                    console.warn(`Música ${theme}/${theme}${i}.mp3 não encontrada, usando placeholder`);
                    const placeholder = this.createSilentAudio();
                    this.sounds.background[theme].push(placeholder);
                }
            }
        });
    }

    /**
     * Cria um áudio silencioso como placeholder
     */
    createSilentAudio() {
        const audio = new Audio();
        audio.loop = true;
        audio.volume = 0;
        return audio;
    }

    /**
     * Configura os controles de volume
     */
    setupVolumeControls() {
        // Carrega configurações salvas
        const savedVolume = localStorage.getItem('snakeMZ92_masterVolume');
        const savedEffects = localStorage.getItem('snakeMZ92_effectsEnabled');
        const savedMusic = localStorage.getItem('snakeMZ92_musicEnabled');

        if (savedVolume !== null) {
            this.masterVolume = parseFloat(savedVolume);
        }
        if (savedEffects !== null) {
            this.effectsEnabled = savedEffects === 'true';
        }
        if (savedMusic !== null) {
            this.musicEnabled = savedMusic === 'true';
        }

        this.updateAllVolumes();
    }

    /**
     * Atualiza o volume de todos os áudios
     */
    updateAllVolumes() {
        // Atualiza efeitos sonoros
        Object.values(this.sounds.effects).forEach(audio => {
            if (audio) {
                audio.volume = this.effectsEnabled ? this.masterVolume : 0;
            }
        });

        // Atualiza músicas de fundo
        Object.values(this.sounds.background).forEach(themeMusics => {
            themeMusics.forEach(audio => {
                if (audio) {
                    audio.volume = this.musicEnabled ? this.masterVolume * 0.6 : 0;
                }
            });
        });

        // Salva configurações
        localStorage.setItem('snakeMZ92_masterVolume', this.masterVolume.toString());
        localStorage.setItem('snakeMZ92_effectsEnabled', this.effectsEnabled.toString());
        localStorage.setItem('snakeMZ92_musicEnabled', this.musicEnabled.toString());
    }

    /**
     * Reproduz um efeito sonoro
     */
    playEffect(effectName) {
        if (!this.effectsEnabled) return;

        const effect = this.sounds.effects[effectName];
        if (effect) {
            try {
                effect.currentTime = 0;
                const playPromise = effect.play();
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        console.warn(`Erro ao reproduzir efeito ${effectName}:`, error);
                    });
                }
            } catch (error) {
                console.warn(`Erro ao reproduzir efeito ${effectName}:`, error);
            }
        }
    }

    /**
     * Para a música de fundo atual
     */
    stopBackgroundMusic() {
        if (this.currentBackgroundMusic) {
            this.currentBackgroundMusic.pause();
            this.currentBackgroundMusic.currentTime = 0;
            this.currentBackgroundMusic = null;
        }
    }

    /**
     * Reproduz música do menu
     */
    playMenuMusic() {
        this.stopBackgroundMusic();
        
        if (!this.musicEnabled) return;

        const menuMusics = this.sounds.background.menu;
        if (menuMusics.length > 0) {
            this.currentBackgroundMusic = menuMusics[0];
            try {
                const playPromise = this.currentBackgroundMusic.play();
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        console.warn('Erro ao reproduzir música do menu:', error);
                    });
                }
            } catch (error) {
                console.warn('Erro ao reproduzir música do menu:', error);
            }
        }
    }

    /**
     * Reproduz música de fundo baseada no tema
     */
    playThemeMusic(theme) {
        this.stopBackgroundMusic();
        
        if (!this.musicEnabled) return;

        this.currentTheme = theme;
        const themeKey = theme + 'mode';
        const themeMusics = this.sounds.background[themeKey];
        
        if (themeMusics && themeMusics.length > 0) {
            // Seleciona uma música aleatória do tema
            const randomIndex = Math.floor(Math.random() * themeMusics.length);
            this.currentBackgroundMusic = themeMusics[randomIndex];
            
            try {
                const playPromise = this.currentBackgroundMusic.play();
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        console.warn(`Erro ao reproduzir música do tema ${theme}:`, error);
                    });
                }
            } catch (error) {
                console.warn(`Erro ao reproduzir música do tema ${theme}:`, error);
            }
        }
    }

    /**
     * Define o volume principal
     */
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        this.updateAllVolumes();
    }

    /**
     * Ativa/desativa efeitos sonoros
     */
    setEffectsEnabled(enabled) {
        this.effectsEnabled = enabled;
        this.updateAllVolumes();
    }

    /**
     * Ativa/desativa música de fundo
     */
    setMusicEnabled(enabled) {
        this.musicEnabled = enabled;
        
        if (!enabled && this.currentBackgroundMusic) {
            this.stopBackgroundMusic();
        } else if (enabled) {
            // Retoma a música baseada no contexto atual
            if (document.getElementById('welcomeScreen').classList.contains('active')) {
                this.playMenuMusic();
            } else {
                this.playThemeMusic(this.currentTheme);
            }
        }
        
        this.updateAllVolumes();
    }

    /**
     * Obtém o volume principal
     */
    getMasterVolume() {
        return this.masterVolume;
    }

    /**
     * Verifica se os efeitos estão habilitados
     */
    areEffectsEnabled() {
        return this.effectsEnabled;
    }

    /**
     * Verifica se a música está habilitada
     */
    isMusicEnabled() {
        return this.musicEnabled;
    }

    /**
     * Define o tema atual e atualiza a música de fundo
     */
    setTheme(theme) {
        this.currentTheme = theme;
        
        // Para a música atual se estiver tocando
        this.stopBackgroundMusic();
        
        // Se a música estiver habilitada, inicia música do novo tema
        if (this.musicEnabled) {
            this.playThemeMusic(theme);
        }
    }

    /**
     * Pausa a música atual
     */
    pauseMusic() {
        if (this.currentBackgroundMusic && !this.currentBackgroundMusic.paused) {
            this.currentBackgroundMusic.pause();
        }
    }

    /**
     * Retoma a música atual
     */
    resumeMusic() {
        if (this.currentBackgroundMusic && this.currentBackgroundMusic.paused && this.musicEnabled) {
            try {
                const playPromise = this.currentBackgroundMusic.play();
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        console.warn('Erro ao retomar música:', error);
                    });
                }
            } catch (error) {
                console.warn('Erro ao retomar música:', error);
            }
        }
    }

    /**
     * Limpa todos os recursos de áudio
     */
    cleanup() {
        this.stopBackgroundMusic();
        
        // Para todos os efeitos
        Object.values(this.sounds.effects).forEach(audio => {
            if (audio) {
                audio.pause();
                audio.currentTime = 0;
            }
        });
    }
}

// Instância global do gerenciador de áudio
window.audioManager = new AudioManager();

// Exporta para uso em outros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AudioManager;
}