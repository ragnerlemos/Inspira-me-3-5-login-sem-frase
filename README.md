# InspiraMe3.0 🎨✨

> **App de Criação de Imagens e Vídeos Inspiracionais com Efeitos Profissionais**

InspiraMe3.0 é um editor de imagens e vídeos especializado em criar quotes inspiracionais com efeitos cinematográficos. Desenvolvido como um web app Next.js, empacotado com Capacitor para uma experiência nativa em Android.

---

## 🎯 Sobre o Projeto

InspiraMe3.0 é uma plataforma de criação de conteúdo motivacional que permite aos usuários:
- ✍️ Criar quotes inspiracionais personalizadas
- 🎬 Editar vídeos com efeitos profissionais
- 🖼️ Aplicar filtros e efeitos a imagens
- 💾 Salvar projetos na nuvem (Firebase)
- 📤 Compartilhar diretamente em múltiplas redes sociais

**Desenvolvido por:** Efeitos Filmes e Imagens  
**Licença:** MIT

---

## ✨ Features

### 📱 Criação de Conteúdo
- Editor de imagens com efeitos em tempo real
- Editor de vídeos com múltiplos filtros
- Biblioteca de templates profissionais
- Ajuste de cores, contraste e brilho
- Aplicação de efeitos cinematográficos

### 🎨 Efeitos e Filtros
- Efeitos de filme (vintage, cinematic, etc.)
- Filtros de cor customizáveis
- Blur, sharpen, distortion
- Transições suaves
- Sobreposição de texto com fontes Google

### 📤 Compartilhamento Nativo
Compartilhe seus criados para:
- **WhatsApp**
- **Telegram**
- **Instagram**
- **Facebook**
- **Instagram Stories**
- **TikTok**
- **Kwai**
- **YouTube**
- **Android Native Share** (todos os apps instalados)

### 💾 Armazenamento
- Salvamento automático de rascunhos (localStorage)
- Backup na nuvem (Firebase Firestore)
- Galeria de projetos pessoais
- Favoritos e histórico

---

## 🏗️ Arquitetura

### Stack Tecnológico
```
Frontend: Next.js 14 + React 18 + TypeScript
UI: Radix UI + Tailwind CSS
Backend: Firebase (Auth, Firestore, Storage)
Mobile: Capacitor 6 (Android/iOS)
Editor: Canvas + html-to-image
APIs: Google Fonts, Social Share APIs
```

### Estrutura de Pastas
```
InspiraMe3.0/
├── src/
│   ├── app/              # Páginas Next.js
│   │   ├── (main)/       # Layout principal
│   │   ├── page.tsx      # Home
│   │   ├── projetos/     # Gerenciamento de projetos
│   │   ├── editor/       # Editor principal
│   │   ├── galeria/      # Galeria de imagens
│   │   └── compartilhar/ # Página de compartilhamento
│   ├── components/       # Componentes React reutilizáveis
│   ├── hooks/            # Custom React Hooks
│   │   ├── use-projects.ts       # Gerenciamento de projetos
│   │   ├── use-image-editor.ts   # Edição de imagens
│   │   ├── use-effects.ts        # Efeitos e filtros
│   │   ├── use-gallery.ts        # Galeria de imagens
│   │   ├── use-camera.ts         # Integração câmera (Capacitor)
│   │   ├── use-social-share.ts   # Compartilhamento social
│   │   ├── use-drafts.ts         # Salvamento de rascunhos
│   │   ├── use-favorites.ts      # Favoritos
│   │   ├── use-stats.ts          # Estatísticas
│   │   └── use-templates.ts      # Templates
│   ├── firebase/         # Configuração Firebase
│   ├── lib/              # Utilitários
│   └── styles/           # CSS global
├── public/               # Assets estáticos
├── capacitor.config.ts   # Configuração Capacitor
├── package.json          # Dependências
└── README.md             # Este arquivo
```

### Custom Hooks
O projeto utiliza diversos custom hooks para organizar a lógica:

