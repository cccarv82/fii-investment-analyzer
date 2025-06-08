-- 🔧 SCRIPT DE AJUSTE SUPABASE: SISTEMA HÍBRIDO FFO
-- Adiciona todas as colunas necessárias para o sistema híbrido funcionar

-- ============================================================================
-- 1. ADICIONAR COLUNAS FFO (FUNDAMENTUS DATA)
-- ============================================================================

-- Adicionar colunas FFO que estão faltando
ALTER TABLE fii_data 
ADD COLUMN IF NOT EXISTS ffo_yield DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS ffo_per_share DECIMAL(10,4),
ADD COLUMN IF NOT EXISTS ffo_12m DECIMAL(15,2),
ADD COLUMN IF NOT EXISTS ffo_3m DECIMAL(15,2);

-- ============================================================================
-- 2. ADICIONAR DADOS FINANCEIROS COMPLEMENTARES (FUNDAMENTUS)
-- ============================================================================

-- Adicionar dados financeiros complementares do Fundamentus
ALTER TABLE fii_data 
ADD COLUMN IF NOT EXISTS revenue_12m DECIMAL(15,2),
ADD COLUMN IF NOT EXISTS distributed_income_12m DECIMAL(15,2),
ADD COLUMN IF NOT EXISTS total_assets DECIMAL(15,2),
ADD COLUMN IF NOT EXISTS net_equity DECIMAL(15,2),
ADD COLUMN IF NOT EXISTS equity_per_share DECIMAL(10,4);

-- ============================================================================
-- 3. CORRIGIR NOME DA COLUNA ADMIN_FEE
-- ============================================================================

-- Adicionar coluna admin_fee (o código usa este nome)
ALTER TABLE fii_data 
ADD COLUMN IF NOT EXISTS admin_fee DECIMAL(5,2);

-- Copiar dados de admin_fee_ratio para admin_fee (se existir)
UPDATE fii_data 
SET admin_fee = admin_fee_ratio 
WHERE admin_fee_ratio IS NOT NULL AND admin_fee IS NULL;

-- ============================================================================
-- 4. CORRIGIR NOME DA COLUNA GESTORA
-- ============================================================================

-- Adicionar coluna management_company (o código usa este nome)
ALTER TABLE fii_data 
ADD COLUMN IF NOT EXISTS management_company VARCHAR(100);

-- Copiar dados de manager para management_company (se existir)
UPDATE fii_data 
SET management_company = manager 
WHERE manager IS NOT NULL AND management_company IS NULL;

-- ============================================================================
-- 5. ATUALIZAR VIEW fii_complete_data
-- ============================================================================

-- Dropar a view existente primeiro (para evitar conflitos de colunas)
DROP VIEW IF EXISTS fii_complete_data;

