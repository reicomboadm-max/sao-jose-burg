# 🍔 São José Burguer • Sistema Completo & Escalável

Sistema web profissional para o **São José Burguer**, com cardápio interativo, checkout automatizado para WhatsApp, painel administrativo com Kanban e integração com banco de dados na nuvem (**Supabase**).

---

## ⚡ Otimizações de Performance & Imagens
- **Imagens em WebP de Alta Performance:** Todas as fotos do cardápio foram convertidas e comprimidas para **WebP**, economizando mais de 16 MB no carregamento inicial.
- **Carregamento Inteligente (Lazy Loading):** As imagens são carregadas sob demanda conforme o cliente rola a página (`loading="lazy"` e `decoding="async"`).
- **Proteção de Memória:** O painel administrativo possui buffer rotativo e paginação para nunca travar ou estourar a cota de memória do navegador.

---

## ☁️ Como Ativar o Banco de Dados Supabase (Grátis)

1. Crie uma conta gratuita em [supabase.com](https://supabase.com) e crie um novo projeto.
2. Abra o **SQL Editor** no Supabase e execute o script [schema_supabase.sql](file:///c:/Users/Thiago/Desktop/Sao%20Jose%20Burger/schema_supabase.sql).
3. No painel do Supabase, vá em **Project Settings -> API** e copie:
   - **Project URL**
   - **anon / public key**
4. Abra o painel administrativo [admin.html](file:///c:/Users/Thiago/Desktop/Sao%20Jose%20Burger/admin.html), vá na aba **Configurações**, cole as duas chaves na seção **☁️ BANCO DE DADOS NA NUVEM** e clique em **Salvar Conexão**.

---

## 📂 Arquivos Principais
- [index.html](file:///c:/Users/Thiago/Desktop/Sao%20Jose%20Burger/index.html) - Cardápio digital e checkout com autofill de endereços e envio para WhatsApp e Supabase.
- [admin.html](file:///c:/Users/Thiago/Desktop/Sao%20Jose%20Burger/admin.html) - Painel do administrador (Kanban de pedidos, métricas, edição de produtos e bairros).
- [schema_supabase.sql](file:///c:/Users/Thiago/Desktop/Sao%20Jose%20Burger/schema_supabase.sql) - Script SQL para criação das tabelas `customers` e `orders` com índices de alta velocidade.
- [assets/supabase-client.js](file:///c:/Users/Thiago/Desktop/Sao%20Jose%20Burger/assets/supabase-client.js) - Módulo cliente Supabase com suporte a tempo real, paginação e fallback offline.
