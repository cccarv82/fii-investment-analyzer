import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Gerador de relatórios em PDF
export class ReportGenerator {
  constructor() {
    this.doc = null;
  }

  // Gerar relatório completo da carteira
  generatePortfolioReport(portfolioData, userInfo = {}) {
    this.doc = new jsPDF();
    
    // Configurar fonte
    this.doc.setFont('helvetica');
    
    // Cabeçalho
    this.addHeader('Relatório de Carteira de FIIs');
    
    // Informações do usuário
    this.addUserInfo(userInfo);
    
    // Resumo executivo
    this.addExecutiveSummary(portfolioData);
    
    // Posições detalhadas
    this.addDetailedPositions(portfolioData.positions);
    
    // Análise de performance
    this.addPerformanceAnalysis(portfolioData);
    
    // Distribuição setorial
    this.addSectorDistribution(portfolioData.positions);
    
    // Recomendações
    this.addRecommendations(portfolioData);
    
    // Rodapé
    this.addFooter();
    
    return this.doc;
  }

  // Adicionar cabeçalho
  addHeader(title) {
    this.doc.setFontSize(20);
    this.doc.setTextColor(40, 40, 40);
    this.doc.text(title, 20, 30);
    
    this.doc.setFontSize(10);
    this.doc.setTextColor(100, 100, 100);
    this.doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 20, 40);
    
    // Linha separadora
    this.doc.setDrawColor(200, 200, 200);
    this.doc.line(20, 45, 190, 45);
    
