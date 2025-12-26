# Tower Defense - TypeScript OOP

Um jogo de Tower Defense desenvolvido com **TypeScript**, **Orientação a Objetos** e **Canvas API**.

## 🎮 Novidades da Versão TypeScript

- ✅ **TypeScript** com tipagem forte e interfaces
- ✅ **Orientação a Objetos** com classes para todas entidades
- ✅ **3 Tipos de Torres** com características únicas
- ✅ **3 Tipos de Inimigos** com diferentes atributos
- ✅ **Padrão Singleton** para gerenciamento de estado
- ✅ **Sistema de Seleção de Torres** na UI
- ✅ **Projéteis com cores** baseadas no tipo de torre

## 📁 Estrutura do Projeto

O projeto foi organizado seguindo o princípio de separação de responsabilidades, dividindo o código em módulos específicos:

```
TowerDefense/
├── src/                      # Código fonte TypeScript
│   ├── types.ts             # Definições de tipos e interfaces
│   ├── utils.ts             # Funções utilitárias
│   ├── config.ts            # Configurações do jogo
│   ├── state.ts             # Gerenciador de estado (Singleton)
│   ├── entities/
│   │   ├── Enemy.ts        # Classe Enemy (OOP)
│   │   ├── Tower.ts        # Classe Tower (OOP)
│   │   └── Projectile.ts   # Classe Projectile (OOP)
│   ├── wave.ts              # Classe WaveManager
│   ├── update.ts            # Classe GameUpdater
│   ├── render.ts            # Classe Renderer
│   └── main.ts              # Classe Game (ponto de entrada)
├── dist/                     # JavaScript compilado (gerado automaticamente)
├── styles.css               # Estilos da interface
├── index.html               # Estrutura HTML
├── tsconfig.json            # Configuração TypeScript
├── package.json             # Dependências e scripts
└── README.md                # Documentação
```

## 🎯 Arquitetura Orientada a Objetos

### **Classes Principais**

#### **Enemy (src/entities/Enemy.ts)**
```typescript
class Enemy {
  - Propriedades: x, y, hp, maxHp, speed, reward, type, color
  - Métodos: takeDamage(), isDead(), getHealthPercentage()
  - 3 tipos: BASIC, FAST, TANK
}
```

#### **Tower (src/entities/Tower.ts)**
```typescript
class Tower {
  - Propriedades: x, y, type, range, damage, fireRate, color
  - Métodos: update(), canFire(), findTarget(), fire()
  - 3 tipos: BASIC, SNIPER, CANNON
}
```

#### **Projectile (src/entities/Projectile.ts)**
```typescript
class Projectile {
  - Propriedades: x, y, vx, vy, damage, color, sourceType
  - Métodos: update(), isOffScreen()
  - Cores diferentes por tipo de torre
}
```

#### **State (Singleton Pattern)**
```typescript
class State {
  - Gerencia: game state, enemies[], towers[], projectiles[]
  - Métodos: addEnemy(), removeEnemy(), addTower(), etc.
  - Padrão Singleton para acesso global
}
```

#### **WaveManager**
```typescript
class WaveManager {
  - Controla início e fim de waves
  - Define tipos de inimigos por wave
  - Gerencia spawning progressivo
}
```

#### **GameUpdater**
```typescript
class GameUpdater {
  - Atualiza todas entidades (delta time)
  - Detecta colisões
  - Gerencia lógica do jogo
}
```

#### **Renderer**
```typescript
class Renderer {
  - Desenha todos elementos no canvas
  - Atualiza HUD com estatísticas
  - Renderiza game over
}
```

## 🏰 Tipos de Torres

| Torre | Custo | Alcance | Taxa de Tiro | Dano | Velocidade Proj. | Cor | Uso Recomendado |
|-------|-------|---------|--------------|------|------------------|-----|-----------------|
| **Básica** | $25 | 140px | 1.2/s | 14 | 360px/s | 🟢 Verde | Defesa geral balanceada |
| **Sniper** | $40 | 220px | 0.6/s | 35 | 500px/s | 🟣 Roxo | Longo alcance, alto dano |
| **Canhão** | $35 | 120px | 0.8/s | 25 | 280px/s | 🟤 Marrom | Curto alcance, dano médio |

## 👾 Tipos de Inimigos

| Inimigo | HP Base | Crescimento HP | Velocidade | Recompensa | Aparece | Cor | Estratégia |
|---------|---------|----------------|------------|------------|---------|-----|------------|
| **Básico** | 40 | +10/wave | 60 | $8-12 | Wave 1+ | 🔴 Vermelho | Balanceado |
| **Rápido** | 25 | +6/wave | 100 | $12-20 | Wave 2+ | 🔵 Ciano | Baixo HP, alta velocidade |
| **Tanque** | 80 | +20/wave | 40 | $15-25 | Wave 4+ | 🟣 Roxo | Alto HP, lento |

## 🚀 Como Executar

### **1. Instalar Dependências**
```bash
npm install
```