| Hook | Propósito |
|------|-----------|
| `use-projects` | CRUD de projetos e gerenciamento de estado |
| `use-image-editor` | Lógica de edição de imagens (filtros, efeitos) |
| `use-effects` | Aplicação de efeitos cinematográficos |
| `use-gallery` | Carregamento e gerenciamento de galeria |
| `use-camera` | Integração com câmera do dispositivo (Capacitor) |
| `use-social-share` | Compartilhamento em redes sociais |
| `use-drafts` | Auto-save de rascunhos em localStorage |
| `use-favorites` | Gerenciamento de favoritos |
| `use-stats` | Rastreamento de estatísticas de uso |
| `use-templates` | Carregamento de templates pré-definidos |
| `use-google-fonts` | Integração com Google Fonts API |
| `use-toast` | Notificações do usuário |

---

## 🚀 Setup e Instalação

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn
- Git
- Java Development Kit (JDK) 11+ (para Android)
- Android SDK (para compilação)

### Instalação Local

1. **Clone o repositório:**
```bash
git clone https://github.com/ragnerlemos/InspiraMe3.0.git
cd InspiraMe3.0
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Configure as variáveis de ambiente:**
Copie `.env.local` para `.env.local` e preencha os valores corretos:
```bash
cp .env.local .env.local
```

Edite o `.env.local` com as credenciais do Firebase e do Google Sheets.

4. **Execute em desenvolvimento:**
```bash
npm run dev
```

5. **Acesse no navegador:**
```
http://localhost:3000
```

---

## 🏗️ Build e Deployment

### Build para Produção (Web)

```bash
npm run build
npm run start
```

O app será otimizado e pronto para deploy em plataformas como:
- Firebase Hosting
- Vercel
- Netlify
- Google Cloud App Hosting

### Deploy com Capacitor (Android/iOS)

#### 1. Build da Web
```bash
npm run build
```

#### 2. Sincronize com Capacitor
```bash
npx cap sync
```

#### 3. Adicione plataformas (se ainda não tiver)
```bash
npx cap add android
npx cap add ios
```

#### 4. Abra o IDE nativo
```bash
# Para Android (Android Studio)
npx cap open android

# Para iOS (Xcode)
npx cap open ios
```

#### 5. Compile e execute
- **Android:** Clique em "Run" no Android Studio (ou pressione Shift+F10)
- **iOS:** Clique em "Play" no Xcode (ou pressione Cmd+R)

#### 6. Build de release
```bash
# Android
cd android
./gradlew assembleRelease
cd ..

# iOS
cd ios
xcodebuild -workspace App.xcworkspace -scheme App -configuration Release
cd ..
```

---

## 🔄 Fluxo do Usuário

```
1. AUTENTICAÇÃO
   ↓
   └─ Login / Cadastro

2. CRIAR PROJETO
   ↓
   └─ Selecionar template ou começar do zero

3. EDITAR CONTEÚDO
   ├─ Adicionar imagem/vídeo
   ├─ Aplicar efeitos e filtros
   ├─ Adicionar texto (quote)
   ├─ Ajustar cores e composição
   └─ Auto-save em localStorage

4. SALVAR/PUBLICAR
   ├─ Salvar projeto no Firebase
   ├─ Exportar como imagem/vídeo
   └─ Arquivo armazenado em Firebase Storage

5. COMPARTILHAR
   ├─ Selecionar rede social
   ├─ Abrir aplicativo nativo
   └─ Compartilhar conteúdo criado

6. GERENCIAR
   ├─ Visualizar histórico de projetos
   ├─ Adicionar aos favoritos
   ├─ Deletar projetos antigos
   └─ Visualizar estatísticas de uso
```

---

## 📋 Boas Práticas de Desenvolvimento

### Padrão de Commits (Conventional Commits)

Siga o padrão [Conventional Commits](https://www.conventionalcommits.org/):

```
<tipo>[escopo opcional]: <descrição>

[corpo opcional]

