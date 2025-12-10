import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_LOGO } from "@/const";
import { trpc } from "@/lib/trpc";
import {
  ArrowLeft,
  UploadCloud,
  FileImage,
  X,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useState, useRef } from "react";
import { Link, useLocation, useRoute } from "wouter";
import { toast } from "sonner";

export default function SubmitProof() {
  const { user, isAuthenticated } = useAuth({
    redirectOnUnauthenticated: true,
  });
  const [, params] = useRoute("/enviar-comprovante/:ticketId");
  const ticketId = params?.ticketId ? parseInt(params.ticketId) : 0;
  const [, setLocation] = useLocation();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Busca dados do ingresso para mostrar no topo
  const { data: ticket, isLoading } = trpc.tickets.getById.useQuery(
    { id: ticketId },
    {
      enabled: !!ticketId && isAuthenticated,
    }
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
        // 5MB limit
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
      // Remove o prefixo "data:image/xyz;base64," para enviar só os dados
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
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Ingresso não encontrado.
      </div>
    );

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Luzes de Fundo */}
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
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <img src={APP_LOGO} className="h-8 w-8 rounded-full" />
            <span className="font-bold hidden md:inline">
              Envio de Comprovante
            </span>
          </div>
          <div className="w-20"></div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 relative z-10 flex flex-col items-center">
        <div className="w-full max-w-md space-y-6">
          {/* Card de Informação do Pedido */}
          <Card className="bg-white/5 border-white/10 backdrop-blur-md">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">
                  Pedido
                </p>
                <p className="text-2xl font-mono font-bold text-purple-400">
                  #{ticketId}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400 uppercase tracking-wider">
                  Valor
                </p>
                <p className="text-xl font-bold text-white">R$ 25,00</p>
              </div>
            </CardContent>
          </Card>

          {/* Área Principal de Upload */}
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
                <div className="h-20 w-20 bg-purple-500/10 rounded-full flex items-center justify-center group-hover:bg-purple-500/20 transition-all border border-purple-500/20 group-hover:scale-110 duration-300">
                  <UploadCloud className="h-10 w-10 text-purple-400" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white">
                    Toque para selecionar
                  </h3>
                  <p className="text-sm text-gray-400">
                    ou arraste o comprovante aqui
                  </p>
                </div>
                <p className="text-xs text-gray-600">
                  Formatos: JPG, PNG, PDF (Máx 5MB)
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
                    className="absolute top-2 right-2 rounded-full h-8 w-8 shadow-lg"
                    onClick={clearFile}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-center gap-2 mt-4 text-green-400">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-semibold text-sm">
                    Imagem carregada
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Instruções */}
          {!selectedFile && (
            <div className="flex gap-3 bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl items-start">
              <AlertCircle className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
              <div className="text-sm text-gray-300">
                <p className="font-bold text-blue-300 mb-1">Importante:</p>
                Certifique-se de que o comprovante mostre claramente a{" "}
                <strong>data</strong>, o <strong>valor</strong> e o{" "}
                <strong>destinatário</strong> do PIX.
              </div>
            </div>
          )}

          {/* Botão de Envio */}
          <Button
            className={`w-full h-14 text-lg font-bold rounded-xl transition-all ${
              selectedFile
                ? "bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_30px_rgba(147,51,234,0.4)]"
                : "bg-white/10 text-gray-500 cursor-not-allowed"
            }`}
            onClick={handleSubmit}
            disabled={!selectedFile || submitProofMutation.isPending}
          >
            {submitProofMutation.isPending ? (
              <div className="flex items-center gap-2">
                <Loader2 className="animate-spin h-5 w-5" /> Enviando...
              </div>
            ) : (
              "ENVIAR COMPROVANTE AGORA"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
