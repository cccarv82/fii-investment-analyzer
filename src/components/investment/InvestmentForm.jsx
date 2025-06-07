import React, { useState } from "react";
import {
  DollarSign,
  Target,
  Clock,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Alert, AlertDescription } from "../ui/alert";
import { formatCurrency } from "../../lib/utils/formatters";

const InvestmentForm = ({ onSubmit, isLoading = false }) => {
  const [formData, setFormData] = useState({
    amount: "",
    riskProfile: "",
    investmentGoal: "",
    timeHorizon: "",
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    // Validar valor
    const amount = parseFloat(formData.amount);
    if (!formData.amount || isNaN(amount)) {
      newErrors.amount = "Valor é obrigatório";
    } else if (amount < 100) {
      newErrors.amount = "Valor mínimo é R$ 100";
    } else if (amount > 1000000) {
      newErrors.amount = "Valor máximo é R$ 1.000.000";
    }

    // Validar outros campos
    if (!formData.riskProfile) {
      newErrors.riskProfile = "Selecione seu perfil de risco";
    }

    if (!formData.investmentGoal) {
      newErrors.investmentGoal = "Selecione seu objetivo";
    }

    if (!formData.timeHorizon) {
      newErrors.timeHorizon = "Selecione o prazo";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit({
        ...formData,
        amount: parseFloat(formData.amount),
      });
    }
  };

  // CORREÇÃO DO BUG: Nova função para lidar com entrada de valor
  const handleAmountChange = (e) => {
    let value = e.target.value;

    // Remove tudo que não é número ou vírgula/ponto
    value = value.replace(/[^\d.,]/g, "");

    // Substitui vírgula por ponto para padronizar
    value = value.replace(",", ".");

    // Garante apenas um ponto decimal
    const parts = value.split(".");
    if (parts.length > 2) {
      value = parts[0] + "." + parts.slice(1).join("");
    }

    // Limita a 2 casas decimais
    if (parts[1] && parts[1].length > 2) {
      value = parts[0] + "." + parts[1].substring(0, 2);
    }

    setFormData((prev) => ({ ...prev, amount: value }));

    // Limpar erro do campo
    if (errors.amount) {
      setErrors((prev) => ({ ...prev, amount: "" }));
    }
  };

  const riskProfiles = [
    {
      value: "conservador",
      label: "Conservador",
      description: "Prioriza segurança e renda estável",
      icon: "🛡️",
    },
    {
      value: "moderado",
      label: "Moderado",
      description: "Equilibra segurança e crescimento",
      icon: "⚖️",
    },
    {
      value: "arrojado",
      label: "Arrojado",
      description: "Busca maior potencial de retorno",
      icon: "🚀",
    },
  ];

  const investmentGoals = [
    {
      value: "renda",
      label: "Renda Passiva",
      description: "Foco em dividendos mensais",
      icon: <DollarSign className="h-5 w-5" />,
    },
    {
      value: "crescimento",
      label: "Crescimento",
      description: "Valorização do patrimônio",
      icon: <TrendingUp className="h-5 w-5" />,
    },
    {
      value: "equilibrado",
      label: "Equilibrado",
      description: "Renda + crescimento",
      icon: <Target className="h-5 w-5" />,
    },
  ];

  const timeHorizons = [
    { value: "curto", label: "Curto Prazo (até 2 anos)" },
    { value: "medio", label: "Médio Prazo (2-5 anos)" },
    { value: "longo", label: "Longo Prazo (5+ anos)" },
  ];

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          Planejamento de Investimento
        </CardTitle>
        <CardDescription>
          Informe seus dados para receber sugestões personalizadas de FIIs
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Valor do Investimento - CORRIGIDO */}
          <div className="space-y-2">
            <Label htmlFor="amount">Valor para Investir</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                R$
              </span>
              <Input
                id="amount"
                type="text"
                placeholder="10000.00"
                value={formData.amount}
                onChange={handleAmountChange}
                className={`pl-10 ${errors.amount ? "border-red-500" : ""}`}
              />
            </div>
            {errors.amount && (
              <p className="text-sm text-red-500">{errors.amount}</p>
            )}
            {formData.amount &&
              !errors.amount &&
              !isNaN(parseFloat(formData.amount)) && (
                <p className="text-sm text-muted-foreground">
                  Valor: {formatCurrency(parseFloat(formData.amount))}
                </p>
              )}
          </div>

          {/* Perfil de Risco */}
          <div className="space-y-3">
            <Label>Perfil de Risco</Label>
            <RadioGroup
              value={formData.riskProfile}
              onValueChange={(value) => {
                setFormData((prev) => ({ ...prev, riskProfile: value }));
                if (errors.riskProfile) {
                  setErrors((prev) => ({ ...prev, riskProfile: "" }));
                }
              }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              {riskProfiles.map((profile) => (
                <div
                  key={profile.value}
                  className="flex items-center space-x-2"
                >
                  <RadioGroupItem value={profile.value} id={profile.value} />
                  <Label
                    htmlFor={profile.value}
                    className="flex-1 cursor-pointer rounded-lg border p-4 hover:bg-accent"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{profile.icon}</span>
                      <div>
                        <div className="font-medium">{profile.label}</div>
                        <div className="text-sm text-muted-foreground">
                          {profile.description}
                        </div>
                      </div>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {errors.riskProfile && (
              <p className="text-sm text-red-500">{errors.riskProfile}</p>
            )}
          </div>

          {/* Objetivo do Investimento */}
          <div className="space-y-3">
            <Label>Objetivo do Investimento</Label>
            <RadioGroup
              value={formData.investmentGoal}
              onValueChange={(value) => {
                setFormData((prev) => ({ ...prev, investmentGoal: value }));
                if (errors.investmentGoal) {
                  setErrors((prev) => ({ ...prev, investmentGoal: "" }));
                }
              }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              {investmentGoals.map((goal) => (
                <div key={goal.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={goal.value} id={goal.value} />
                  <Label
                    htmlFor={goal.value}
                    className="flex-1 cursor-pointer rounded-lg border p-4 hover:bg-accent"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-primary">{goal.icon}</div>
                      <div>
                        <div className="font-medium">{goal.label}</div>
                        <div className="text-sm text-muted-foreground">
                          {goal.description}
                        </div>
                      </div>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {errors.investmentGoal && (
              <p className="text-sm text-red-500">{errors.investmentGoal}</p>
            )}
          </div>

          {/* Prazo do Investimento */}
          <div className="space-y-2">
            <Label htmlFor="timeHorizon">Prazo do Investimento</Label>
            <Select
              value={formData.timeHorizon}
              onValueChange={(value) => {
                setFormData((prev) => ({ ...prev, timeHorizon: value }));
                if (errors.timeHorizon) {
                  setErrors((prev) => ({ ...prev, timeHorizon: "" }));
                }
              }}
            >
              <SelectTrigger
                className={errors.timeHorizon ? "border-red-500" : ""}
              >
                <SelectValue placeholder="Selecione o prazo" />
              </SelectTrigger>
              <SelectContent>
                {timeHorizons.map((horizon) => (
                  <SelectItem key={horizon.value} value={horizon.value}>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {horizon.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.timeHorizon && (
              <p className="text-sm text-red-500">{errors.timeHorizon}</p>
            )}
          </div>

          {/* Aviso */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              As sugestões são baseadas em análise fundamentalista e não
              constituem recomendação de investimento. Sempre consulte um
              profissional qualificado.
            </AlertDescription>
          </Alert>

          {/* Botão de Submissão */}
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Analisando...
              </>
            ) : (
              <>
                <TrendingUp className="mr-2 h-4 w-4" />
                Obter Sugestões
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default InvestmentForm;
