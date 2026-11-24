# SafeCash — Documentação do Frontend

## Projeto publicado

- **Vídeo Demonstrativo:** https://drive.google.com/file/d/1ExJLDZD8T8nJT7cj_61qfOAIg0TyBrAU/view?usp=sharing
- **Site:** https://safecash3b.netlify.app/
- **Hospedagem:** Netlify
- **API:** https://backend-sa-lkje.onrender.com

O frontend usa `VITE_API_URL` para acessar a API. Essa variável é incorporada no build; no Netlify, configure-a com `https://backend-sa-lkje.onrender.com` e publique um novo deploy sempre que alterar o valor.

## 1. Visão geral

O frontend utiliza **React + Vite + Axios**.

Ele é responsável pela interface do usuário, autenticação no lado do
cliente, gerenciamento das transações e comunicação com a API Express.

``` text
Usuário
   │
   ▼
React + Vite
   │
   ▼
Axios
   │
   │ HTTP + JSON + JWT
   ▼
API Node.js + Express
```

O frontend não acessa diretamente PostgreSQL ou Prisma.

------------------------------------------------------------------------

## 2. Estrutura atual

``` text
sa-frontend/
├── src/
│   ├── components/
│   │   ├── Dashboard.jsx
│   │   ├── Formulario.jsx
│   │   ├── Login.jsx
│   │   ├── Sidebar.jsx
│   │   └── Tabela.jsx
│   ├── services/
│   │   ├── api.js
│   │   ├── authService.js
│   │   └── transactionService.js
│   ├── App.jsx
│   ├── App.css
│   └── main.jsx
├── public/
└── package.json
```

------------------------------------------------------------------------

## 3. Autenticação

A autenticação utiliza JWT recebido do backend.

O fluxo é:

``` text
Login.jsx
    │
    ▼
authService.login()
    │
    ▼
POST /auth/login
    │
    ▼
Backend
    │
    ▼
JWT + usuário
    │
    ▼
localStorage
    │
    ▼
Axios
```

O token é armazenado como:

``` text
authToken
```

------------------------------------------------------------------------

## 4. Axios

O arquivo:

``` text
src/services/api.js
```

cria a instância do Axios.

A URL da API pode ser definida por:

``` env
VITE_API_URL=...
```

Caso a variável não exista, o frontend utiliza:

``` text
http://localhost:3000
```

Em produção, `VITE_API_URL` é obrigatória, deve usar HTTPS e é incorporada ao bundle no momento do build. O `vite.config.js` interrompe o build quando a variável está ausente ou inválida. O arquivo `.env.example` mostra o formato esperado; configure o valor real no painel do provedor e faça um novo deploy após alterá-lo.

### Deploy no Netlify

O frontend está hospedado no **Netlify**, no site `https://safecash3b.netlify.app/`. O deploy não é feito pela Vercel. No Netlify, a raiz do projeto é `sa-frontend/`, o comando de build é `npm run build` e o diretório publicado é `dist`. Configure a variável `VITE_API_URL` como `https://backend-sa-lkje.onrender.com` nas configurações do site. Como essa variável é incorporada ao bundle durante o build, faça um novo deploy após alterá-la.

Antes de cada requisição, o interceptor verifica o `authToken` e, quando
existe, adiciona:

``` http
Authorization: Bearer <token>
```

------------------------------------------------------------------------

## 5. Login e cadastro

O componente:

``` text
src/components/Login.jsx
```

possui dois modos:

-   Login;
-   Cadastro.

### Login

Valida:

-   e-mail preenchido;
-   senha preenchida.

Depois chama:

``` text
onLogin()
```

### Cadastro

Valida:

-   usuário;
-   nome;
-   e-mail;
-   senha com pelo menos 6 caracteres;
-   confirmação da senha.

Depois chama:

``` text
onRegister()
```

O `App.jsx` recebe essas ações e utiliza `authService`.

------------------------------------------------------------------------

## 6. Serviços de autenticação

O arquivo:

``` text
src/services/authService.js
```

possui:

``` text
login()
register()
getCurrentUser()
logout()
```

### Login

``` text
POST /auth/login
```

### Cadastro

``` text
POST /auth/register
```

### Usuário atual

``` text
GET /auth/me
```

### Logout

``` text
POST /auth/logout
```

Além da chamada ao backend, o logout remove o JWT do `localStorage`.

