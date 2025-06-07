-- 🔧 Script para configurar schema do Supabase para uso EXCLUSIVO do Claude
-- Execute este script no SQL Editor do Supabase

-- ✅ 1. Verificar se a tabela user_settings existe
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'user_settings'
);

-- ✅ 2. Verificar colunas existentes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_settings' 
AND table_schema = 'public';

-- ✅ 3. Adicionar coluna claude_api_key se não existir
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_settings' 
        AND column_name = 'claude_api_key'
    ) THEN 
        ALTER TABLE user_settings ADD COLUMN claude_api_key TEXT;
        RAISE NOTICE 'Coluna claude_api_key adicionada com sucesso';
    ELSE 
        RAISE NOTICE 'Coluna claude_api_key já existe';
    END IF; 
END $$;

-- ✅ 4. Adicionar coluna brapi_token se não existir
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_settings' 
        AND column_name = 'brapi_token'
    ) THEN 
        ALTER TABLE user_settings ADD COLUMN brapi_token TEXT;
        RAISE NOTICE 'Coluna brapi_token adicionada com sucesso';
    ELSE 
        RAISE NOTICE 'Coluna brapi_token já existe';
    END IF; 
END $$;

-- ✅ 5. Remover colunas do OpenAI se existirem (limpeza)
DO $$ 
BEGIN 
    -- Remover openai_api_key se existir
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_settings' 
        AND column_name = 'openai_api_key'
    ) THEN 
        ALTER TABLE user_settings DROP COLUMN openai_api_key;
        RAISE NOTICE 'Coluna openai_api_key removida (não mais necessária)';
    END IF;
    
    -- Remover ai_provider se existir
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_settings' 
        AND column_name = 'ai_provider'
    ) THEN 
        ALTER TABLE user_settings DROP COLUMN ai_provider;
        RAISE NOTICE 'Coluna ai_provider removida (não mais necessária)';
    END IF;
END $$;

-- ✅ 6. Verificar estrutura final da tabela
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_settings' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- ✅ 7. Verificar dados existentes (sem mostrar API keys por segurança)
SELECT 
    user_id,
    CASE 
        WHEN claude_api_key IS NOT NULL AND claude_api_key != '' 
        THEN 'CONFIGURADO' 
        ELSE 'NÃO CONFIGURADO' 
    END as claude_status,
    CASE 
        WHEN brapi_token IS NOT NULL AND brapi_token != '' 
        THEN 'CONFIGURADO' 
        ELSE 'NÃO CONFIGURADO' 
    END as brapi_status,
    created_at,
    updated_at
FROM user_settings
ORDER BY updated_at DESC;

-- ✅ 8. Comentário final
SELECT 'Schema configurado para uso EXCLUSIVO do Claude Opus 4!' as status; 