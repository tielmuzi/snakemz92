# Snake (Versão MZ92)

Um jogo Snake totalmente funcional e responsivo para navegadores (desktop e mobile).

## 🎮 Características

- **Responsivo**: Funciona perfeitamente em desktop e dispositivos móveis
- **Controles múltiplos**: Teclado (setas/WASD), mouse e touch (swipe)
- **Controles inteligentes**: Movimento reverso neutro (não causa game over)
- **Modos visuais**: Light, Dark e Neon com músicas temáticas
- **Sistema de níveis**: Velocidade aumenta progressivamente
- **Acessibilidade**: Alto contraste, ajuste de fonte e controles adaptativos
- **Estatísticas**: Recordes salvos no localStorage
- **Áudio**: Efeitos sonoros e música de fundo

## 🎵 Estrutura de Áudio

### Efeitos Sonoros (sounds/effects/)
- `comer.mp3` - Som ao comer fruta
- `nivel.mp3` - Som ao subir de nível
- `dead.mp3` - Som de game over
- `continuar.mp3` - Som ao despausar
- `pause.mp3` - Som ao pausar
- `start.mp3` - Som ao iniciar jogo

### Música de Fundo
- `sounds/menu/menu.mp3` - Música do menu principal
- `sounds/background/lightmode/` - 7 músicas para modo claro
- `sounds/background/darkmode/` - 7 músicas para modo escuro
- `sounds/background/neonmode/` - 7 músicas para modo neon

## 🚀 Como Usar

1. Abra o arquivo `index.html` em um navegador
2. Configure suas preferências no menu de configurações
3. Clique em "Jogar" para começar
4. Use as setas do teclado, WASD, mouse ou gestos de toque para controlar a cobra

### 🎯 Controles Inteligentes

- **Movimento reverso**: Pressionar a direção oposta ao movimento atual não causa game over
- **Cobra parada**: Movimentos que causariam colisão são automaticamente ignorados
- **Compatibilidade total**: Funciona em todos os temas (Light, Dark, Neon)

## 🎨 Modos Visuais

- **Light Mode**: Fundo claro com cores suaves
- **Dark Mode**: Fundo escuro com contraste elegante
- **Neon Mode**: Fundo escuro com cores vibrantes e efeitos neon

## ⚙️ Configurações

- **Acessibilidade**: Alto contraste, tamanho da fonte, tipo de controle
- **Dificuldade**: Fácil, Normal, Difícil, Extremo
- **Áudio**: Volume master, efeitos sonoros, música de fundo

## 📊 Estatísticas

O jogo salva automaticamente:
- Recorde de pontuação
- Número de partidas jogadas
- Tempo total de jogo
- Nível máximo alcançado
- Total de comida coletada

## 👨‍💻 Desenvolvedor

**Salatiel Muzi**
- Versão: MZ92
- Ano: 2025

## 🛠️ Tecnologias

- HTML5 Canvas
- CSS3 com Tailwind CSS
- JavaScript ES6+
- Web Audio API
- LocalStorage API

## 🔧 Melhorias Implementadas

### v1.1 (2025)
- ✅ **Correção de controles duplicados**: Resolvido problema de event listeners duplicados
- ✅ **Movimento reverso neutro**: Implementado sistema inteligente que ignora movimentos reversos
- ✅ **Prevenção de colisões**: Movimentos que causariam colisão são automaticamente bloqueados
- ✅ **Compatibilidade multi-tema**: Controles funcionam perfeitamente em todos os temas
- ✅ **Estabilidade aprimorada**: Correções de bugs e otimizações de performance

---

© 2025 Snake (Versão MZ92) — Todos os direitos reservados.