Como o sistema utiliza JWT stateless, a remoção local do token é a etapa
principal do logout.

------------------------------------------------------------------------

## 7. Inicialização da aplicação

O `App.jsx` verifica a autenticação ao iniciar.

Fluxo:

``` text
App inicia
   │
   ▼
getCurrentUser()
   │
   ▼
GET /auth/me
   │
   ├── JWT válido
   │      ↓
   │   define user
   │      ↓
   │   carrega transações
   │
   └── erro
          ↓
      remove token
          ↓
       Login.jsx
```

Enquanto essa verificação ocorre, a aplicação mostra:

``` text
Carregando...
```

------------------------------------------------------------------------

## 8. Gerenciamento de transações

O arquivo:

``` text
src/services/transactionService.js
```

concentra as chamadas da API.

  Função                  Método   Endpoint
  ----------------------- -------- ---------------------
  `getTransactions()`     GET      `/transactions`
  `createTransaction()`   POST     `/transactions`
  `updateTransaction()`   PUT      `/transactions/:id`
  `deleteTransaction()`   DELETE   `/transactions/:id`

Todas as chamadas utilizam a instância Axios e, portanto, recebem
automaticamente o JWT.

------------------------------------------------------------------------

## 9. Componentes principais

### `Dashboard.jsx`

Exibe os dados financeiros e recebe as transações do `App.jsx`.

O saldo é calculado no frontend:

``` text
entrada → soma
saida   → subtração
```

Portanto, o cálculo do saldo não é responsabilidade do PostgreSQL ou do
Prisma.

### `Formulario.jsx`

Permite criar ou editar uma transação.

A operação é encaminhada ao `App.jsx`, que decide entre:

``` text
createTransaction()
```

ou:

``` text
updateTransaction()
```

### `Tabela.jsx`

Exibe as transações e permite:

-   edição;
-   exclusão.

### `Sidebar.jsx`

Controla a navegação principal, mostra informações do usuário e executa
o logout.

------------------------------------------------------------------------

## 10. Fluxo de uma transação

``` text
Formulario.jsx
      │
      ▼
App.jsx
      │
      ▼
transactionService
      │
      ▼
Axios
      │
      │ Authorization: Bearer JWT
      ▼
Express
      │
      ▼
JWT Middleware
      │
      ▼
Transaction Controller
      │
      ▼
Prisma
      │
      ▼
PostgreSQL
      │
      ▼
JSON
      │
      ▼
React
      │
      ▼
Dashboard / Tabela
```

------------------------------------------------------------------------

## 11. Estado principal do `App.jsx`

O componente principal controla:

``` text
transactions
activeTab
booting
loading
error
message
user
selectedTransaction
```

O `user` determina se a aplicação mostra:

``` text
Login
```

ou:

``` text
Aplicação principal
```

As transações ficam no estado do React depois de carregadas da API.

------------------------------------------------------------------------

## 12. Logout

Ao sair:

1.  O frontend tenta chamar `/auth/logout`.
2.  O token é removido do `localStorage`.
3.  O usuário é removido do estado.
4.  As transações são limpas.
5.  A tela retorna para o login.

Mesmo que a API esteja indisponível, o `finally` garante a remoção local
do token.

------------------------------------------------------------------------

## 13. Validação do fluxo

O fluxo implementado atualmente é:

``` text
Usuário
   ↓
Login.jsx
   ↓
authService
   ↓
Axios
   ↓
/auth/login
   ↓
JWT
   ↓
localStorage
   ↓
Axios Interceptor
   ↓
Authorization: Bearer JWT
   ↓
Express
   ↓
requireAuth
   ↓
Controllers
   ↓
Prisma
   ↓
PostgreSQL
```

## 14. Checklist atual

-   [x] React + Vite.
-   [x] Tela de login.
-   [x] Tela de cadastro.
-   [x] Integração com `/auth/login`.
-   [x] Integração com `/auth/register`.
-   [x] JWT armazenado no frontend.
-   [x] Interceptor Axios.
-   [x] Bearer Token automático.
-   [x] Recuperação do usuário por `/auth/me`.
-   [x] Logout.
-   [x] CRUD de transações.
-   [x] Tratamento de erros.
-   [x] Cálculo do saldo no frontend.
-   [x] Separação entre componentes e serviços.
