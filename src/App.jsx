import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// 🔐 Contextos
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { AIProvider } from "./contexts/AIContext";
import { PortfolioProvider } from "./contexts/PortfolioContext";

// 📱 Componentes e Páginas
import Layout from "./components/layout/Layout";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import Investment from "./pages/Investment";
import Portfolio from "./pages/Portfolio";
import Analysis from "./pages/Analysis";
import Simulations from "./pages/Simulations";
import Settings from "./pages/Settings";

// 🎨 Estilos
import "./App.css";

// 🔧 Componente principal da aplicação
function AppContent() {
  const { loading, isUserAuthorized } = useAuth();

  // 🔄 Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="text-white">
            <h2 className="text-xl font-semibold">FII Investment Analyzer</h2>
            <p className="text-slate-400">Carregando aplicação...</p>
          </div>
        </div>
      </div>
    );
  }

  // 🔐 Se não autorizado, mostrar login
  if (!isUserAuthorized()) {
    return <LoginPage />;
  }

  // 🎯 Aplicação principal (usuário autorizado)
  return (
    <Router>
      <AIProvider>
        <PortfolioProvider>
          <Layout>
            <Routes>
              {/* 🏠 Página inicial */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              {/* 📊 Dashboard */}
              <Route path="/dashboard" element={<Dashboard />} />

              {/* 💰 Investimentos */}
              <Route path="/investment" element={<Investment />} />
              <Route path="/investir" element={<Investment />} />

              {/* 📈 Carteira */}
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/carteira" element={<Portfolio />} />

              {/* 🔍 Análises */}
              <Route path="/analysis" element={<Analysis />} />
              <Route path="/analises" element={<Analysis />} />

              {/* 🎯 Simulações */}
              <Route path="/simulations" element={<Simulations />} />
              <Route path="/simulacoes" element={<Simulations />} />

              {/* ⚙️ Configurações */}
              <Route path="/settings" element={<Settings />} />
              <Route path="/configuracoes" element={<Settings />} />

              {/* 🚫 Rota não encontrada */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Layout>
        </PortfolioProvider>
      </AIProvider>
    </Router>
  );
}

// 🎯 Componente App principal
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