-- Recriar a view com as novas colunas FFO
CREATE VIEW fii_complete_data AS
SELECT 
  fd.*,
  
  -- MÉTRICAS CALCULADAS
  ROUND(fd.dividend_yield / 12, 4) as dividend_yield_monthly,
  ROUND(fd.market_cap / 1000000000.0, 2) as market_cap_billions,
  
  -- CATEGORIZAÇÃO
  CASE 
    WHEN fd.pvp <= 0.8 THEN 'MUITO_BARATO'
    WHEN fd.pvp <= 1.0 THEN 'BARATO'
    WHEN fd.pvp <= 1.2 THEN 'JUSTO'
    WHEN fd.pvp <= 1.5 THEN 'CARO'
    ELSE 'MUITO_CARO'
  END as price_to_book_category,
  
  CASE 
    WHEN fd.dividend_yield >= 12 THEN 'MUITO_ALTO'
    WHEN fd.dividend_yield >= 10 THEN 'ALTO'
    WHEN fd.dividend_yield >= 8 THEN 'BOM'
    WHEN fd.dividend_yield >= 6 THEN 'MODERADO'
    ELSE 'BAIXO'
  END as dividend_category,
  
  -- CATEGORIZAÇÃO FFO (NOVIDADE!)
  CASE 
    WHEN fd.ffo_yield >= 15 THEN 'MUITO_ALTO'
    WHEN fd.ffo_yield >= 12 THEN 'ALTO'
    WHEN fd.ffo_yield >= 9 THEN 'BOM'
    WHEN fd.ffo_yield >= 6 THEN 'MODERADO'
    ELSE 'BAIXO'
  END as ffo_yield_category,
  
  CASE 
    WHEN fd.p_ffo <= 10 THEN 'MUITO_BARATO'
    WHEN fd.p_ffo <= 15 THEN 'BARATO'
    WHEN fd.p_ffo <= 20 THEN 'JUSTO'
    WHEN fd.p_ffo <= 25 THEN 'CARO'
    ELSE 'MUITO_CARO'
  END as p_ffo_category,
  
  CASE 
    WHEN fd.liquidity >= 5000000 THEN 'MUITO_ALTA'
    WHEN fd.liquidity >= 1000000 THEN 'ALTA'
    WHEN fd.liquidity >= 500000 THEN 'MEDIA'
    WHEN fd.liquidity >= 100000 THEN 'BAIXA'
    ELSE 'MUITO_BAIXA'
  END as liquidity_category,
  
  -- SCORE GERAL PONDERADO (incluindo FFO)
  ROUND(
    (fd.quality_score * 0.3 + 
     fd.sustainability_score * 0.25 + 
     fd.growth_score * 0.2 + 
     CASE 
       WHEN fd.liquidity >= 5000000 THEN 10
       WHEN fd.liquidity >= 1000000 THEN 8
       WHEN fd.liquidity >= 500000 THEN 6
       WHEN fd.liquidity >= 100000 THEN 4
       ELSE 2
     END * 0.1 +
     -- Bonus FFO (15% do score)
     CASE 
       WHEN fd.ffo_yield IS NOT NULL AND fd.p_ffo IS NOT NULL THEN
         CASE 
           WHEN fd.ffo_yield >= 10 AND fd.p_ffo <= 15 THEN 1.5
           WHEN fd.ffo_yield >= 8 AND fd.p_ffo <= 20 THEN 1.0
           WHEN fd.ffo_yield >= 6 THEN 0.5
           ELSE 0.2
         END
       ELSE 0.5
     END * 0.15), 2
  ) as overall_score,
  
  -- NÍVEL DE RISCO CALCULADO (incluindo FFO)
  CASE 
    WHEN (
      (CASE WHEN fd.vacancy_rate > 10 THEN 2 ELSE 0 END) +
      (CASE WHEN fd.pvp > 1.5 THEN 1 ELSE 0 END) +
      (CASE WHEN fd.liquidity < 500000 THEN 2 ELSE 0 END) +
      (CASE WHEN fd.dividend_yield > 15 THEN 1 ELSE 0 END) +
      (CASE WHEN fd.debt_ratio > 60 THEN 2 ELSE 0 END) +
      (CASE WHEN fd.ffo_yield > 20 THEN 1 ELSE 0 END) +
      (CASE WHEN fd.p_ffo > 30 THEN 1 ELSE 0 END)
    ) >= 6 THEN 'ALTO'
    WHEN (
      (CASE WHEN fd.vacancy_rate > 10 THEN 2 ELSE 0 END) +
      (CASE WHEN fd.pvp > 1.5 THEN 1 ELSE 0 END) +
      (CASE WHEN fd.liquidity < 500000 THEN 2 ELSE 0 END) +
      (CASE WHEN fd.dividend_yield > 15 THEN 1 ELSE 0 END) +
      (CASE WHEN fd.debt_ratio > 60 THEN 2 ELSE 0 END) +
      (CASE WHEN fd.ffo_yield > 20 THEN 1 ELSE 0 END) +
      (CASE WHEN fd.p_ffo > 30 THEN 1 ELSE 0 END)
    ) >= 3 THEN 'MEDIO'
    ELSE 'BAIXO'
  END as risk_level,
  
  -- RATING PRELIMINAR (incluindo FFO)
  CASE 
    WHEN (
      fd.quality_score * 0.3 + 
      fd.sustainability_score * 0.25 + 
      fd.growth_score * 0.2 +
      CASE 
        WHEN fd.ffo_yield IS NOT NULL AND fd.p_ffo IS NOT NULL THEN
          CASE 
            WHEN fd.ffo_yield >= 10 AND fd.p_ffo <= 15 THEN 2.5
            WHEN fd.ffo_yield >= 8 AND fd.p_ffo <= 20 THEN 2.0
            WHEN fd.ffo_yield >= 6 THEN 1.5
            ELSE 1.0
          END
        ELSE 1.0
      END * 0.25
    ) >= 8.5 THEN 'COMPRAR_FORTE'
    WHEN (
      fd.quality_score * 0.3 + 
      fd.sustainability_score * 0.25 + 
      fd.growth_score * 0.2 +
      CASE 
        WHEN fd.ffo_yield IS NOT NULL AND fd.p_ffo IS NOT NULL THEN
          CASE 
            WHEN fd.ffo_yield >= 10 AND fd.p_ffo <= 15 THEN 2.5
            WHEN fd.ffo_yield >= 8 AND fd.p_ffo <= 20 THEN 2.0
            WHEN fd.ffo_yield >= 6 THEN 1.5
            ELSE 1.0
          END
        ELSE 1.0
      END * 0.25
    ) >= 7.0 THEN 'COMPRAR'
    WHEN (
      fd.quality_score * 0.3 + 
      fd.sustainability_score * 0.25 + 
      fd.growth_score * 0.2 +
      CASE 
        WHEN fd.ffo_yield IS NOT NULL AND fd.p_ffo IS NOT NULL THEN
          CASE 
            WHEN fd.ffo_yield >= 10 AND fd.p_ffo <= 15 THEN 2.5
            WHEN fd.ffo_yield >= 8 AND fd.p_ffo <= 20 THEN 2.0
            WHEN fd.ffo_yield >= 6 THEN 1.5
            ELSE 1.0
          END
        ELSE 1.0
      END * 0.25
    ) >= 5.5 THEN 'MANTER'
    WHEN (
      fd.quality_score * 0.3 + 
      fd.sustainability_score * 0.25 + 
      fd.growth_score * 0.2 +
      CASE 
        WHEN fd.ffo_yield IS NOT NULL AND fd.p_ffo IS NOT NULL THEN
          CASE 
            WHEN fd.ffo_yield >= 10 AND fd.p_ffo <= 15 THEN 2.5
            WHEN fd.ffo_yield >= 8 AND fd.p_ffo <= 20 THEN 2.0
            WHEN fd.ffo_yield >= 6 THEN 1.5
            ELSE 1.0
          END
        ELSE 1.0
      END * 0.25
    ) >= 4.0 THEN 'VENDER'
    ELSE 'EVITAR'
  END as preliminary_rating,
  
  -- INDICADORES FFO ESPECÍFICOS
  CASE 
    WHEN fd.ffo_yield IS NOT NULL AND fd.ffo_per_share IS NOT NULL AND fd.p_ffo IS NOT NULL THEN 'COMPLETO'
    WHEN fd.ffo_yield IS NOT NULL OR fd.ffo_per_share IS NOT NULL THEN 'PARCIAL'
    ELSE 'AUSENTE'
  END as ffo_data_status,
  
  -- QUALIDADE DOS DADOS HÍBRIDOS
  CASE 
    WHEN (
      (CASE WHEN fd.price IS NOT NULL THEN 1 ELSE 0 END) +
      (CASE WHEN fd.dividend_yield IS NOT NULL THEN 1 ELSE 0 END) +
      (CASE WHEN fd.pvp IS NOT NULL THEN 1 ELSE 0 END) +
      (CASE WHEN fd.ffo_yield IS NOT NULL THEN 1 ELSE 0 END) +
      (CASE WHEN fd.ffo_per_share IS NOT NULL THEN 1 ELSE 0 END) +
      (CASE WHEN fd.p_ffo IS NOT NULL THEN 1 ELSE 0 END)
    ) >= 5 THEN 'EXCELENTE'
    WHEN (
      (CASE WHEN fd.price IS NOT NULL THEN 1 ELSE 0 END) +
      (CASE WHEN fd.dividend_yield IS NOT NULL THEN 1 ELSE 0 END) +
      (CASE WHEN fd.pvp IS NOT NULL THEN 1 ELSE 0 END) +
      (CASE WHEN fd.ffo_yield IS NOT NULL THEN 1 ELSE 0 END) +
      (CASE WHEN fd.ffo_per_share IS NOT NULL THEN 1 ELSE 0 END) +
      (CASE WHEN fd.p_ffo IS NOT NULL THEN 1 ELSE 0 END)
    ) >= 4 THEN 'BOA'
    WHEN (
      (CASE WHEN fd.price IS NOT NULL THEN 1 ELSE 0 END) +
      (CASE WHEN fd.dividend_yield IS NOT NULL THEN 1 ELSE 0 END) +
      (CASE WHEN fd.pvp IS NOT NULL THEN 1 ELSE 0 END) +
      (CASE WHEN fd.ffo_yield IS NOT NULL THEN 1 ELSE 0 END) +
      (CASE WHEN fd.ffo_per_share IS NOT NULL THEN 1 ELSE 0 END) +
      (CASE WHEN fd.p_ffo IS NOT NULL THEN 1 ELSE 0 END)
    ) >= 3 THEN 'REGULAR'
    ELSE 'BAIXA'
  END as data_quality_hybrid

