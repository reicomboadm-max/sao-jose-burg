# Restaurant Tangub City &bull; São José Burger

Landing page de alta fidelidade para hamburgueria artesanal desenvolvida com **Tailwind CSS**, tipografia refinada (**Plus Jakarta Sans**, **Inter**, **Geist**), estrutura em **Bento Grid**, animações com curvas `cubic-bezier(0.16, 1, 0.3, 1)` e sistema interativo de pedidos com checkout direto no **WhatsApp**.

---

## 🚀 Como Visualizar o Site

Você pode abrir o arquivo diretamente em qualquer navegador moderno:
1. Abra o arquivo [index.html](file:///C:/Users/Thiago/.gemini/antigravity-ide/scratch/sao-jose-burger/index.html) no Chrome, Edge ou Firefox.
2. Ou inicie um servidor local simples:
   ```bash
   npx serve C:\Users\Thiago\.gemini\antigravity-ide\scratch\sao-jose-burger
   ```

---

## 🎨 Especificações de Design e Fidelidade Aplicadas

- **Moldura Device Frame**: Contêiner com `max-w-[1600px]`, `rounded-[3rem]`, `shadow-2xl` e `ring-8 ring-white`.
- **Hero Section (92vh)**:
  - Imagem de fundo com `scale-105`, `opacity-90` e gradiente multicamadas.
  - Floating pills nos cantos superiores (Status Aberto + Avaliação 4.9 estrelas + Sacola de pedidos).
  - Título principal com `text-5xl md:text-8xl`, `font-medium` e `leading-[1.05]`.
  - Botão CTA Branco (Cardápio) e Botão Glass-Panel com ícone verde circular (WhatsApp).
- **Seção Sobre & Cardápio (Grid 12 colunas)**:
  - Lado esquerdo (5 cols): Badge "ABOUT US", história do blend e 3 checkmarks com ícones `bg-green-100`.
  - Lado direito (7 cols): Contêiner `bg-stone-50` com grid de 6 produtos interativos e efeito `hover:scale-105`.
- **Dark Experience (Bento Grid em `bg-stone-950`)**:
  - Card 1 (1 col): Lista de diferenciais com marcadores pontilhados brancos.
  - Card 2 (2 cols): Foto de atmosfera do salão com `opacity-50`, gradiente e zoom suave no hover.
  - Card 3 (3 cols): Ícone de acessibilidade em `bg-blue-600` e tags de comodidades arredondadas (`rounded-xl`).
- **Localização & Horários**:
  - Card 1 Branco: Ícone de mapa, endereço e rodapé com detalhes de estacionamento.
  - Card 2 Preto: Ícone de relógio, horários com divisores `border-white/10` e badge vermelha de "Fechado" para segunda-feira.
- **CTA de Contato & Pagamento**:
  - Fundo `bg-stone-900` com textura de cubos a `opacity-5`.
  - Botão de telefone branco e botão verde de WhatsApp com sombra personalizada.
  - Formas de pagamento no rodapé: Cartão de Crédito, Débito, NFC (Aproximação) e Pix.
- **Interatividade Completa**:
  - Sacola lateral (Drawer) que calcula subtotais em tempo real e formata o pedido com observações para envio automático no WhatsApp.
