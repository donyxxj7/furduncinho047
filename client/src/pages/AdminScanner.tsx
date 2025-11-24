import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_LOGO } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Camera, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";
import { Html5Qrcode } from "html5-qrcode";

export default function AdminScanner() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [scanning, setScanning] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [cameraId, setCameraId] = useState<string>("");

  const validateMutation = trpc.scanner.validate.useMutation({
    onSuccess: (data) => {
      setLastResult(data);
      if (data.valid) {
        toast.success("Ingresso válido! Check-in realizado.");
      } else {
        toast.error(data.message);
      }
    },
    onError: (error) => {
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
        const selectedCamera = cameras[cameras.length - 1]; // Prefer back camera
        setCameraId(selectedCamera.id);

        await scanner.start(
          selectedCamera.id,
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            // QR Code detected
            validateMutation.mutate({ qrHash: decodedText });
            scanner.pause(true);
            setTimeout(() => {
              if (scanner.isScanning) {
                scanner.resume();
              }
            }, 3000);
          },
          (errorMessage) => {
            // Ignore scanning errors (they happen continuously)
          }
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

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md w-full mx-4">
          <CardHeader>
            <CardTitle>Acesso Negado</CardTitle>
            <CardDescription>Você não tem permissão para acessar esta página.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/">
              <Button className="w-full">Voltar para Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/admin">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <img src={APP_LOGO} alt="Furduncinho047" className="h-10 w-10 rounded-full" />
            <h1 className="text-xl font-bold text-primary">Scanner de QR Code</h1>
          </div>
          <div className="w-20"></div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Scanner de Ingressos</h2>

          {/* Scanner Card */}
          <Card className="border-primary/20 mb-6">
            <CardHeader>
              <CardTitle>Câmera</CardTitle>
              <CardDescription>
                Aponte a câmera para o QR Code do ingresso
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div
                  id="qr-reader"
                  className="w-full rounded-lg overflow-hidden border border-border"
                  style={{ minHeight: scanning ? "300px" : "0" }}
                ></div>

                {!scanning ? (
                  <Button onClick={startScanning} className="w-full" size="lg">
                    <Camera className="mr-2 h-5 w-5" />
                    Iniciar Scanner
                  </Button>
                ) : (
                  <Button onClick={stopScanning} variant="destructive" className="w-full" size="lg">
                    Parar Scanner
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Result Card */}
          {lastResult && (
            <Card
              className={`border-2 ${
                lastResult.valid
                  ? "border-green-500 bg-green-500/5"
                  : "border-red-500 bg-red-500/5"
              }`}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {lastResult.valid ? (
                    <>
                      <CheckCircle2 className="h-6 w-6 text-green-500" />
                      <span className="text-green-500">Ingresso Válido</span>
                    </>
                  ) : lastResult.result === "used" ? (
                    <>
                      <AlertCircle className="h-6 w-6 text-yellow-500" />
                      <span className="text-yellow-500">Ingresso Já Utilizado</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-6 w-6 text-red-500" />
                      <span className="text-red-500">Ingresso Inválido</span>
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-lg font-semibold">{lastResult.message}</p>

                  {lastResult.ticket && (
                    <div className="bg-background/50 p-4 rounded-lg space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Código:</span>
                        <span className="font-medium">{lastResult.ticket.ticketCode}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Ingresso ID:</span>
                        <span className="font-medium">#{lastResult.ticket.id}</span>
                      </div>
                      {lastResult.ticket.validatedAt && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Validado em:</span>
                          <span className="font-medium">
                            {new Date(lastResult.ticket.validatedAt).toLocaleString("pt-BR")}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Instructions */}
          <Card className="border-primary/20 mt-6">
            <CardHeader>
              <CardTitle>Instruções</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>1. Clique em "Iniciar Scanner" para ativar a câmera</li>
                <li>2. Aponte a câmera para o QR Code do ingresso</li>
                <li>3. O sistema validará automaticamente o ingresso</li>
                <li>4. Ingressos válidos serão marcados como "utilizados"</li>
                <li>5. Ingressos já utilizados não podem ser validados novamente</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
