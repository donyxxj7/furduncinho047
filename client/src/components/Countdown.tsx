import { useEffect, useState } from "react";

export function Countdown() {
  const calculateTimeLeft = () => {
    // DATA DO EVENTO: 07 de Março de 2026 (00:00)
    const eventDate = new Date("2026-03-07T00:00:00").getTime();
    const now = new Date().getTime();
    const difference = eventDate - now;

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

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

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