FROM fii_data fd
WHERE fd.is_active = TRUE;

-- ============================================================================
-- 6. ADICIONAR ÍNDICES PARA PERFORMANCE FFO
-- ============================================================================

-- Índices para as novas colunas FFO
CREATE INDEX IF NOT EXISTS idx_fii_data_ffo_yield ON fii_data(ffo_yield DESC);
CREATE INDEX IF NOT EXISTS idx_fii_data_p_ffo ON fii_data(p_ffo ASC);
CREATE INDEX IF NOT EXISTS idx_fii_data_ffo_per_share ON fii_data(ffo_per_share DESC);

-- Índice composto para análise FFO
CREATE INDEX IF NOT EXISTS idx_fii_data_ffo_analysis ON fii_data(ffo_yield DESC, p_ffo ASC, ffo_per_share DESC) 
WHERE ffo_yield IS NOT NULL AND p_ffo IS NOT NULL;

-- ============================================================================
-- 7. ATUALIZAR FUNÇÃO DE QUALIDADE PARA INCLUIR FFO
-- ============================================================================

-- Função atualizada para calcular scores incluindo FFO
CREATE OR REPLACE FUNCTION update_quality_scores_hybrid()
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE fii_data SET
    quality_score = LEAST(10.0, GREATEST(0.0,
      -- Dividend Yield (peso 20%)
      (CASE 
        WHEN dividend_yield >= 12 THEN 2.0
        WHEN dividend_yield >= 10 THEN 1.6
        WHEN dividend_yield >= 8 THEN 1.2
        WHEN dividend_yield >= 6 THEN 0.8
        ELSE 0.4
      END) +
      -- P/VP (peso 15%)
      (CASE 
        WHEN pvp <= 0.8 THEN 1.5
        WHEN pvp <= 1.0 THEN 1.2
        WHEN pvp <= 1.2 THEN 0.9
        ELSE 0.3
      END) +
      -- FFO Yield (peso 25%) - NOVIDADE!
      (CASE 
        WHEN ffo_yield IS NOT NULL THEN
          CASE 
            WHEN ffo_yield >= 12 THEN 2.5
            WHEN ffo_yield >= 10 THEN 2.0
            WHEN ffo_yield >= 8 THEN 1.5
            WHEN ffo_yield >= 6 THEN 1.0
            ELSE 0.5
          END
        ELSE 1.0 -- Score neutro se não tem FFO
      END) +
      -- P/FFO (peso 15%) - NOVIDADE!
      (CASE 
        WHEN p_ffo IS NOT NULL THEN
          CASE 
            WHEN p_ffo <= 10 THEN 1.5
            WHEN p_ffo <= 15 THEN 1.2
            WHEN p_ffo <= 20 THEN 0.9
            WHEN p_ffo <= 25 THEN 0.6
            ELSE 0.3
          END
        ELSE 0.7 -- Score neutro se não tem P/FFO
      END) +
      -- Liquidez (peso 10%)
      (CASE 
        WHEN liquidity >= 1000000 THEN 1.0
        WHEN liquidity >= 500000 THEN 0.7
        ELSE 0.3
      END) +
      -- Market Cap (peso 10%)
      (CASE 
        WHEN market_cap >= 1000000000 THEN 1.0
        WHEN market_cap >= 500000000 THEN 0.7
        ELSE 0.3
      END) +
      -- Taxa de Vacância (peso 5%)
      (CASE 
        WHEN vacancy_rate IS NULL OR vacancy_rate <= 3 THEN 0.5
        WHEN vacancy_rate <= 5 THEN 0.35
        WHEN vacancy_rate <= 10 THEN 0.2
        ELSE 0.05
      END)
    )),
    
    sustainability_score = LEAST(10.0, GREATEST(0.0,
      -- FFO Coverage (peso 30%) - NOVIDADE!
      (CASE 
        WHEN ffo_yield IS NOT NULL AND dividend_yield IS NOT NULL THEN
          CASE 
            WHEN ffo_yield >= dividend_yield * 1.5 THEN 3.0
            WHEN ffo_yield >= dividend_yield * 1.2 THEN 2.5
            WHEN ffo_yield >= dividend_yield THEN 2.0
            WHEN ffo_yield >= dividend_yield * 0.8 THEN 1.0
            ELSE 0.5
          END
        ELSE 1.5 -- Score neutro se não tem FFO
      END) +
      -- Endividamento (peso 20%)
      (CASE 
        WHEN debt_ratio <= 30 THEN 2.0
        WHEN debt_ratio <= 50 THEN 1.5
        WHEN debt_ratio <= 70 THEN 1.0
        ELSE 0.5
      END) +
      -- Ocupação (peso 15%)
      (CASE 
        WHEN occupancy_rate >= 95 THEN 1.5
        WHEN occupancy_rate >= 90 THEN 1.2
        WHEN occupancy_rate >= 85 THEN 0.9
        ELSE 0.3
      END) +
      -- P/VP sustentável (peso 15%)
      (CASE 
        WHEN pvp <= 1.0 THEN 1.5
        WHEN pvp <= 1.2 THEN 1.2
        WHEN pvp <= 1.5 THEN 0.9
        ELSE 0.3
      END) +
      -- Base score para consistência (peso 20%)
      2.0
    )),
    
    growth_score = LEAST(10.0, GREATEST(0.0,
      -- Crescimento de dividendos (peso 40%)
      (CASE 
        WHEN dividend_growth_1y >= 10 THEN 4.0
        WHEN dividend_growth_1y >= 5 THEN 3.2
        WHEN dividend_growth_1y >= 0 THEN 2.4
        WHEN dividend_growth_1y >= -5 THEN 1.6
        ELSE 0.8
      END) +
      -- FFO Growth Potential (peso 30%) - NOVIDADE!
      (CASE 
        WHEN ffo_yield IS NOT NULL AND p_ffo IS NOT NULL THEN
          CASE 
            WHEN ffo_yield >= 10 AND p_ffo <= 15 THEN 3.0
            WHEN ffo_yield >= 8 AND p_ffo <= 20 THEN 2.4
            WHEN ffo_yield >= 6 AND p_ffo <= 25 THEN 1.8
            WHEN ffo_yield >= 4 THEN 1.2
            ELSE 0.6
          END
        ELSE 1.5 -- Score neutro se não tem FFO
      END) +
      -- Crescimento de receita (peso 20%)
      (CASE 
        WHEN revenue_growth_1y >= 15 THEN 2.0
        WHEN revenue_growth_1y >= 10 THEN 1.6
        WHEN revenue_growth_1y >= 5 THEN 1.2
        WHEN revenue_growth_1y >= 0 THEN 0.8
        ELSE 0.4
      END) +
      -- ROE (peso 10%)
      (CASE 
        WHEN roe >= 15 THEN 1.0
        WHEN roe >= 12 THEN 0.8
        WHEN roe >= 10 THEN 0.6
        ELSE 0.2
      END)
    ))
  WHERE is_active = TRUE;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 8. COMENTÁRIOS E DOCUMENTAÇÃO
