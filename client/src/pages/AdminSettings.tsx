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

  const [formData, setFormData] = useState({
    eventName: "",
    eventDate: "",
    location: "",
    priceNormal: 0,
    priceCooler: 0,
    serviceFee: 0,
    allowCooler: true,
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
        allowCooler: settings.allowCooler ?? true,
      });
    }
  }, [settings]);

  const updateMutation = trpc.settings.update.useMutation({
    onSuccess: () => {
      toast.success("Evento Atualizado!", {
        description: "As mudanças já estão ao vivo no site.",
      });
      utils.settings.get.invalidate();
    },
    onError: err => toast.error("Erro ao salvar: " + err.message),
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
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
          <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-fuchsia-600 uppercase italic">
            Configurar Evento
          </h1>
          <div className="w-20" />
        </header>

        <form onSubmit={handleSave} className="space-y-6">
          {/* INFORMAÇÕES GERAIS */}
          <Card className="bg-zinc-950 border-white/10 text-white shadow-2xl">
            <CardHeader className="border-b border-white/5 mb-4">
              <CardTitle className="flex items-center gap-2 text-purple-400 uppercase italic text-sm">
                <Info className="h-4 w-4" /> Informações do Evento
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase italic">
                  Nome Comercial
                </label>
                <Input
                  value={formData.eventName}
                  onChange={e =>
                    setFormData({ ...formData, eventName: e.target.value })
                  }
                  className="bg-white/5 border-white/10 h-12"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase italic">
                  Cidade e Local
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-4 h-4 w-4 text-zinc-600" />
                  <Input
                    value={formData.location}
                    onChange={e =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    className="pl-10 bg-white/5 border-white/10 h-12"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase italic">
                  Data e Hora do Início
                </label>
                <Input
                  type="datetime-local"
                  value={formData.eventDate.split(".")[0]}
                  onChange={e =>
                    setFormData({ ...formData, eventDate: e.target.value })
                  }
                  className="bg-white/5 border-white/10 h-12"
                />
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            {/* TAXA DE COOLER DINÂMICA */}
            <Card className="bg-zinc-950 border-white/10 text-white overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between bg-white/5">
                <div>
                  <CardTitle className="text-sm font-black italic uppercase">
                    Taxa de Cooler
                  </CardTitle>
                  <CardDescription className="text-[10px] italic">
                    Permitir venda de adicional
                  </CardDescription>
                </div>
                <div
                  onClick={() =>
                    setFormData({
                      ...formData,
                      allowCooler: !formData.allowCooler,
                    })
                  }
                  className={`w-11 h-6 rounded-full p-1 cursor-pointer transition-colors ${formData.allowCooler ? "bg-purple-600" : "bg-zinc-800"}`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full transition-transform ${formData.allowCooler ? "translate-x-5" : "translate-x-0"}`}
                  />
                </div>
              </CardHeader>
              <CardContent
                className={`p-6 space-y-4 transition-opacity ${formData.allowCooler ? "opacity-100" : "opacity-30 pointer-events-none"}`}
              >
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-blue-400 uppercase italic">
                    Valor Adicional (R$)
                  </label>
                  <Input
                    type="number"
                    step="any"
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
                    className="bg-white/5 border-white/10 h-12 text-lg font-bold"
                  />
                </div>
              </CardContent>
            </Card>

            {/* PRECIFICAÇÃO INGRESSO */}
            <Card className="bg-zinc-950 border-white/10 text-white">
              <CardHeader className="bg-white/5 mb-4 text-sm font-black italic uppercase">
                <CardTitle>Ingresso</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-green-400 uppercase italic">
                    Valor Normal (R$)
                  </label>
                  <Input
                    type="number"
                    step="any"
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
                    className="bg-white/5 border-white/10 h-12 text-lg font-bold"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <Button
            type="submit"
            disabled={updateMutation.isPending}
            className="w-full bg-purple-600 hover:bg-purple-500 font-black italic h-16 text-lg shadow-[0_0_30px_rgba(147,51,234,0.3)] transition-all active:scale-95"
          >
            {updateMutation.isPending ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Save className="mr-2" />
            )}{" "}
            SALVAR TODAS AS ALTERAÇÕES
          </Button>
        </form>
      </div>
    </div>
  );
}
