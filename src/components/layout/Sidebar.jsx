import React from 'react';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Briefcase, 
  BarChart3, 
  Calculator,
  Settings,
  HelpCircle,
  X
} from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

const Sidebar = ({ isOpen, onClose, activeSection, onSectionChange }) => {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Visão geral dos seus investimentos'
    },
    {
      id: 'investment',
      label: 'Investir',
      icon: TrendingUp,
      description: 'Sugestões de investimento'
    },
    {
      id: 'portfolio',
      label: 'Carteira',
      icon: Briefcase,
      description: 'Gestão da sua carteira'
    },
    {
      id: 'analysis',
      label: 'Análises',
      icon: BarChart3,
      description: 'Análises fundamentalistas'
    },
    {
      id: 'simulations',
      label: 'Simulações',
      icon: Calculator,
      description: 'Projeções e análises'
    }
  ];

  const bottomItems = [
    {
      id: 'settings',
      label: 'Configurações',
      icon: Settings
    },
    {
      id: 'help',
      label: 'Ajuda',
      icon: HelpCircle
    }
  ];

  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 z-50 h-full w-64 transform border-r bg-background transition-transform duration-200 ease-in-out md:relative md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-full flex-col">
          {/* Header da Sidebar */}
          <div className="flex h-16 items-center justify-between border-b px-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <TrendingUp className="h-5 w-5" />
              </div>
              <span className="font-semibold">FII Analyzer</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Menu Principal */}
          <nav className="flex-1 space-y-1 p-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSectionChange(item.id);
                    onClose(); // Fechar sidebar no mobile após seleção
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <div className="flex-1">
                    <div className="font-medium">{item.label}</div>
                    <div className={cn(
                      "text-xs",
                      isActive ? "text-primary-foreground/80" : "text-muted-foreground"
                    )}>
                      {item.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </nav>

          {/* Menu Inferior */}
          <div className="border-t p-4 space-y-1">
            {bottomItems.map((item) => {
              const Icon = item.icon;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSectionChange(item.id);
                    onClose();
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Rodapé */}
          <div className="border-t p-4">
            <div className="text-xs text-muted-foreground">
              <p>© 2025 FII Analyzer</p>
              <p>Versão 1.0.0</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

