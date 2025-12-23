# RetroPocket SNES

Um emulador de SNES otimizado para dispositivos móveis, rodando diretamente no navegador via WebAssembly (Nostalgist.js / SNES9x 2010).

## 📱 Como Instalar (PWA)

Este projeto é um **Progressive Web App (PWA)**. Você pode instalá-lo no seu celular sem precisar da loja de aplicativos.

1. Acesse o site no **Chrome (Android)** ou **Safari (iOS)**.
2. Toque em **Compartilhar** (iOS) ou no **Menu** (Android).
3. Selecione **"Adicionar à Tela de Início"**.
4. Abra o app criado na sua tela inicial.

## 🤖 Como Gerar o APK (Android)

Devido a restrições de exportação, o arquivo de workflow está na raiz como `build.yml`.

### Passo a Passo no GitHub:

1. Exporte este projeto para o GitHub.
2. No GitHub, crie a estrutura de pastas `.github/workflows/`.
3. Mova o arquivo `build.yml` para dentro dessa pasta (ex: `.github/workflows/build.yml`).
4. Vá para a aba **Actions** no GitHub.
5. Selecione o workflow **Build Android APK**.
6. Clique em **Run workflow**.
7. Aguarde o processo terminar e baixe o APK na seção **Artifacts**.

## 🎮 Controles

- **D-PAD**: Movimentação (Toque e arraste).
- **A, B, X, Y**: Ações.
- **L, R**: Botões de ombro (Cantos superiores da tela).
- **START, SELECT**: Menu central.
