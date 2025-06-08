-- 🚀 SCHEMA DEFINITIVO: STATUS INVEST MASTER SOLUTION
-- Sistema completo de dados fundamentalistas para FIIs

-- ============================================================================
-- TABELA PRINCIPAL: DADOS FUNDAMENTALISTAS COMPLETOS
-- ============================================================================
CREATE TABLE IF NOT EXISTS fii_data (
  ticker VARCHAR(10) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  
  -- DADOS BÁSICOS
  price DECIMAL(10,2) NOT NULL,
  market_cap BIGINT,
  shares_outstanding BIGINT,
  
  -- MÉTRICAS FUNDAMENTALISTAS
  dividend_yield DECIMAL(5,2) NOT NULL,
  pvp DECIMAL(5,2) NOT NULL,
  ffo DECIMAL(15,2),
  p_ffo DECIMAL(5,2),
  
  -- LIQUIDEZ E VOLUME
  liquidity DECIMAL(15,2),
  avg_daily_volume DECIMAL(15,2),
  
  -- RENTABILIDADE
  roe DECIMAL(5,2),
  roic DECIMAL(5,2),
  roa DECIMAL(5,2),
  
  -- ENDIVIDAMENTO
  debt_ratio DECIMAL(5,2),
  debt_to_equity DECIMAL(5,2),
  coverage_ratio DECIMAL(5,2),
  
  -- CRESCIMENTO
  dividend_growth_1y DECIMAL(5,2),
  dividend_growth_3y DECIMAL(5,2),
  revenue_growth_1y DECIMAL(5,2),
  
  -- RISCO
  volatility DECIMAL(5,2),
  beta DECIMAL(5,2),
  sharpe_ratio DECIMAL(5,2),
  max_drawdown DECIMAL(5,2),
  
  -- CLASSIFICAÇÃO
  sector VARCHAR(50) NOT NULL,
  segment VARCHAR(50),
  manager VARCHAR(100),
  
  -- OPERACIONAL
  vacancy_rate DECIMAL(5,2),
  last_dividend DECIMAL(10,4),
  dividend_frequency VARCHAR(20) DEFAULT 'MENSAL',
  admin_fee_ratio DECIMAL(5,2),
  occupancy_rate DECIMAL(5,2),
  contract_duration_avg DECIMAL(5,1),
  
  -- SCORES CALCULADOS
  quality_score DECIMAL(3,1) NOT NULL DEFAULT 0,
  sustainability_score DECIMAL(3,1) NOT NULL DEFAULT 0,
  growth_score DECIMAL(3,1) NOT NULL DEFAULT 0,
  
  -- METADADOS
  source VARCHAR(20) DEFAULT 'status_invest',
  last_update TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- HISTÓRICO DE DIVIDENDOS
-- ============================================================================
CREATE TABLE IF NOT EXISTS fii_dividends (
  id SERIAL PRIMARY KEY,
  ticker VARCHAR(10) NOT NULL,
  payment_date DATE NOT NULL,
  amount DECIMAL(10,4) NOT NULL,
  type VARCHAR(20) DEFAULT 'DIVIDENDO',
  created_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (ticker) REFERENCES fii_data(ticker) ON DELETE CASCADE,
  UNIQUE(ticker, payment_date, type)
);

-- ============================================================================
-- ANÁLISES DE IA
-- ============================================================================
CREATE TABLE IF NOT EXISTS fii_ai_analysis (
  id SERIAL PRIMARY KEY,
  ticker VARCHAR(10) NOT NULL,
  user_id UUID NOT NULL,
  
  -- RECOMENDAÇÃO
  recommendation VARCHAR(20) NOT NULL, -- COMPRAR, VENDER, MANTER
  score DECIMAL(3,1) NOT NULL,
  target_price DECIMAL(10,2),
  
  -- ANÁLISE DETALHADA
  reasoning TEXT,
  strengths TEXT[],
  weaknesses TEXT[],
  risks TEXT[],
  catalysts TEXT[],
  
  -- CLASSIFICAÇÃO
  risk_level VARCHAR(10), -- BAIXO, MEDIO, ALTO
  suitability VARCHAR(20), -- CONSERVADOR, MODERADO, AGRESSIVO
  time_horizon VARCHAR(20), -- CURTO, MEDIO, LONGO
  
  -- MÉTRICAS CALCULADAS
  intrinsic_value DECIMAL(10,2),
  upside_potential DECIMAL(5,2),
  safety_margin DECIMAL(5,2),
  
  -- METADADOS
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '7 days'),
  
  FOREIGN KEY (ticker) REFERENCES fii_data(ticker) ON DELETE CASCADE
);

