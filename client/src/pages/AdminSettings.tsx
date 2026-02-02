import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Save,
  Loader2,
  Calendar,
  MapPin,
  DollarSign,
  Info,
  Ticket,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function AdminSettings() {
  const utils = trpc.useUtils();
  const { data: settings, isLoading } = trpc.settings.get.useQuery();

  // ADICIONADO: allowCooler no estado inicial
  const [formData, setFormData] = useState({
    eventName: "",
    eventDate: "",
    location: "",
    priceNormal: 0,
    priceCooler: 0,
    serviceFee: 0,
    allowCooler: true, // Padrão ativado
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        eventName: settings.eventName,
        eventDate: settings.eventDate,
        location: settings.location,
        priceNormal: settings.priceNormal,
        priceCooler: settings.priceCooler,
        serviceFee: settings.serviceFee,
        allowCooler: settings.allowCooler ?? true, // Sincroniza do banco
      });
    }
  }, [settings]);

  const updateMutation = trpc.settings.update.useMutation({
    onSuccess: () => {
      toast.success("Configurações salvas!", {
        description: "O site principal já foi atualizado.",
      });
      utils.settings.get.invalidate();
    },
    onError: err => toast.error("Erro ao salvar: " + err.message),
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData); // Agora o formulário bate com o que o servidor pede
  };

  if (isLoading)
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="animate-spin text-purple-500 h-10 w-10" />
      </div>
    );

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <Link href="/admin">
            <Button variant="ghost" className="text-gray-400 hover:text-white">
              <ArrowLeft className="mr-2" /> Voltar ao Painel
            </Button>
          </Link>
          <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-500 uppercase italic">
            Configurar Evento
          </h1>
          <div className="w-20" />
        </header>

        <form onSubmit={handleSave} className="space-y-6">
          {/* INFORMAÇÕES GERAIS */}
          <Card className="bg-zinc-950 border-white/10 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-400">
                <Info className="h-5 w-5" /> Informações Gerais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">
                  Nome do Evento
                </label>
                <Input
                  value={formData.eventName}
                  onChange={e =>
                    setFormData({ ...formData, eventName: e.target.value })
                  }
                  className="bg-white/5 border-white/10 focus:border-purple-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">
                  Localização
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                  <Input
                    value={formData.location}
                    onChange={e =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    className="pl-10 bg-white/5 border-white/10"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            {/* CRONÔMETRO */}
            <Card className="bg-zinc-950 border-white/10 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-400">
                  <Calendar className="h-5 w-5" /> Cronômetro
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">
                    Data e Hora (ISO)
                  </label>
                  <Input
                    type="datetime-local"
                    value={formData.eventDate.split(".")[0]}
                    onChange={e =>
                      setFormData({ ...formData, eventDate: e.target.value })
                    }
                    className="bg-white/5 border-white/10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* TAXA DE COOLER COM DIGITAÇÃO LIVRE */}
            <Card className="bg-zinc-950 border-white/10 text-white">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-blue-400">
                    <Ticket className="h-5 w-5" /> Taxa de Cooler
                  </CardTitle>
                  <CardDescription>
                    Habilitar cobrança extra para entrada com cooler
                  </CardDescription>
                </div>
                {/* SWITCH PARA ATIVAR/DESATIVAR */}
                <div
                  onClick={() =>
                    setFormData({
                      ...formData,
                      allowCooler: !formData.allowCooler,
                    })
                  }
                  className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${formData.allowCooler ? "bg-blue-600" : "bg-zinc-800"}`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full transition-transform ${formData.allowCooler ? "translate-x-6" : "translate-x-0"}`}
                  />
                </div>
              </CardHeader>

              <CardContent
                className={`space-y-4 transition-opacity ${formData.allowCooler ? "opacity-100" : "opacity-30 pointer-events-none"}`}
              >
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                    Preço Adicional do Cooler (R$)
                  </label>
                  <Input
                    type="number"
                    step="any" // PERMITE DIGITAÇÃO LIVRE EM REAIS
                    placeholder="0,00"
                    value={
                      formData.priceCooler > 0 ? formData.priceCooler / 100 : ""
                    }
                    onChange={e => {
                      const val = parseFloat(e.target.value);
                      setFormData({
                        ...formData,
                        priceCooler: isNaN(val) ? 0 : Math.round(val * 100),
                      });
                    }}
                    className="bg-white/5 border-white/10 focus:border-blue-500 h-12 text-blue-400 font-bold text-lg"
                  />
                  {!formData.allowCooler && (
                    <p className="text-[10px] text-red-500 italic mt-1 font-bold uppercase">
                      Opção desativada para os clientes
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-zinc-950 border-white/10 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-400">
                <DollarSign className="h-5 w-5" /> Precificação (R$)
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
              {/* INGRESSO NORMAL */}
              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                  Ingresso Normal (R$)
                </label>
                <Input
                  type="number"
                  step="any" // Permite digitar qualquer valor sem travar o incremento
                  placeholder="0,00"
                  value={
                    formData.priceNormal > 0 ? formData.priceNormal / 100 : ""
                  }
                  onChange={e => {
                    const val = parseFloat(e.target.value);
                    setFormData({
                      ...formData,
                      priceNormal: isNaN(val) ? 0 : Math.round(val * 100),
                    });
                  }}
                  className="bg-white/5 border-white/10 focus:border-green-500 h-12 text-lg"
                />
              </div>

              {/* TAXA DE SERVIÇO */}
              <div className="space-y-1">
                <label className="text-[10px] text-orange-400 font-bold uppercase italic tracking-wider">
                  Taxa de Serviço (R$)
                </label>
                <Input
                  type="number"
                  step="any"
                  placeholder="0,00"
                  value={
                    formData.serviceFee > 0 ? formData.serviceFee / 100 : ""
                  }
                  onChange={e => {
                    const val = parseFloat(e.target.value);
                    setFormData({
                      ...formData,
                      serviceFee: isNaN(val) ? 0 : Math.round(val * 100),
                    });
                  }}
                  className="bg-white/5 border-white/10 focus:border-orange-500 h-12 text-orange-400 text-lg"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              size="lg"
              disabled={updateMutation.isPending}
              className="bg-purple-600 hover:bg-purple-500 font-bold px-12 h-14"
            >
              {updateMutation.isPending ? (
                <Loader2 className="animate-spin mr-2" />
              ) : (
                <Save className="mr-2" />
              )}{" "}
              SALVAR TUDO
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
