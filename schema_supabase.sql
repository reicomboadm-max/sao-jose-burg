-- =========================================================================
-- BANCO DE DADOS SÃO JOSÉ BURGUER (SUPABASE / POSTGRESQL)
-- Execute este script no "SQL Editor" do seu painel Supabase.
-- =========================================================================

-- 1. TABELA DE CLIENTES (CUSTOMERS)
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    cpf TEXT,
    address TEXT,
    neighborhood TEXT,
    city TEXT DEFAULT 'Pedreiras',
    total_orders INTEGER DEFAULT 1,
    total_spent NUMERIC(10,2) DEFAULT 0.00,
    last_order_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices de Alta Velocidade para Clientes (evita lentidão em buscas)
CREATE UNIQUE INDEX IF NOT EXISTS idx_customers_phone ON public.customers (phone);
CREATE INDEX IF NOT EXISTS idx_customers_name ON public.customers (name);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON public.customers (created_at DESC);

-- 2. TABELA DE PEDIDOS (ORDERS)
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_address TEXT,
    neighborhood TEXT,
    mode TEXT DEFAULT 'delivery', -- 'delivery', 'pickup', 'dine_in'
    table_number TEXT,
    payment_method TEXT DEFAULT 'PIX',
    is_paid BOOLEAN DEFAULT FALSE,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    subtotal NUMERIC(10,2) DEFAULT 0.00,
    delivery_fee NUMERIC(10,2) DEFAULT 0.00,
    discount NUMERIC(10,2) DEFAULT 0.00,
    total NUMERIC(10,2) NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'preparing', 'delivery', 'completed', 'cancelled'
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices de Alta Velocidade para Pedidos (Garante painel rápido mesmo com 100.000 pedidos)
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON public.orders (customer_phone);

-- 3. HABILITAR ROW LEVEL SECURITY (RLS) COM POLÍTICAS DE ACESSO
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Políticas Públicas Seguras (Permite que o site insira clientes e pedidos com a chave pública anon)
CREATE POLICY "Permitir insercao publica de clientes" 
ON public.customers FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Permitir leitura publica de clientes" 
ON public.customers FOR SELECT 
USING (true);

CREATE POLICY "Permitir atualizacao publica de clientes" 
ON public.customers FOR UPDATE 
USING (true);

CREATE POLICY "Permitir insercao publica de pedidos" 
ON public.orders FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Permitir leitura publica de pedidos" 
ON public.orders FOR SELECT 
USING (true);

CREATE POLICY "Permitir atualizacao publica de pedidos" 
ON public.orders FOR UPDATE 
USING (true);

-- 4. HABILITAR REALTIME NO SUPABASE PARA A TABELA DE PEDIDOS
-- Permite que o Painel do Admin receba pedidos instantaneamente via WebSocket
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
