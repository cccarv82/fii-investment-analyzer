import React, { useState } from 'react';
import { PortfolioProvider } from './contexts/PortfolioContext';
import { AIProvider } from './contexts/AIContext';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Investment from './pages/Investment';
import Portfolio from './pages/Portfolio';
import Analysis from './pages/Analysis';
import Simulations from './pages/Simulations';
import Settings from './pages/Settings';
import './App.css';

function App() {
  const [activeSection, setActiveSection] = useState('dashboard');

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'investment':
        return <Investment />;
      case 'portfolio':
        return <Portfolio />;
      case 'analysis':
        return <Analysis />;
      case 'simulations':
        return <Simulations />;
      case 'settings':
        return <Settings />;
      case 'help':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Ajuda</h1>
              <p className="text-muted-foreground">
                Central de ajuda e suporte
              </p>
            </div>
            <div className="flex items-center justify-center h-64 border-2 border-dashed border-muted rounded-lg">
              <div className="text-center text-muted-foreground">
                <p className="text-lg font-medium">Página em Desenvolvimento</p>
                <p className="text-sm">Central de ajuda será implementada em breve</p>
              </div>
            </div>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <AIProvider>
      <PortfolioProvider>
        <Layout 
          activeSection={activeSection} 
          onSectionChange={setActiveSection}
        >
          {renderContent()}
        </Layout>
      </PortfolioProvider>
    </AIProvider>
  );
}

export default App;