    this.currentY = 55;
  }

  // Adicionar informações do usuário
  addUserInfo(userInfo) {
    this.doc.setFontSize(12);
    this.doc.setTextColor(40, 40, 40);
    this.doc.text('Informações do Investidor', 20, this.currentY);
    
    this.currentY += 10;
    this.doc.setFontSize(10);
    this.doc.text(`Nome: ${userInfo.name || 'Não informado'}`, 20, this.currentY);
    this.currentY += 6;
    this.doc.text(`Perfil de Risco: ${userInfo.riskProfile || 'Moderado'}`, 20, this.currentY);
    this.currentY += 6;
    this.doc.text(`Objetivo: ${userInfo.investmentGoal || 'Equilibrado'}`, 20, this.currentY);
    
    this.currentY += 15;
  }

  // Adicionar resumo executivo
  addExecutiveSummary(portfolioData) {
    this.doc.setFontSize(12);
    this.doc.setTextColor(40, 40, 40);
    this.doc.text('Resumo Executivo', 20, this.currentY);
    
    this.currentY += 10;
    
    const summaryData = [
      ['Métrica', 'Valor'],
      ['Valor Total Investido', this.formatCurrency(portfolioData.totalInvested)],
      ['Valor Atual da Carteira', this.formatCurrency(portfolioData.currentValue)],
      ['Performance Total', `${portfolioData.performance.toFixed(2)}%`],
      ['Dividendos Recebidos', this.formatCurrency(portfolioData.totalDividends)],
      ['Yield on Cost', `${portfolioData.yieldOnCost.toFixed(2)}%`],
      ['Renda Mensal Média', this.formatCurrency(portfolioData.monthlyYield)],
      ['Número de FIIs', portfolioData.diversification.toString()]
    ];

    this.doc.autoTable({
      startY: this.currentY,
      head: [summaryData[0]],
      body: summaryData.slice(1),
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [66, 139, 202] }
    });

    this.currentY = this.doc.lastAutoTable.finalY + 15;
  }

  // Adicionar posições detalhadas
  addDetailedPositions(positions) {
    if (this.currentY > 200) {
      this.doc.addPage();
      this.currentY = 20;
    }

    this.doc.setFontSize(12);
    this.doc.setTextColor(40, 40, 40);
    this.doc.text('Posições Detalhadas', 20, this.currentY);
    
    this.currentY += 10;

    if (positions.length === 0) {
      this.doc.setFontSize(10);
      this.doc.text('Nenhuma posição encontrada na carteira.', 20, this.currentY);
      this.currentY += 15;
      return;
    }

    const positionsData = [
      ['Ticker', 'Cotas', 'Preço Médio', 'Valor Investido', 'Setor']
    ];

    positions.forEach(position => {
      positionsData.push([
        position.ticker,
        position.totalShares.toString(),
        this.formatCurrency(position.averagePrice),
        this.formatCurrency(position.totalInvested),
        position.sector || 'N/A'
      ]);
    });

    this.doc.autoTable({
      startY: this.currentY,
      head: [positionsData[0]],
      body: positionsData.slice(1),
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 139, 202] }
    });

    this.currentY = this.doc.lastAutoTable.finalY + 15;
  }

  // Adicionar análise de performance
  addPerformanceAnalysis(portfolioData) {
    if (this.currentY > 220) {
      this.doc.addPage();
      this.currentY = 20;
    }

    this.doc.setFontSize(12);
    this.doc.setTextColor(40, 40, 40);
    this.doc.text('Análise de Performance', 20, this.currentY);
    
    this.currentY += 10;
    this.doc.setFontSize(10);
    
    const performanceText = [
      `A carteira apresenta performance de ${portfolioData.performance.toFixed(2)}% desde o início dos investimentos.`,
      `O yield on cost atual é de ${portfolioData.yieldOnCost.toFixed(2)}%, indicando a rentabilidade dos dividendos sobre o valor investido.`,
      `A renda mensal média é de ${this.formatCurrency(portfolioData.monthlyYield)}, proporcionando fluxo de caixa regular.`,
      `A carteira está diversificada em ${portfolioData.diversification} FIIs diferentes.`
    ];

    performanceText.forEach(text => {
      const lines = this.doc.splitTextToSize(text, 170);
      this.doc.text(lines, 20, this.currentY);
      this.currentY += lines.length * 5 + 3;
    });

    this.currentY += 10;
  }

  // Adicionar distribuição setorial
  addSectorDistribution(positions) {
    if (this.currentY > 200) {
      this.doc.addPage();
      this.currentY = 20;
    }

    this.doc.setFontSize(12);
    this.doc.setTextColor(40, 40, 40);
    this.doc.text('Distribuição Setorial', 20, this.currentY);
    
    this.currentY += 10;

    // Calcular distribuição por setor
    const sectorDistribution = {};
    const totalValue = positions.reduce((sum, p) => sum + p.totalInvested, 0);

    positions.forEach(position => {
      const sector = position.sector || 'Outros';
      if (!sectorDistribution[sector]) {
        sectorDistribution[sector] = 0;
      }
      sectorDistribution[sector] += position.totalInvested;
    });

    const sectorData = [['Setor', 'Valor', 'Percentual']];
    
    Object.entries(sectorDistribution).forEach(([sector, value]) => {
      const percentage = totalValue > 0 ? (value / totalValue * 100).toFixed(1) : '0.0';
      sectorData.push([
        sector,
        this.formatCurrency(value),
        `${percentage}%`
      ]);
    });

    this.doc.autoTable({
      startY: this.currentY,
      head: [sectorData[0]],
      body: sectorData.slice(1),
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [66, 139, 202] }
    });

    this.currentY = this.doc.lastAutoTable.finalY + 15;
  }

  // Adicionar recomendações
  addRecommendations(portfolioData) {
    if (this.currentY > 220) {
      this.doc.addPage();
      this.currentY = 20;
    }

    this.doc.setFontSize(12);
    this.doc.setTextColor(40, 40, 40);
    this.doc.text('Recomendações', 20, this.currentY);
    
    this.currentY += 10;
    this.doc.setFontSize(10);

    const recommendations = this.generateRecommendations(portfolioData);
    
    recommendations.forEach((rec, index) => {
      this.doc.text(`${index + 1}. ${rec}`, 20, this.currentY);
      const lines = this.doc.splitTextToSize(rec, 170);
      this.currentY += lines.length * 5 + 3;
    });
  }

  // Gerar recomendações baseadas na carteira
  generateRecommendations(portfolioData) {
    const recommendations = [];

    // Recomendação baseada na diversificação
    if (portfolioData.diversification < 5) {
      recommendations.push('Considere aumentar a diversificação da carteira para reduzir riscos específicos.');
    }

    // Recomendação baseada na performance
    if (portfolioData.performance < 0) {
      recommendations.push('A carteira está com performance negativa. Avalie rebalanceamento ou novos aportes.');
    }

    // Recomendação baseada no yield
    if (portfolioData.yieldOnCost < 6) {
      recommendations.push('O yield on cost está abaixo da média. Considere FIIs com maior dividend yield.');
    }

    // Recomendação geral
    recommendations.push('Mantenha aportes regulares para aproveitar o poder dos juros compostos.');
    recommendations.push('Acompanhe regularmente os relatórios dos FIIs e indicadores fundamentalistas.');

    return recommendations;
  }

  // Adicionar rodapé
  addFooter() {
    const pageCount = this.doc.internal.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      this.doc.setFontSize(8);
      this.doc.setTextColor(100, 100, 100);
      
      // Disclaimer
      const disclaimer = 'Este relatório é apenas informativo e não constitui recomendação de investimento. Consulte sempre um profissional qualificado.';
      this.doc.text(disclaimer, 20, 280);
      
      // Número da página
      this.doc.text(`Página ${i} de ${pageCount}`, 170, 290);
    }
  }

  // Formatar moeda
  formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  // Salvar PDF
  save(filename = 'relatorio-carteira-fiis.pdf') {
    this.doc.save(filename);
  }

  // Obter blob do PDF
  getBlob() {
    return this.doc.output('blob');
  }
}