-- ============================================================================

COMMENT ON COLUMN fii_data.ffo_yield IS 'FFO Yield (%) - Funds From Operations Yield extraído do Fundamentus';
COMMENT ON COLUMN fii_data.ffo_per_share IS 'FFO por Cota (R$) - Funds From Operations por cota extraído do Fundamentus';
COMMENT ON COLUMN fii_data.ffo_12m IS 'FFO 12 meses (R$) - Funds From Operations dos últimos 12 meses';
COMMENT ON COLUMN fii_data.ffo_3m IS 'FFO 3 meses (R$) - Funds From Operations dos últimos 3 meses';
COMMENT ON COLUMN fii_data.admin_fee IS 'Taxa de Administração (%) - compatibilidade com sistema híbrido';
COMMENT ON COLUMN fii_data.management_company IS 'Gestora - compatibilidade com sistema híbrido';
COMMENT ON COLUMN fii_data.revenue_12m IS 'Receita 12 meses (R$) - extraída do Fundamentus';
COMMENT ON COLUMN fii_data.distributed_income_12m IS 'Renda Distribuída 12 meses (R$) - extraída do Fundamentus';
COMMENT ON COLUMN fii_data.total_assets IS 'Ativos Totais (R$) - extraídos do Fundamentus';
COMMENT ON COLUMN fii_data.net_equity IS 'Patrimônio Líquido (R$) - extraído do Fundamentus';
COMMENT ON COLUMN fii_data.equity_per_share IS 'Patrimônio por Cota (R$) - extraído do Fundamentus';

