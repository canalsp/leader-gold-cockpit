# Leader Gold Cockpit (backend)

APIs e painel administrativo da Leader I.T — deploy na Vercel com Supabase.

Repositório: **https://github.com/canalsp/leader-gold-cockpit**  
Site (frontend): **https://github.com/canalsp/leader-gold**

## Objetivo inicial

- Gerenciar posts no backend.
- Importar posts legados do MySQL para o Supabase.
- Disponibilizar acesso administrativo mock com tela de login.

## Estrutura

- `api/health.ts` - endpoint de health check.
- `api/posts.ts` - lista posts do Supabase.
- `api/import-posts.ts` - executa importacao do MySQL para Supabase.
- `api/auth/login.ts` - login mock e emissao de cookie.
- `api/auth/me.ts` - retorna sessao autenticada.
- `api/auth/logout.ts` - encerra sessao.
- `lib/` - clientes e mapeadores.
- `services/import-posts.ts` - regra de importacao.
- `index.html` + `public/` - UI inicial do cockpit (login/dashboard).

## Variaveis de ambiente

Copie `.env.example` para `.env` e ajuste os valores.

## Fluxo de importacao

1. Ler posts da tabela `posts` no MySQL legado.
2. Mapear para o formato do Supabase.
3. Fazer `upsert` no Supabase usando `legacy_id` como conflito.

## Login mock (fase inicial)

- Fluxo de autenticacao por cookie HttpOnly.
- Credenciais definidas por variaveis `COCKPIT_AUTH_*`.
- Endpoints de posts/importacao protegidos por sessao.
- Evoluir para auth real antes de usar em producao definitiva.

## Desenvolvimento local (`npm run dev`)

O comando `npm run dev` sobe **UI + rotas `/api`** na porta **3100** (`PORT` opcional).

### 1. Criar o `.env` nesta pasta (raiz do cockpit)

```powershell
copy .env.example .env
```

Edite `.env` e preencha pelo menos:

- `SUPABASE_URL` — URL do projeto (Settings → API no Supabase)
- `SUPABASE_SERVICE_ROLE_KEY` — chave **service_role** (não a anon do front)
- `OPENAI_API_KEY` — para chatbot do site e SEO no admin (opcional sem quota)
- `OPENAI_MODEL` — ex.: `gpt-4o-mini`

### 2. Subir o servidor

```powershell
npm install
npm run dev
```

Deve aparecer: `[cockpit] UI + APIs em http://127.0.0.1:3100`

Se der `Missing environment variable: SUPABASE_URL`, falta variável no `.env` desta pasta ou o ficheiro não existe.

### Pacote Instagram (blog)

No editor de posts, marque **Preparar pacote Instagram** para gerar ao salvar:

- imagem recortada para **feed (4:5)** ou **story (9:16)** a partir da imagem destacada;
- legenda curta e hashtags (OpenAI, se `OPENAI_API_KEY` estiver definida);
- download da imagem e copiar legenda para publicação manual.

Rode no Supabase SQL Editor: `sql/posts-instagram.sql` (colunas `instagram_prepare`, `instagram_draft`).

Defina `PUBLIC_SITE_ORIGIN=https://www.leaderti.com.br` para o link do artigo na legenda.

### 3. Testar APIs (PowerShell)

```powershell
# Health (se existir rota health)
Invoke-RestMethod http://127.0.0.1:3100/api/health

# Captcha
Invoke-RestMethod http://127.0.0.1:3100/api/public/captcha

# Chat (OpenAI)
Invoke-RestMethod -Method POST -Uri http://127.0.0.1:3100/api/public/chat `
  -ContentType "application/json" `
  -Body '{"message":"Quais servicos voces oferecem?","history":[],"website":""}'
```

### 4. Site (Vite) a usar o cockpit

Na **raiz** do projeto (`leader-gold`), noutro terminal:

```powershell
npm run dev
```

Deixe `VITE_COCKPIT_API_URL` vazio no `.env` da raiz — o proxy do Vite encaminha `/api` para `http://127.0.0.1:3100`.

**Não use** `npm run dev:static` para testar APIs (só serve HTML).

No **site** (Vite na raiz do monorepo), deixe `VITE_COCKPIT_API_URL` **vazio** em dev: o proxy do Vite encaminha `/api` para `http://127.0.0.1:3100`. Ajuste com `VITE_COCKPIT_PROXY_TARGET` se a porta do cockpit for outra.

Script alternativo apenas estático (sem APIs): `npm run dev:static` (`dev-stub.cjs`).

### Chatbot do site (`POST /api/public/chat`)

Usa `OPENAI_API_KEY` e `OPENAI_MODEL` do `.env` do cockpit (mesmas variáveis do SEO). O front chama via proxy Vite `/api/public/chat` em desenvolvimento.

## Producao

Com deploy dedicado desse diretório na Vercel:

- Frontend: `https://www.leaderti.com.br`
- Backend cockpit: `https://www.leaderti.com.br/admin/cockpit`

Observacao: para expor exatamente esse path no mesmo dominio, configure rewrites/proxy no projeto principal da Vercel apontando para este backend.