-- Índices para a tabela fii_ai_analysis
CREATE INDEX IF NOT EXISTS idx_fii_ai_user_ticker ON fii_ai_analysis(user_id, ticker);
CREATE INDEX IF NOT EXISTS idx_fii_ai_created ON fii_ai_analysis(created_at);
CREATE INDEX IF NOT EXISTS idx_fii_ai_expires ON fii_ai_analysis(expires_at);

-- ============================================================================
-- ESTATÍSTICAS DE CACHE
-- ============================================================================
CREATE TABLE IF NOT EXISTS fii_cache_stats (
  id SERIAL PRIMARY KEY,
  cache_type VARCHAR(50) NOT NULL,
  total_fiis INTEGER DEFAULT 0,
  success_rate DECIMAL(5,2) DEFAULT 0,
  errors_count INTEGER DEFAULT 0,
  avg_dividend_yield DECIMAL(5,2) DEFAULT 0,
  avg_pvp DECIMAL(5,2) DEFAULT 0,
  total_market_cap BIGINT DEFAULT 0,
  last_update TIMESTAMP DEFAULT NOW()
);

-- Criar índice único para cache_type e data (sem função DATE na constraint)
CREATE UNIQUE INDEX IF NOT EXISTS idx_fii_cache_stats_unique 
ON fii_cache_stats (cache_type, DATE(last_update));

-- ============================================================================
-- VIEW: DADOS COMPLETOS COM MÉTRICAS CALCULADAS
-- ============================================================================
CREATE OR REPLACE VIEW fii_complete_data AS
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
  
  CASE 
    WHEN fd.liquidity >= 5000000 THEN 'MUITO_ALTA'
    WHEN fd.liquidity >= 1000000 THEN 'ALTA'
    WHEN fd.liquidity >= 500000 THEN 'MEDIA'
    WHEN fd.liquidity >= 100000 THEN 'BAIXA'
    ELSE 'MUITO_BAIXA'
  END as liquidity_category,
  
  -- SCORE GERAL PONDERADO
  ROUND(
    (fd.quality_score * 0.4 + 
     fd.sustainability_score * 0.3 + 
     fd.growth_score * 0.2 + 
     CASE 
       WHEN fd.liquidity >= 5000000 THEN 10
       WHEN fd.liquidity >= 1000000 THEN 8
       WHEN fd.liquidity >= 500000 THEN 6
       WHEN fd.liquidity >= 100000 THEN 4
       ELSE 2
     END * 0.1), 2
  ) as overall_score,
  
  -- NÍVEL DE RISCO CALCULADO
  CASE 
    WHEN (
      (CASE WHEN fd.vacancy_rate > 10 THEN 2 ELSE 0 END) +
      (CASE WHEN fd.pvp > 1.5 THEN 1 ELSE 0 END) +
      (CASE WHEN fd.liquidity < 500000 THEN 2 ELSE 0 END) +
      (CASE WHEN fd.dividend_yield > 15 THEN 1 ELSE 0 END) +
      (CASE WHEN fd.debt_ratio > 60 THEN 2 ELSE 0 END)
    ) >= 5 THEN 'ALTO'
    WHEN (
      (CASE WHEN fd.vacancy_rate > 10 THEN 2 ELSE 0 END) +
      (CASE WHEN fd.pvp > 1.5 THEN 1 ELSE 0 END) +
      (CASE WHEN fd.liquidity < 500000 THEN 2 ELSE 0 END) +
      (CASE WHEN fd.dividend_yield > 15 THEN 1 ELSE 0 END) +
      (CASE WHEN fd.debt_ratio > 60 THEN 2 ELSE 0 END)
    ) >= 3 THEN 'MEDIO'
    ELSE 'BAIXO'
  END as risk_level,
  
  -- RATING PRELIMINAR
  CASE 
    WHEN (fd.quality_score * 0.4 + fd.sustainability_score * 0.3 + fd.growth_score * 0.2) >= 8.5 THEN 'COMPRAR_FORTE'
    WHEN (fd.quality_score * 0.4 + fd.sustainability_score * 0.3 + fd.growth_score * 0.2) >= 7.0 THEN 'COMPRAR'
    WHEN (fd.quality_score * 0.4 + fd.sustainability_score * 0.3 + fd.growth_score * 0.2) >= 5.5 THEN 'MANTER'
    WHEN (fd.quality_score * 0.4 + fd.sustainability_score * 0.3 + fd.growth_score * 0.2) >= 4.0 THEN 'VENDER'
    ELSE 'EVITAR'
  END as preliminary_rating

