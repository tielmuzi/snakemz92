/**
 * Lógica Principal do Jogo Snake MZ92
 * Implementa todas as mecânicas do jogo, controles e sistema de níveis
 */

class SnakeGame {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.gridSize = 20;
        this.tileCount = 0;
        
        // Estado do jogo
        this.gameState = 'menu'; // menu, playing, paused, gameOver
        this.score = 0;
        this.level = 1;
        this.foodEaten = 0;
        this.gameStartTime = 0;
        this.gameTime = 0;
        
        // Configurações
        this.difficulty = 'normal';
        this.theme = 'light';
        this.controlType = 'keyboard';
        
        // Snake
        this.snake = [];
        this.direction = { x: 0, y: 0 };
        this.nextDirection = { x: 0, y: 0 };
        
        // Comida
        this.food = { x: 0, y: 0 };
        
        // Velocidade e timing
        this.baseSpeed = 150; // ms entre movimentos
        this.currentSpeed = this.baseSpeed;
        this.lastMoveTime = 0;
        
        // Controles
        this.keys = {};
        this.lastTouchStart = { x: 0, y: 0 };
        
        // Animações
        this.animationFrame = null;
        
        // Carrega configurações salvas
        this.loadSettings();
    }

    /**
     * Inicializa o jogo
     */
    init() {
        this.canvas = document.getElementById('gameCanvas');
        
        if (!this.canvas) {
            console.error('❌ ERRO: Canvas não encontrado!');
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        
        this.setupCanvas();
        this.setupControls();
        this.loadSettings();
        this.resetGame();
    }

    /**
     * Configura o canvas
     */
    setupCanvas() {
        const container = this.canvas.parentElement;
        const maxWidth = Math.min(container.clientWidth - 40, 600);
        const maxHeight = Math.min(container.clientHeight - 40, 400);
        
        // Ajusta o tamanho baseado no grid
        this.tileCount = Math.floor(Math.min(maxWidth, maxHeight) / this.gridSize);
        const canvasSize = this.tileCount * this.gridSize;
        
        this.canvas.width = canvasSize;
        this.canvas.height = canvasSize;
        
        // Ajusta para dispositivos de alta resolução
        const dpr = window.devicePixelRatio || 1;
        this.canvas.style.width = canvasSize + 'px';
        this.canvas.style.height = canvasSize + 'px';
        this.canvas.width = canvasSize * dpr;
        this.canvas.height = canvasSize * dpr;
        this.ctx.scale(dpr, dpr);
    }

    /**
     * Configura os controles
     */
    setupControls() {
        // Controles de teclado
        document.addEventListener('keydown', (e) => {
            if (this.gameState !== 'playing') return;
            
            this.keys[e.key] = true;
            
            switch(e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    this.changeDirection(0, -1);
                    e.preventDefault();
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    this.changeDirection(0, 1);
                    e.preventDefault();
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    this.changeDirection(-1, 0);
                    e.preventDefault();
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    this.changeDirection(1, 0);
                    e.preventDefault();
                    break;
                case ' ':
                case 'Escape':
                    this.togglePause();
                    e.preventDefault();
                    break;
            }
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });

        // Controles de toque
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            this.lastTouchStart = {
                x: touch.clientX - rect.left,
                y: touch.clientY - rect.top
            };
        });

        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            if (this.gameState !== 'playing') return;
            
            const touch = e.changedTouches[0];
            const rect = this.canvas.getBoundingClientRect();
            const touchEnd = {
                x: touch.clientX - rect.left,
                y: touch.clientY - rect.top
            };
            
            this.handleSwipe(this.lastTouchStart, touchEnd);
        });

        // Controles de mouse
        this.canvas.addEventListener('click', (e) => {
            if (this.gameState !== 'playing') return;
            
            const rect = this.canvas.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const clickY = e.clientY - rect.top;
            
            this.handleMouseClick(clickX, clickY);
        });

        // Botões de controle mobile
        document.getElementById('upBtn').addEventListener('click', () => this.changeDirection(0, -1));
        document.getElementById('downBtn').addEventListener('click', () => this.changeDirection(0, 1));
        document.getElementById('leftBtn').addEventListener('click', () => this.changeDirection(-1, 0));
        document.getElementById('rightBtn').addEventListener('click', () => this.changeDirection(1, 0));
    }

    /**
     * Manipula gestos de swipe
     */
    handleSwipe(start, end) {
        const deltaX = end.x - start.x;
        const deltaY = end.y - start.y;
        const minSwipeDistance = 30;
        
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // Swipe horizontal
            if (Math.abs(deltaX) > minSwipeDistance) {
                this.changeDirection(deltaX > 0 ? 1 : -1, 0);
            }
        } else {
            // Swipe vertical
            if (Math.abs(deltaY) > minSwipeDistance) {
                this.changeDirection(0, deltaY > 0 ? 1 : -1);
            }
        }
    }

    /**
     * Manipula cliques do mouse
     */
    handleMouseClick(x, y) {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        const deltaX = x - centerX;
        const deltaY = y - centerY;
        
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // Clique horizontal
            this.changeDirection(deltaX > 0 ? 1 : -1, 0);
        } else {
            // Clique vertical
            this.changeDirection(0, deltaY > 0 ? 1 : -1);
        }
    }

    /**
     * Muda a direção da cobra
     */
    changeDirection(x, y) {
        // Impede movimento reverso
        if (this.direction.x === -x && this.direction.y === -y) {
            return;
        }
        
        // Se a cobra está parada, verifica se o movimento causaria colisão
        if (this.direction.x === 0 && this.direction.y === 0) {
            const head = { ...this.snake[0] };
            const newHead = {
                x: head.x + x,
                y: head.y + y
            };
            
            // Verifica se a nova posição causaria colisão com o corpo
            if (this.isSnakePosition(newHead.x, newHead.y)) {
                return;
            }
            
            // Verifica se a nova posição causaria colisão com paredes
            if (newHead.x < 0 || newHead.x >= this.tileCount || 
                newHead.y < 0 || newHead.y >= this.tileCount) {
                return;
            }
        }
        
        this.nextDirection = { x, y };
        
        // Se a cobra está parada, move imediatamente
        if (this.direction.x === 0 && this.direction.y === 0) {
            this.direction = { ...this.nextDirection };
        }
    }

    /**
     * Carrega configurações salvas
     */
    loadSettings() {
        const savedDifficulty = localStorage.getItem('snakeMZ92_difficulty');
        const savedTheme = localStorage.getItem('snakeMZ92_theme');
        const savedControlType = localStorage.getItem('snakeMZ92_controlType');
        
        if (savedDifficulty) this.difficulty = savedDifficulty;
        if (savedTheme) this.theme = savedTheme;
        if (savedControlType) this.controlType = savedControlType;
        
        this.updateDifficultySettings();
    }

    /**
     * Atualiza configurações de dificuldade
     */
    updateDifficultySettings() {
        switch(this.difficulty) {
            case 'easy':
                this.baseSpeed = 200;
                break;
            case 'normal':
                this.baseSpeed = 150;
                break;
            case 'hard':
                this.baseSpeed = 100;
                break;
            case 'extreme':
                this.baseSpeed = 80;
                break;
        }
        this.currentSpeed = this.baseSpeed;
    }

    /**
     * Reseta o jogo
     */
    resetGame() {
        this.score = 0;
        this.level = 1;
        this.foodEaten = 0;
        this.gameTime = 0;
        
        // Posição inicial da cobra no centro
        const center = Math.floor(this.tileCount / 2);
        this.snake = [
            { x: center, y: center },
            { x: center - 1, y: center },
            { x: center - 2, y: center }
        ];
        
        this.direction = { x: 0, y: 0 };
        this.nextDirection = { x: 0, y: 0 };
        
        this.generateFood();
        this.updateDifficultySettings();
        this.updateUI();
    }

    /**
     * Gera nova comida
     */
    generateFood() {
        let newFood;
        let attempts = 0;
        const maxAttempts = 100;
        
        do {
            newFood = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount)
            };
            attempts++;
        } while (this.isSnakePosition(newFood.x, newFood.y) && attempts < maxAttempts);
        
        this.food = newFood;
    }

    /**
     * Verifica se uma posição está ocupada pela cobra
     */
    isSnakePosition(x, y) {
        return this.snake.some(segment => segment.x === x && segment.y === y);
    }

    /**
     * Inicia o jogo
     */
    startGame() {
        this.gameState = 'playing';
        this.gameStartTime = Date.now();
        this.lastMoveTime = Date.now();
        
        // Toca efeito sonoro de início
        if (window.audioManager) {
            window.audioManager.playEffect('start');
            window.audioManager.playThemeMusic(this.theme);
        }
        
        this.gameLoop();
    }

    /**
     * Loop principal do jogo
     */
    gameLoop() {
        if (this.gameState !== 'playing') return;
        
        const currentTime = Date.now();
        this.gameTime = Math.floor((currentTime - this.gameStartTime) / 1000);
        
        // Atualiza o jogo baseado na velocidade
        if (currentTime - this.lastMoveTime >= this.currentSpeed) {
            this.update();
            this.lastMoveTime = currentTime;
        }
        
        this.render();
        this.animationFrame = requestAnimationFrame(() => this.gameLoop());
    }

    /**
     * Atualiza a lógica do jogo
     */
    update() {
        // Atualiza direção
        if (this.nextDirection.x !== 0 || this.nextDirection.y !== 0) {
            this.direction = { ...this.nextDirection };
        }
        
        // Move a cobra
        if (this.direction.x !== 0 || this.direction.y !== 0) {
            const head = { ...this.snake[0] };
            head.x += this.direction.x;
            head.y += this.direction.y;
            
            // Verifica colisões com paredes
            if (head.x < 0 || head.x >= this.tileCount || 
                head.y < 0 || head.y >= this.tileCount) {
                this.gameOver();
                return;
            }
            
            // Verifica colisão com o próprio corpo
            if (this.isSnakePosition(head.x, head.y)) {
                this.gameOver();
                return;
            }
            
            this.snake.unshift(head);
            
            // Verifica se comeu a comida
            if (head.x === this.food.x && head.y === this.food.y) {
                this.eatFood();
            } else {
                this.snake.pop();
            }
        }
        
        this.updateUI();
    }

    /**
     * Processa quando a cobra come
     */
    eatFood() {
        this.score += 10 * this.level;
        this.foodEaten++;
        
        // Toca efeito sonoro
        if (window.audioManager) {
            window.audioManager.playEffect('comer');
        }
        
        // Verifica se subiu de nível (a cada 5 comidas)
        if (this.foodEaten % 5 === 0) {
            this.levelUp();
        }
        
        this.generateFood();
    }

    /**
     * Sobe de nível
     */
    levelUp() {
        this.level++;
        
        // Aumenta a velocidade
        this.currentSpeed = Math.max(50, this.currentSpeed - 10);
        
        // Toca efeito sonoro
        if (window.audioManager) {
            window.audioManager.playEffect('nivel');
        }
        
        // Adiciona obstáculos no modo extremo
        if (this.difficulty === 'extreme' && this.level > 3) {
            this.addObstacles();
        }
    }

    /**
     * Adiciona obstáculos (modo extremo)
     */
    addObstacles() {
        // Implementação simplificada - adiciona segmentos "fantasma" que causam colisão
        // Por simplicidade, vamos apenas aumentar mais a velocidade no modo extremo
        if (this.difficulty === 'extreme') {
            this.currentSpeed = Math.max(30, this.currentSpeed - 5);
        }
    }

    /**
     * Renderiza o jogo
     */
    render() {
        // Limpa o canvas
        this.ctx.fillStyle = this.getBackgroundColor();
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Desenha a grade (opcional, baseado no tema)
        if (this.theme === 'light') {
            this.drawGrid();
        }
        
        // Desenha a comida
        this.drawFood();
        
        // Desenha a cobra
        this.drawSnake();
        
        // Efeitos especiais para modo neon
        if (this.theme === 'neon') {
            this.addNeonEffects();
        }
    }

    /**
     * Obtém a cor de fundo baseada no tema
     */
    getBackgroundColor() {
        switch(this.theme) {
            case 'light': return '#f8fafc';
            case 'dark': return '#0f172a';
            case 'neon': return '#000000';
            default: return '#f8fafc';
        }
    }

    /**
     * Desenha a grade
     */
    drawGrid() {
        this.ctx.strokeStyle = '#e2e8f0';
        this.ctx.lineWidth = 1;
        
        for (let i = 0; i <= this.tileCount; i++) {
            const pos = i * this.gridSize;
            
            this.ctx.beginPath();
            this.ctx.moveTo(pos, 0);
            this.ctx.lineTo(pos, this.canvas.height);
            this.ctx.stroke();
            
            this.ctx.beginPath();
            this.ctx.moveTo(0, pos);
            this.ctx.lineTo(this.canvas.width, pos);
            this.ctx.stroke();
        }
    }

    /**
     * Desenha a comida
     */
    drawFood() {
        const x = this.food.x * this.gridSize;
        const y = this.food.y * this.gridSize;
        
        this.ctx.fillStyle = this.getFoodColor();
        this.ctx.fillRect(x + 2, y + 2, this.gridSize - 4, this.gridSize - 4);
        
        // Efeito de brilho para comida
        if (this.theme === 'neon') {
            this.ctx.shadowColor = this.getFoodColor();
            this.ctx.shadowBlur = 10;
            this.ctx.fillRect(x + 2, y + 2, this.gridSize - 4, this.gridSize - 4);
            this.ctx.shadowBlur = 0;
        }
    }

    /**
     * Obtém a cor da comida baseada no tema
     */
    getFoodColor() {
        switch(this.theme) {
            case 'light': return '#ef4444';
            case 'dark': return '#f87171';
            case 'neon': return '#ff0088';
            default: return '#ef4444';
        }
    }

    /**
     * Desenha a cobra
     */
    drawSnake() {
        this.snake.forEach((segment, index) => {
            const x = segment.x * this.gridSize;
            const y = segment.y * this.gridSize;
            
            // Cor diferente para cabeça e corpo
            if (index === 0) {
                this.ctx.fillStyle = this.getSnakeHeadColor();
            } else {
                this.ctx.fillStyle = this.getSnakeBodyColor();
            }
            
            this.ctx.fillRect(x + 1, y + 1, this.gridSize - 2, this.gridSize - 2);
            
            // Efeitos especiais para modo neon
            if (this.theme === 'neon') {
                this.ctx.shadowColor = index === 0 ? this.getSnakeHeadColor() : this.getSnakeBodyColor();
                this.ctx.shadowBlur = 8;
                this.ctx.fillRect(x + 1, y + 1, this.gridSize - 2, this.gridSize - 2);
                this.ctx.shadowBlur = 0;
            }
        });
    }

    /**
     * Obtém a cor da cabeça da cobra
     */
    getSnakeHeadColor() {
        switch(this.theme) {
            case 'light': return '#22c55e';
            case 'dark': return '#4ade80';
            case 'neon': return '#00ff88';
            default: return '#22c55e';
        }
    }

    /**
     * Obtém a cor do corpo da cobra
     */
    getSnakeBodyColor() {
        switch(this.theme) {
            case 'light': return '#16a34a';
            case 'dark': return '#22c55e';
            case 'neon': return '#00cc66';
            default: return '#16a34a';
        }
    }

    /**
     * Adiciona efeitos neon
     */
    addNeonEffects() {
        // Efeito de trilha para a cobra no modo neon
        this.ctx.globalCompositeOperation = 'lighter';
        
        this.snake.forEach((segment, index) => {
            const x = segment.x * this.gridSize;
            const y = segment.y * this.gridSize;
            const alpha = Math.max(0.1, 1 - (index * 0.1));
            
            this.ctx.fillStyle = `rgba(0, 255, 136, ${alpha})`;
            this.ctx.fillRect(x, y, this.gridSize, this.gridSize);
        });
        
        this.ctx.globalCompositeOperation = 'source-over';
    }

    /**
     * Atualiza a interface
     */
    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('level').textContent = this.level;
    }

    /**
     * Pausa/despausa o jogo
     */
    togglePause() {
        if (this.gameState === 'playing') {
            this.pauseGame();
        } else if (this.gameState === 'paused') {
            this.resumeGame();
        }
    }

    /**
     * Pausa o jogo
     */
    pauseGame() {
        this.gameState = 'paused';
        
        if (window.audioManager) {
            window.audioManager.playEffect('pause');
            window.audioManager.pauseMusic();
        }
        
        document.getElementById('pauseModal').classList.add('active');
    }

    /**
     * Retoma o jogo
     */
    resumeGame() {
        this.gameState = 'playing';
        this.lastMoveTime = Date.now();
        
        if (window.audioManager) {
            window.audioManager.playEffect('continuar');
            window.audioManager.resumeMusic();
        }
        
        document.getElementById('pauseModal').classList.remove('active');
        this.gameLoop();
    }

    /**
     * Termina o jogo
     */
    gameOver() {
        this.gameState = 'gameOver';
        
        if (window.audioManager) {
            window.audioManager.playEffect('dead');
            window.audioManager.stopBackgroundMusic();
        }
        
        // Salva estatísticas
        this.saveGameStats();
        
        // Mostra modal de game over
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('gameOverModal').classList.add('active');
        
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
    }

    /**
     * Salva estatísticas do jogo
     */
    saveGameStats() {
        const stats = this.loadStats();
        
        stats.gamesPlayed++;
        stats.totalTime += this.gameTime;
        stats.totalFood += this.foodEaten;
        
        if (this.score > stats.highScore) {
            stats.highScore = this.score;
        }
        
        if (this.level > stats.maxLevel) {
            stats.maxLevel = this.level;
        }
        
        localStorage.setItem('snakeMZ92_stats', JSON.stringify(stats));
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
     * Para o jogo
     */
    stopGame() {
        this.gameState = 'menu';
        
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        
        if (window.audioManager) {
            window.audioManager.stopBackgroundMusic();
        }
    }

    /**
     * Define configurações
     */
    setDifficulty(difficulty) {
        this.difficulty = difficulty;
        localStorage.setItem('snakeMZ92_difficulty', difficulty);
        this.updateDifficultySettings();
    }

    setTheme(theme) {
        this.theme = theme;
        localStorage.setItem('snakeMZ92_theme', theme);
    }

    setControlType(controlType) {
        this.controlType = controlType;
        localStorage.setItem('snakeMZ92_controlType', controlType);
        
        // Mostra/esconde controles mobile
        const mobileControls = document.getElementById('mobileControls');
        if (controlType === 'touch' || window.innerWidth <= 768) {
            mobileControls.style.display = 'block';
        } else {
            mobileControls.style.display = 'none';
        }
    }

    /**
     * Redimensiona o canvas
     */
    resize() {
        this.setupCanvas();
        if (this.gameState === 'playing' || this.gameState === 'paused') {
            this.render();
        }
    }
}

// Instância global do jogo
window.snakeGame = new SnakeGame();

// Redimensiona quando a janela muda de tamanho
window.addEventListener('resize', () => {
    if (window.snakeGame) {
        window.snakeGame.resize();
    }
});

// Exporta para uso em outros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SnakeGame;
}