# 🍫 Delícias da Jay — Fichas Técnicas

App mobile de fichas técnicas para confeitaria.

---

## 🚀 Como publicar (passo a passo pelo celular)

### PASSO 1 — Criar conta no GitHub
1. Abra o navegador e acesse **github.com**
2. Toque em **Sign up** (criar conta)
3. Preencha e-mail, senha e nome de usuário
4. Confirme o e-mail

### PASSO 2 — Criar repositório no GitHub
1. Após entrar, toque no **+** (canto superior direito)
2. Escolha **New repository**
3. Nome: `delicias-da-jay`
4. Deixe como **Public**
5. Toque em **Create repository**

### PASSO 3 — Enviar os arquivos
No repositório criado, toque em **uploading an existing file** e envie todos os arquivos desta pasta mantendo a estrutura:
```
index.html
package.json
vite.config.js
src/
  main.jsx
  App.jsx
```

### PASSO 4 — Criar conta no Vercel
1. Acesse **vercel.com**
2. Toque em **Sign Up**
3. Escolha **Continue with GitHub** — faz o login automático

### PASSO 5 — Publicar
1. No Vercel, toque em **Add New Project**
2. Selecione o repositório `delicias-da-jay`
3. Toque em **Deploy** — ele detecta automaticamente que é Vite/React
4. Aguarde ~1 minuto

✅ Pronto! Você receberá um link tipo `delicias-da-jay.vercel.app` que funciona em qualquer celular e computador.

---

## 📱 Como adicionar na tela inicial do celular

**iPhone:**  Abra o link no Safari → toque no ícone de compartilhar → "Adicionar à Tela de Início"

**Android:** Abra no Chrome → menu (3 pontinhos) → "Adicionar à tela inicial"

O app vai aparecer como se fosse um aplicativo instalado!

---

## 🔄 Como atualizar o app no futuro

Quando quiser atualizar (mudar algo no código), basta substituir o arquivo `src/App.jsx` no GitHub — o Vercel republica automaticamente em ~1 minuto.