### **2. Compilar TypeScript**
```bash
npm run build
```
TypeScript 5.3+**: Linguagem principal com tipagem estática
- **HTML5 Canvas**: Renderização gráfica 2D
- **ES2020 Modules**: Sistema de módulos moderno
- **OOP (Programação Orientada a Objetos)**:
  - Classes e herança
  - Encapsulamento
  - Padrão Singleton
  - Separação de responsabilidades
- **CSS3**: Estilização da interface

## 📊 Diagrama de Fluxo

```
index.html
    ↓
dist/main.js (compilado de src/main.ts)
    ↓
Game class (inicialização)
    ├── State (Singleton)
    ├── WaveManager
    ├── GameUpdater
    └── Renderer
    ↓
Game Loop (requestAnimationFrame)
    ├── GameUpdater.update(dt)
    │   ├── Tower.update() → Tower.fire() → new Projectile()
    │   ├── Enemy movement along path
    │   ├── Projectile.update() → collision detection
    │   └── WaveManager (spawn control)
    │
    ├── Renderer.draw()
    │   ├── drawPath()
    │   ├── drawTowers()
    │   ├── drawEnemies()
    │   └── drawProjectiles()
    │
    └── Renderer.updateHud()
### **Mecânicas**
- Você começa com **$100** e **20 vidas**
- Cada inimigo que chega ao fim **reduz 1 vida**
- Bônus de **$10** ao completar cada wave
- Diferentes torres têm diferentes custos e atributos
- Inimigos ficam mais fortes a cada wave

### **Estratégias**
- 🎯 Use **Snipers** para eliminar inimigos à distância
- ⚡ Use **Torres Básicas** para cobertura geral econômica
- 💥 Use **Canhões** para defender pontos críticos
- 🔄 Combine diferentes tipos para máxima eficiência

## 🔧 Tecnologias Utilizadas

- **HTML5 Canvas**: Para renderização gráfica
- **JavaScript ES6+**: Linguagem principal
  - Modules (import/export)
  - Arrow functions
  - Destructuring
  - Const/let
- **CSS3**: Estilização da interface
  - Grid Layout
  - Flexbox
  - Custom properties potenciais

## 🚀 Executando Localmente

Para executar o jogo localmente devido às restrições de CORS com ES6 modules:

### Opção 1: Servidor HTTP Simples (Python)
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```
Acesse: `http://localhost:8000`

### Opção 2: Live Server (VS Code)
1. Instale a extensão "Live Server"
2. Clique com botão direito em `index.html`
3. Selecione "Open with Live Server"

### Opção 3: Node.js (http-server)
```bash
npx http-server -p 8000
```Upgrade de torres existentes
- [ ] Venda de torres
- [ ] Mais tipos de torres (splash damage, slow, poison)
- [ ] Boss enemies em waves específicas
- [ ] Sistema de pause
- [ ] Efeitos sonoros e música
- [ ] Animações de explosão e partículas
- [ ] Sistema de conquistas
- [ ] Save/load do progresso
- [ ] Múltiplos mapas/níveis
- [ ] Dificuldades ajustáveis
- [ ] Range indicator ao selecionar torre
- [ ] Validação de construção no caminho

## 🐛 Debug e Desenvolvimento

### **Compilar e Watch**
```bash
npm run watch
```
Recompila automaticamente quando detecta mudanças nos arquivos `.ts`

### **Verificar Erros de Tipo**
```bash
npx tsc --noEmit
```

### **Estrutura de Arquivos Gerados**
Após `npm run build`, a pasta `dist/` conterá:
```
dist/
├── main.js (+ .js.map)
├── types.js (+ .js.map)
├── utils.js (+ .js.map)
├── config.js (+ .js.map)
├── state.js (+ .js.map)
├── wave.js (+ .js.map)
├── update.js (+ .js.map)
├── render.js (+ .js.map)
└── entities/
    ├── Enemy.js (+ .js.map)
    ├── Tower.js (+ .js.map)
    └── Projectile.js (+ .js.map)
```

## 📚 Aprendizados da Migração

### **JavaScript → TypeScript**
- ✅ Detecção de erros em tempo de compilação
- ✅ Autocompletar melhorado na IDE
- ✅ Documentação através de tipos
- ✅ Refatoração mais segura

### **Procedural → OOP**
- ✅ Encapsulamento de dados e comportamento
- ✅ Código mais modular e reutilizável
- ✅ Facilita adição de novos tipos (torres/inimigos)
- ✅ Melhor organização do código

### **Padrões de Design Aplicados**
- **Singleton**: State management
- **Factory Pattern**: Criação de entities baseada em tipo
- **Game Loop**: Update-Render cycle
- **Observer Pattern**: Event listeners para UI │   ├── config.js (path)
    │   └── utils.js (clamp)
    │
    └── volta ao game loop
```

## 📄 Licença

Este é um projeto educacional/MVP desenvolvido para demonstração de conceitos de game development com Canvas API.
