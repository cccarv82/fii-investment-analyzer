-- 🚀 Script para adicionar colunas de dividendo mensal à tabela investments
-- Execute este script no SQL Editor do Supabase

-- ✅ 1. Verificar estrutura atual da tabela investments
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'investments' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- ✅ 2. Adicionar coluna dividend_yield_monthly se não existir
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'investments' 
        AND column_name = 'dividend_yield_monthly'
    ) THEN 
        ALTER TABLE investments ADD COLUMN dividend_yield_monthly DECIMAL(10,4) DEFAULT 0;
        RAISE NOTICE 'Coluna dividend_yield_monthly adicionada com sucesso';
    ELSE 
        RAISE NOTICE 'Coluna dividend_yield_monthly já existe';
    END IF; 
END $$;

-- ✅ 3. Verificar se a coluna pvp existe e tem o tipo correto
DO $$ 
BEGIN 
    -- Verificar se pvp existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'investments' 
        AND column_name = 'pvp'
    ) THEN 
        ALTER TABLE investments ADD COLUMN pvp DECIMAL(10,4) DEFAULT 0;
        RAISE NOTICE 'Coluna pvp adicionada com sucesso';
    ELSE 
        RAISE NOTICE 'Coluna pvp já existe';
    END IF; 
END $$;

-- ✅ 4. Adicionar coluna updated_at se não existir
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'investments' 
        AND column_name = 'updated_at'
    ) THEN 
        ALTER TABLE investments ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Coluna updated_at adicionada com sucesso';
    ELSE 
        RAISE NOTICE 'Coluna updated_at já existe';
    END IF; 
END $$;

-- ✅ 5. Verificar estrutura final da tabela
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'investments' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- ✅ 6. Comentário final
SELECT 'Colunas de dividendo mensal adicionadas com sucesso!' as status; 