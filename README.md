# RetroPocket SNES

Um emulador SNES completo para dispositivos móveis Android, usando Nostalgist.js (SNES9x) com controles táteis otimizados.

## 🎮 Características

- ✅ **Emulação SNES completa** via Nostalgist.js
- ✅ **Controles táteis responsivos** com feedback visual
- ✅ **Mapeamentos duplos** de botões para melhor compatibilidade
- ✅ **Save States** via IndexedDB
- ✅ **APK nativo Android** via Capacitor
- ✅ **CI/CD automático** via GitHub Actions

## 🕹️ Controles

### Layout Padrão
- **A, B, X, Y**: Ações principais
- **L, R**: Botões de ombro
- **SELECT, START**: Botões de menu
- **D-PAD**: Movimentação (toque e arraste)

### Layout Alternativo
- **A, B, X, Y**: Mapeamento alternativo (J, K, U, I)
- **L, R**: Botões de ombro alternativos (O, P)
- **SELECT**: Espaço
- **START**: Enter

## 📱 Instalação APK

### Método 1: GitHub Actions (Automático)
1. Faça push para repositório GitHub
2. Vá para **Actions** → **Build Android APK**
3. Aguarde e baixe o APK em **Artifacts**

### Método 2: Build Local
```bash
npm install
npm run build
npx cap add android
npx cap sync android
npx cap open android
# Build APK no Android Studio
```

## 🛠️ Desenvolvimento

```bash
npm install          # Instalar dependências
npm run dev          # Servidor de desenvolvimento
npm run build        # Build para produção
```

## 📁 Estrutura

```
├── src/                    # Código fonte
├── android/                # Projeto Android (Capacitor)
├── app/                    # Código nativo customizado
├── .github/workflows/      # CI/CD
├── dist/                   # Build output
└── package.json            # Dependências
```

**📖 Veja [ANDROID-STRUCTURE.md](ANDROID-STRUCTURE.md) para explicação detalhada das pastas `android` e `app`**

## 🎯 Funcionalidades dos Controles

- **Painel de Debug**: Teste botões e alterne layouts
- **Feedback Tátil**: Vibração em botões pressionados
- **Zona Morta Otimizada**: D-PAD responsivo
- **Múltiplos Inputs**: Eventos para Nostalgist.js + fallback

**Desenvolvido com React + TypeScript + Capacitor + Nostalgist.js**