[rodapé(s) opcional(is)]
```

**Tipos permitidos:**
- `feat:` Nova feature
- `fix:` Correção de bug
- `docs:` Mudanças na documentação
- `style:` Formatação, sem mudança de lógica
- `refactor:` Refatoração de código
- `perf:` Melhoria de performance
- `test:` Adição ou atualização de testes
- `chore:` Tarefas diversas (dependências, config, etc)

**Exemplos:**
```bash
git commit -m "feat: add social media sharing for TikTok"
git commit -m "fix: correct blur filter application on images"
git commit -m "docs: update README with deployment instructions"
git commit -m "chore: update Firebase SDK to v10.13"
```

### Estrutura de Branches

```
main               → Produção
├── develop        → Base para features
│   ├── feature/   → Novas features
│   ├── bugfix/    → Correções
│   └── hotfix/    → Correções urgentes
```

**Exemplo:**
```bash
git checkout -b feature/color-picker-enhancement
git checkout -b bugfix/export-format-issue
```

### Linguagem de Código
- **Variáveis e funções:** Inglês
- **Comentários importantes:** Inglês
- **Commits e PRs:** Inglês
- **Documentação:** Português (PT-BR)

---

## 🛠️ Dependências Principais

### Runtime
```json
{
  "next": "14.2.35",
  "react": "^18",
  "react-dom": "^18",
  "@radix-ui/*": "UI components",
  "tailwindcss": "^3.4.1",
  "firebase": "^10.12.4",
  "html-to-image": "^1.11.11",
  "@capacitor/core": "^6.1.0",
  "googleapis": "^140.0.1"
}
```

### Desenvolvimento
```json
{
  "typescript": "^5",
  "eslint": "^8",
  "tailwindcss": "^3.4.1"
}
```

---

## 🤝 Como Contribuir

1. **Fork o repositório**
```bash
# No GitHub, clique em "Fork"
```

2. **Clone seu fork**
```bash
git clone https://github.com/SEU_USUARIO/InspiraMe3.0.git
cd InspiraMe3.0
```

3. **Crie uma branch de feature**
```bash
git checkout -b feature/sua-feature-incrivel
```

4. **Faça suas alterações**
```bash
# Implemente sua feature
npm run dev  # Teste
```

5. **Commit com mensagem descritiva**
```bash
git commit -m "feat: add awesome new feature"
```

6. **Push para seu fork**
```bash
git push origin feature/sua-feature-incrivel
```

7. **Crie um Pull Request**
   - Vá para o repositório principal
   - Clique em "Pull Request" → "New Pull Request"
   - Selecione seu fork e branch
   - Descreva suas mudanças
   - Aguarde revisão

---

## 🐛 Reportar Issues

Encontrou um bug? Siga os passos:

1. Vá para a aba [Issues](https://github.com/ragnerlemos/InspiraMe3.0/issues)
2. Clique em "New Issue"
3. Descreva:
   - O que você esperava que acontecesse
   - O que realmente aconteceu
   - Como reproduzir o problema
   - Screenshots/vídeos (se aplicável)
   - Seu ambiente (browser, dispositivo, SO)

---

## 📦 Variáveis de Ambiente

Crie um arquivo `.env.local` com base no `.env.local.example` e preencha os valores corretos:

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=xxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxx
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxx
NEXT_PUBLIC_FIREBASE_APP_ID=xxx

# APIs
NEXT_PUBLIC_GOOGLE_FONTS_API_KEY=xxx

# Google Sheets
SPREADSHEET_ID=xxx
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Configuração
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_MAX_FILE_SIZE=52428800
```

Observação: `GOOGLE_PRIVATE_KEY` deve estar no formato de string com `\n` para que as quebras de linha funcionem corretamente.

---

## 📱 Plataformas Suportadas

| Plataforma | Status | Notas |
|-----------|--------|-------|
| Web (Desktop) | ✅ Suportado | Chrome, Firefox, Safari, Edge |
| Android | ✅ Suportado | Android 8+ via Capacitor |
| iOS | ⚠️ Em desenvolvimento | Requer código assinado |
| PWA | ✅ Suportado | Instalável em dispositivos |

---

## 📄 Licença

Este projeto é licenciado sob a Licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

**Copyright © 2026 - Efeitos Filmes e Imagens**

---

## 📞 Suporte

- 📧 Email: [seu-email@exemplo.com]
- 💬 Discord: [seu-servidor-discord]
- 🐦 Twitter: [@seu_usuario]
- 📱 Instagram: [@seu_usuario]

---

## 🙏 Agradecimentos

Agradecimentos especiais a:
- Comunidade Next.js
- Capacitor Team
- Radix UI
- Firebase Team
- Todos os contribuidores

---

**Desenvolvido com ❤️ por Efeitos Filmes e Imagens**