-- ============================================================================
-- 9. VERIFICAÇÃO FINAL
-- ============================================================================

-- Verificar se todas as colunas foram adicionadas
DO $$
DECLARE
  column_count INTEGER;
  missing_columns TEXT[];
BEGIN
  -- Verificar colunas FFO
  SELECT COUNT(*) INTO column_count
  FROM information_schema.columns 
  WHERE table_name = 'fii_data' 
  AND column_name IN ('ffo_yield', 'ffo_per_share', 'ffo_12m', 'ffo_3m', 'admin_fee', 'management_company', 'revenue_12m', 'distributed_income_12m', 'total_assets', 'net_equity', 'equity_per_share');
  
  IF column_count = 11 THEN
    RAISE NOTICE '✅ AJUSTE SUPABASE CONCLUÍDO COM SUCESSO!';
    RAISE NOTICE '✅ % colunas adicionadas para sistema híbrido FFO', column_count;
    RAISE NOTICE '✅ View fii_complete_data atualizada com métricas FFO';
    RAISE NOTICE '✅ Índices FFO criados para performance';
    RAISE NOTICE '✅ Função de qualidade atualizada incluindo FFO';
    RAISE NOTICE '🚀 SISTEMA HÍBRIDO PRONTO PARA PRODUÇÃO!';
  ELSE
    RAISE WARNING '⚠️ Algumas colunas podem não ter sido criadas. Encontradas: %', column_count;
    
    -- Listar colunas faltantes
    SELECT array_agg(col) INTO missing_columns
    FROM (
      SELECT unnest(ARRAY['ffo_yield', 'ffo_per_share', 'ffo_12m', 'ffo_3m', 'admin_fee', 'management_company', 'revenue_12m', 'distributed_income_12m', 'total_assets', 'net_equity', 'equity_per_share']) AS col
      EXCEPT
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'fii_data'
    ) AS missing;
    
    IF missing_columns IS NOT NULL THEN
      RAISE WARNING 'Colunas faltantes: %', missing_columns;
    END IF;
  END IF;
END $$;

-- ============================================================================
-- 10. TESTE RÁPIDO
-- ============================================================================

-- Testar se a view funciona
SELECT 
  COUNT(*) as total_fiis,
  COUNT(ffo_yield) as fiis_with_ffo_yield,
  COUNT(ffo_per_share) as fiis_with_ffo_per_share,
  COUNT(p_ffo) as fiis_with_p_ffo,
  COUNT(admin_fee) as fiis_with_admin_fee,
  COUNT(management_company) as fiis_with_management_company
FROM fii_complete_data;

-- Mensagens finais de sucesso
DO $$
BEGIN
  RAISE NOTICE '🎉 SCRIPT DE AJUSTE SUPABASE EXECUTADO COM SUCESSO!';
  RAISE NOTICE '📊 Sistema híbrido Status Invest + Fundamentus agora suportado';
  RAISE NOTICE '💰 Dados FFO (FFO Yield, FFO/Cota, P/FFO) disponíveis';
  RAISE NOTICE '🔧 Compatibilidade total com fiiDataManager.js';
  RAISE NOTICE '✅ PRONTO PARA PRODUÇÃO!';
END $$; 