-- 🔧 CORREÇÃO URGENTE: Remover constraint NOT NULL da coluna sector
-- Problema: Sistema híbrido funcionando, mas Supabase rejeitando dados com sector = null

-- Remover constraint NOT NULL da coluna sector
ALTER TABLE fii_data ALTER COLUMN sector DROP NOT NULL;

-- Verificar se a alteração foi aplicada
SELECT 
    column_name,
    is_nullable,
    data_type
FROM information_schema.columns 
WHERE table_name = 'fii_data' 
AND column_name = 'sector';

-- Mensagem de sucesso
SELECT '✅ Constraint NOT NULL removida da coluna sector com sucesso!' as status; 