// Gerador de planilhas CSV
export class CSVGenerator {
  // Gerar CSV da carteira
  generatePortfolioCSV(portfolioData) {
    const headers = [
      'Ticker',
      'Nome',
      'Setor',
      'Cotas',
      'Preço Médio',
      'Valor Investido',
      'Valor Atual',
      'Performance %',
      'Dividend Yield %'
    ];

    const rows = portfolioData.positions.map(position => [
      position.ticker,
      position.name || '',
      position.sector || '',
      position.totalShares,
      position.averagePrice.toFixed(2),
      position.totalInvested.toFixed(2),
      (position.totalInvested * 1.05).toFixed(2), // Valor atual simulado
      '5.00', // Performance simulada
      '7.50'  // Dividend yield simulado
    ]);

    return this.arrayToCSV([headers, ...rows]);
  }

  // Gerar CSV de dividendos
  generateDividendsCSV(dividends) {
    const headers = [
      'Data',
      'Ticker',
      'Valor',
      'Tipo',
      'Descrição'
    ];

    const rows = dividends.map(dividend => [
      new Date(dividend.date).toLocaleDateString('pt-BR'),
      dividend.ticker,
      dividend.amount.toFixed(2),
      dividend.type || 'Dividendo',
      dividend.description || ''
    ]);

    return this.arrayToCSV([headers, ...rows]);
  }

  // Converter array para CSV
  arrayToCSV(data) {
    return data.map(row => 
      row.map(field => {
        // Escapar aspas e adicionar aspas se necessário
        if (typeof field === 'string' && (field.includes(',') || field.includes('"') || field.includes('\n'))) {
          return `"${field.replace(/"/g, '""')}"`;
        }
        return field;
      }).join(',')
    ).join('\n');
  }

  // Baixar CSV
  downloadCSV(csvContent, filename) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }
}

// Instâncias globais
export const reportGenerator = new ReportGenerator();
export const csvGenerator = new CSVGenerator();

