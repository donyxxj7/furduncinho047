import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { APP_LOGO } from "@/const";
import { trpc } from "@/lib/trpc";
import {
  ArrowLeft,
  UploadCloud,
  X,
  CheckCircle2,
  Loader2,
  AlertCircle,
  MessageCircle,
} from "lucide-react";
import { useState, useRef } from "react";
import { Link, useLocation, useRoute } from "wouter";
import { toast } from "sonner";

export default function SubmitProof() {
  const { isAuthenticated } = useAuth({
    redirectOnUnauthenticated: true,
  });
  const [, params] = useRoute("/enviar-comprovante/:ticketId");
  const ticketId = params?.ticketId ? parseInt(params.ticketId) : 0;
  const [, setLocation] = useLocation();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: ticket, isLoading } = trpc.tickets.getById.useQuery(
    { id: ticketId },
    { enabled: !!ticketId && isAuthenticated }
  );

  const submitProofMutation = trpc.payments.submitProof.useMutation({
    onSuccess: () => {
      toast.success("Comprovante enviado com sucesso!");
      setLocation("/meus-ingressos");
    },
    onError: error =>
      toast.error(error.message || "Erro ao enviar comprovante"),
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("O arquivo deve ter no máximo 5MB");
        return;
      }
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(",")[1];
      submitProofMutation.mutate({
        ticketId,
        proofData: base64Data,
        proofMimeType: selectedFile.type,
      });
    };
    reader.readAsDataURL(selectedFile);
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (isLoading)
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="animate-spin text-purple-500 h-10 w-10" />
      </div>
    );

  if (!ticket)
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center font-bold">
        Pedido não encontrado.
      </div>
    );

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden pb-20">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[50%] -translate-x-1/2 w-[600px] h-[600px] bg-purple-900/10 blur-[120px] rounded-full"></div>
      </div>

      <header className="border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/meus-ingressos">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <img
              src={APP_LOGO}
              className="h-8 w-8 rounded-full border border-white/10"
            />
            <span className="font-bold hidden md:inline uppercase tracking-widest text-sm">
              Comprovante de Pagamento
            </span>
          </div>
          <div className="w-20"></div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 relative z-10 flex flex-col items-center">
        <div className="w-full max-w-md space-y-6">
          <Card className="bg-white/5 border-white/10 backdrop-blur-md overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-purple-600 to-blue-600"></div>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">
                  Pedido
                </p>
                <p className="text-2xl font-mono font-bold text-purple-400">
                  #{ticketId}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">
                  Total a Pagar
                </p>
                <p className="text-2xl font-black text-white">
                  {(ticket.amount / 100).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* ÁREA DE UPLOAD */}
          <div className="bg-black/40 border border-dashed border-purple-500/30 rounded-2xl p-8 text-center hover:border-purple-500/60 transition-colors relative group">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
              disabled={!!selectedFile}
            />
            {!selectedFile ? (
              <div className="flex flex-col items-center gap-4 py-8">
                <div className="h-20 w-20 bg-purple-500/10 rounded-full flex items-center justify-center border border-purple-500/20 group-hover:scale-110 duration-300">
                  <UploadCloud className="h-10 w-10 text-purple-400" />
                </div>
                <h3 className="text-lg font-bold text-white">
                  Anexar Comprovante
                </h3>
                <p className="text-xs text-gray-600">
                  Formatos: JPG, PNG (Máx 5MB)
                </p>
              </div>
            ) : (
              <div className="relative z-30">
                <div className="relative rounded-xl overflow-hidden border border-white/20 shadow-2xl mx-auto max-h-[300px]">
                  <img
                    src={previewUrl!}
                    alt="Preview"
                    className="w-full h-full object-contain bg-black/50"
                  />
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute top-2 right-2 rounded-full h-8 w-8"
                    onClick={clearFile}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-center gap-2 mt-4 text-green-400">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-semibold text-sm">
                    Arquivo carregado!
                  </span>
                </div>
              </div>
            )}
          </div>

          <Button
            className={`w-full h-14 text-lg font-bold rounded-xl transition-all ${selectedFile ? "bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_30px_rgba(147,51,234,0.4)]" : "bg-white/10 text-gray-500 cursor-not-allowed"}`}
            onClick={handleSubmit}
            disabled={!selectedFile || submitProofMutation.isPending}
          >
            {submitProofMutation.isPending ? (
              <Loader2 className="animate-spin h-5 w-5" />
            ) : (
              "ENVIAR COMPROVANTE"
            )}
          </Button>

          {/* 🚀 NOVA SEÇÃO: ADMS RESPONSÁVEIS [cite: 2025-06-07] */}
          <div className="mt-12 space-y-4">
            <div className="text-center">
              <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] mb-2">
                Suporte e Verificação
              </h3>
              <p className="text-[11px] text-gray-600 leading-relaxed px-4">
                Chame um dos organizadores informando seu{" "}
                <span className="text-purple-400 font-bold">
                  ID #{ticketId}
                </span>
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { name: "Rosário", phone: "5547996979192" },
                { name: "Miorim", phone: "5547988996771" },
                { name: "Sutter", phone: "5547999488522" },
                { name: "Barcelos", phone: "5547996402934" },
              ].map(adm => (
                <a
                  key={adm.phone}
                  href={`https://wa.me/${adm.phone}?text=Salve!%20Acabei%20de%20fazer%20o%20PIX%20do%20pedido%20%23${ticketId}.%20Segue%20o%20comprovante.`}
                  target="_blank"
                  className="flex items-center gap-3 p-3 bg-white/5 border border-white/5 rounded-xl hover:border-green-500/50 transition-all group"
                >
                  <div className="h-8 w-8 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 group-hover:bg-green-500 group-hover:text-white transition-all">
                    <MessageCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-bold text-white text-xs">{adm.name}</p>
                    <p className="text-[9px] text-gray-500 uppercase font-black">
                      Organizador
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