FROM fii_data fd
WHERE fd.is_active = TRUE;

-- ============================================================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_fii_data_dividend_yield ON fii_data(dividend_yield DESC);
CREATE INDEX IF NOT EXISTS idx_fii_data_pvp ON fii_data(pvp ASC);
CREATE INDEX IF NOT EXISTS idx_fii_data_quality_score ON fii_data(quality_score DESC);
CREATE INDEX IF NOT EXISTS idx_fii_data_sector ON fii_data(sector);
CREATE INDEX IF NOT EXISTS idx_fii_data_last_update ON fii_data(last_update DESC);
CREATE INDEX IF NOT EXISTS idx_fii_data_liquidity ON fii_data(liquidity DESC);

CREATE INDEX IF NOT EXISTS idx_fii_dividends_ticker_date ON fii_dividends(ticker, payment_date DESC);
CREATE INDEX IF NOT EXISTS idx_fii_dividends_payment_date ON fii_dividends(payment_date DESC);

-- ============================================================================
-- FUNÇÕES UTILITÁRIAS
-- ============================================================================

-- Função para limpar análises IA expiradas
CREATE OR REPLACE FUNCTION cleanup_expired_ai_analysis()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM fii_ai_analysis 
  WHERE expires_at < NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Função para atualizar scores de qualidade
CREATE OR REPLACE FUNCTION update_quality_scores()
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE fii_data SET
    quality_score = LEAST(10.0, GREATEST(0.0,
      -- Dividend Yield (peso 25%)
      (CASE 
        WHEN dividend_yield >= 12 THEN 2.5
        WHEN dividend_yield >= 10 THEN 2.0
        WHEN dividend_yield >= 8 THEN 1.5
        WHEN dividend_yield >= 6 THEN 1.0
        ELSE 0.5
      END) +
      -- P/VP (peso 20%)
      (CASE 
        WHEN pvp <= 0.8 THEN 2.0
        WHEN pvp <= 1.0 THEN 1.5
        WHEN pvp <= 1.2 THEN 1.0
        ELSE 0.5
      END) +
      -- Liquidez (peso 15%)
      (CASE 
        WHEN liquidity >= 1000000 THEN 1.5
        WHEN liquidity >= 500000 THEN 1.0
        ELSE 0.5
      END) +
      -- Market Cap (peso 15%)
      (CASE 
        WHEN market_cap >= 1000000000 THEN 1.5
        WHEN market_cap >= 500000000 THEN 1.0
        ELSE 0.5
      END) +
      -- Taxa de Vacância (peso 10%)
      (CASE 
        WHEN vacancy_rate IS NULL OR vacancy_rate <= 3 THEN 1.0
        WHEN vacancy_rate <= 5 THEN 0.7
        WHEN vacancy_rate <= 10 THEN 0.4
        ELSE 0.1
      END) +
      -- FFO (peso 10%)
      (CASE 
        WHEN ffo IS NOT NULL AND p_ffo IS NOT NULL THEN
          CASE 
            WHEN p_ffo <= 15 THEN 1.0
            WHEN p_ffo <= 20 THEN 0.7
            ELSE 0.3
          END
        ELSE 0.5
      END) +
      -- Taxa de administração (peso 5%)
      (CASE 
        WHEN admin_fee_ratio <= 0.5 THEN 0.5
        WHEN admin_fee_ratio <= 1.0 THEN 0.3
        ELSE 0.1
      END)
    )),
    
    sustainability_score = LEAST(10.0, GREATEST(0.0,
      -- Cobertura FFO (peso 30%)
      (CASE 
        WHEN coverage_ratio >= 1.5 THEN 3.0
        WHEN coverage_ratio >= 1.2 THEN 2.5
        WHEN coverage_ratio >= 1.0 THEN 2.0
        WHEN coverage_ratio >= 0.8 THEN 1.0
        ELSE 0.5
      END) +
      -- Endividamento (peso 20%)
      (CASE 
        WHEN debt_ratio <= 30 THEN 2.0
        WHEN debt_ratio <= 50 THEN 1.5
        WHEN debt_ratio <= 70 THEN 1.0
        ELSE 0.5
      END) +
      -- Ocupação (peso 10%)
      (CASE 
        WHEN occupancy_rate >= 95 THEN 1.0
        WHEN occupancy_rate >= 90 THEN 0.8
        WHEN occupancy_rate >= 85 THEN 0.6
        ELSE 0.3
      END) +
      -- Base score para consistência
      4.0
    )),
    
    growth_score = LEAST(10.0, GREATEST(0.0,
      -- Crescimento de dividendos (peso 50%)
      (CASE 
        WHEN dividend_growth_1y >= 10 THEN 5.0
        WHEN dividend_growth_1y >= 5 THEN 4.0
        WHEN dividend_growth_1y >= 0 THEN 3.0
        WHEN dividend_growth_1y >= -5 THEN 2.0
        ELSE 1.0
      END) +
      -- Crescimento de receita (peso 30%)
      (CASE 
        WHEN revenue_growth_1y >= 15 THEN 3.0
        WHEN revenue_growth_1y >= 10 THEN 2.5
        WHEN revenue_growth_1y >= 5 THEN 2.0
        WHEN revenue_growth_1y >= 0 THEN 1.5
        ELSE 1.0
      END) +
      -- ROE (peso 20%)
      (CASE 
        WHEN roe >= 15 THEN 2.0
        WHEN roe >= 12 THEN 1.5
        WHEN roe >= 10 THEN 1.0
        ELSE 0.5
      END)
    ))
  WHERE is_active = TRUE;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS PARA MANUTENÇÃO AUTOMÁTICA
