import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { APP_LOGO } from "@/const";
import { trpc } from "@/lib/trpc";
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Snowflake,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";
import { Html5Qrcode } from "html5-qrcode";

export default function AdminScanner() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [scanning, setScanning] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const validateMutation = trpc.scanner.validate.useMutation({
    onSuccess: data => {
      setLastResult(data);
      if (data.valid) {
        // Alerta sonoro ou vibração no celular para agilizar a portaria
        if (navigator.vibrate) navigator.vibrate(200);
        toast.success("Ingresso válido!");
      } else {
        toast.error(data.message);
      }
    },
    onError: error => {
      toast.error(error.message || "Erro ao validar QR Code");
    },
  });

  useEffect(() => {
    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop();
      }
    };
  }, []);

  const startScanning = async () => {
    try {
      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      const cameras = await Html5Qrcode.getCameras();
      if (cameras && cameras.length > 0) {
        // Seleciona a última câmera (geralmente a traseira do celular)
        const selectedCamera = cameras[cameras.length - 1];

        await scanner.start(
          selectedCamera.id,
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          decodedText => {
            validateMutation.mutate({ qrHash: decodedText });
            scanner.pause(true);
            // Pausa de 3 segundos para o segurança ver o resultado na tela
            setTimeout(() => {
              if (scanner.isScanning) {
                scanner.resume();
                setLastResult(null);
              }
            }, 3000);
          },
          () => {}
        );

        setScanning(true);
      } else {
        toast.error("Nenhuma câmera encontrada");
      }
    } catch (error) {
      console.error("Error starting scanner:", error);
      toast.error("Erro ao iniciar scanner");
    }
  };

  const stopScanning = async () => {
    try {
      if (scannerRef.current?.isScanning) {
        await scannerRef.current.stop();
        setScanning(false);
      }
    } catch (error) {
      console.error("Error stopping scanner:", error);
    }
  };

  if (authLoading) return null;

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black p-4">
        <Card className="max-w-md w-full bg-black/40 border-white/10 text-white">
          <CardHeader>
            <CardTitle>Acesso Negado</CardTitle>
            <CardDescription>
              Página restrita para administradores.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/">
              <Button className="w-full">Voltar</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/admin">
            <Button variant="ghost" size="sm" className="text-gray-400">
              <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <img
              src={APP_LOGO}
              alt="Logo"
              className="h-10 w-10 rounded-full border border-white/10"
            />
            <h1 className="text-xl font-bold">Portaria 047</h1>
          </div>
          <div className="w-20"></div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto space-y-6">
          {/* ÁREA DA CÂMERA */}
          <div className="relative aspect-square overflow-hidden rounded-3xl border-2 border-purple-500/30 bg-white/5 shadow-[0_0_50px_rgba(168,85,247,0.1)]">
            <div id="qr-reader" className="w-full h-full"></div>
            {!scanning && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 gap-4">
                <Button
                  onClick={startScanning}
                  size="lg"
                  className="bg-purple-600 hover:bg-purple-500 font-bold px-8"
                >
                  <Camera className="mr-2 h-6 w-6" /> ATIVAR CÂMERA
                </Button>
              </div>
            )}
            {scanning && (
              <div className="absolute inset-0 border-[40px] border-black/40 pointer-events-none"></div>
            )}
          </div>

          {/* RESULTADO COM ALERTA DE COOLER */}
          {lastResult && (
            <Card
              className={`border-4 animate-in zoom-in duration-300 ${
                lastResult.valid
                  ? lastResult.hasCooler
                    ? "bg-blue-600/20 border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.3)]"
                    : "bg-green-600/20 border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.3)]"
                  : "bg-red-600/20 border-red-500"
              }`}
            >
              <CardHeader className="text-center">
                <div className="flex justify-center mb-2">
                  {lastResult.valid ? (
                    lastResult.hasCooler ? (
                      <Snowflake className="h-12 w-12 text-blue-400 animate-pulse" />
                    ) : (
                      <CheckCircle2 className="h-12 w-12 text-green-400" />
                    )
                  ) : (
                    <XCircle className="h-12 w-12 text-red-500" />
                  )}
                </div>
                <CardTitle className="text-3xl font-black text-white">
                  {lastResult.valid
                    ? lastResult.hasCooler
                      ? "COM COOLER"
                      : "LIBERADO"
                    : "BLOQUEADO"}
                </CardTitle>
                <CardDescription className="text-white font-bold opacity-90">
                  {lastResult.message}
                </CardDescription>
              </CardHeader>
              {lastResult.ticket && (
                <CardContent className="bg-black/40 mx-4 mb-4 rounded-xl p-4 border border-white/10">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">ID Pedido:</span>
                    <span className="font-mono font-bold">
                      #{lastResult.ticket.id}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-400">Valor Pago:</span>
                    <span className="font-bold">
                      R$ {(lastResult.ticket.amount / 100).toFixed(2)}
                    </span>
                  </div>
                </CardContent>
              )}
            </Card>
          )}

          {scanning && (
            <Button
              onClick={stopScanning}
              variant="ghost"
              className="w-full text-red-500 hover:text-red-400 hover:bg-red-500/10"
            >
              Desativar Câmera
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
