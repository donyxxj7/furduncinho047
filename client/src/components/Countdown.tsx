import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc"; // Importamos o tRPC
import { Loader2 } from "lucide-react";

export function Countdown() {
  // 1. Buscamos as configurações do evento no banco
  const { data: settings, isLoading } = trpc.settings.get.useQuery();

  const calculateTimeLeft = () => {
    // 2. Se o banco ainda não respondeu, usamos uma data padrão ou agora mesmo
    // Mas se respondeu, usamos a settings.eventDate dinâmica!
    const targetDate = settings?.eventDate
      ? new Date(settings.eventDate).getTime()
      : new Date("2026-02-07T22:00:00").getTime(); // Fallback se o banco falhar

    const now = new Date().getTime();
    const difference = targetDate - now;

    if (difference < 0) {
      return { dias: 0, horas: 0, min: 0, seg: 0 };
    }

    return {
      dias: Math.floor(difference / (1000 * 60 * 60 * 24)),
      horas: Math.floor((difference / (1000 * 60 * 60)) % 24),
      min: Math.floor((difference / 1000 / 60) % 60),
      seg: Math.floor((difference / 1000) % 60),
    };
  };

  // 3. Atualizamos o estado inicial quando os dados do banco chegarem
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    // Recalcula sempre que os settings mudarem ou a cada segundo
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [settings]); // Adicionamos settings aqui para atualizar assim que o banco responder

  if (isLoading)
    return (
      <div className="flex justify-center my-8">
        <Loader2 className="animate-spin text-purple-500" />
      </div>
    );

  const TimeBox = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center bg-card/50 backdrop-blur-md border border-primary/30 rounded-lg p-3 md:p-4 min-w-[70px] md:min-w-[90px] shadow-[0_0_15px_rgba(168,85,247,0.15)]">
      <span className="text-2xl md:text-4xl font-bold text-white font-mono drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">
        {value < 10 ? `0${value}` : value}
      </span>
      <span className="text-[10px] md:text-xs text-purple-300 uppercase tracking-wider font-semibold mt-1">
        {label}
      </span>
    </div>
  );

  return (
    <div className="flex flex-wrap justify-center gap-3 md:gap-4 my-8">
      <TimeBox value={timeLeft.dias} label="Dias" />
      <TimeBox value={timeLeft.horas} label="Horas" />
      <TimeBox value={timeLeft.min} label="Min" />
      <TimeBox value={timeLeft.seg} label="Seg" />
    </div>
  );
}