-- ============================================================================

-- Trigger para atualizar last_update automaticamente
CREATE OR REPLACE FUNCTION update_last_update_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_update = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_fii_data_last_update
  BEFORE UPDATE ON fii_data
  FOR EACH ROW
  EXECUTE FUNCTION update_last_update_column();

-- ============================================================================
-- POLÍTICAS RLS (ROW LEVEL SECURITY)
-- ============================================================================

-- Habilitar RLS nas tabelas sensíveis
ALTER TABLE fii_ai_analysis ENABLE ROW LEVEL SECURITY;

-- Política para análises IA (usuários só veem suas próprias análises)
CREATE POLICY fii_ai_analysis_user_policy ON fii_ai_analysis
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- DADOS INICIAIS E CONFIGURAÇÕES
-- ============================================================================

-- Inserir estatísticas iniciais
INSERT INTO fii_cache_stats (cache_type, total_fiis, success_rate, last_update)
VALUES ('status_invest_scraper', 0, 0.0, NOW())
ON CONFLICT (cache_type, DATE(last_update)) DO NOTHING;

-- ============================================================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- ============================================================================

COMMENT ON TABLE fii_data IS 'Dados fundamentalistas completos dos FIIs extraídos do Status Invest';
COMMENT ON TABLE fii_dividends IS 'Histórico de dividendos pagos pelos FIIs';
COMMENT ON TABLE fii_ai_analysis IS 'Análises e recomendações geradas pela IA para cada usuário';
COMMENT ON TABLE fii_cache_stats IS 'Estatísticas de performance do sistema de cache';

COMMENT ON VIEW fii_complete_data IS 'View com dados completos e métricas calculadas para análise';

COMMENT ON FUNCTION cleanup_expired_ai_analysis() IS 'Remove análises IA expiradas para manter performance';
COMMENT ON FUNCTION update_quality_scores() IS 'Recalcula scores de qualidade baseado nos dados atuais';

-- ============================================================================
-- VERIFICAÇÃO FINAL
-- ============================================================================

-- Verificar se todas as tabelas foram criadas
DO $$
DECLARE
  table_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name IN ('fii_data', 'fii_dividends', 'fii_ai_analysis', 'fii_cache_stats');
  
  IF table_count = 4 THEN
    RAISE NOTICE '✅ Schema Status Invest criado com sucesso! % tabelas criadas.', table_count;
  ELSE
    RAISE WARNING '⚠️ Algumas tabelas podem não ter sido criadas. Encontradas: %', table_count;
  END IF;
END $$; 