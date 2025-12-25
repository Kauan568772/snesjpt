# 📱 Estrutura Android - Explicação

## Por que existem as pastas `android` e `app`?

Este projeto possui **duas estruturas Android** para diferentes propósitos:

### 📂 `android/` - Projeto Capacitor
- **Criado automaticamente** pelo Capacitor CLI
- **Propósito**: Bridge entre web e nativo
- **Conteúdo**: 
  - Estrutura padrão do Android Studio
  - `MainActivity.java` (padrão do Capacitor)
  - Configurações para buildar APK
  - Integração com plugins Capacitor
- **Uso**: Build principal do APK via GitHub Actions

### 📂 `app/` - Código Nativo Customizado
- **Criado manualmente** para funcionalidades específicas
- **Propósito**: Código nativo adicional para emulação SNES
- **Conteúdo**:
  - `EmulatorActivity.kt` - Atividade personalizada para emulador
  - `SnesCore.kt` - Lógica core do emulador
  - `VirtualControllerView.kt` - Controles nativos
  - `native-lib.cpp` - Código C++ nativo
- **Uso**: Funcionalidades específicas não fornecidas pelo Capacitor

## 🔧 Quando usar cada uma?

### Para desenvolvimento web:
- Use a estrutura `android/` (Capacitor)
- Modifique arquivos em `src/` (React/TypeScript)
- Build: `npx cap sync android`

### Para funcionalidades nativas:
- Use a estrutura `app/` (código customizado)
- Modifique arquivos Kotlin/C++ em `app/src/main/`
- Build: Integre com projeto Android principal

## 📊 Resumo

| Pasta | Origem | Propósito | Conteúdo |
|-------|--------|-----------|----------|
| `android/` | Capacitor CLI | Bridge web-nativo | APK principal |
| `app/` | Manual | Funcionalidades nativas | Código customizado |

**Ambas são necessárias** para o funcionamento completo do emulador SNES!