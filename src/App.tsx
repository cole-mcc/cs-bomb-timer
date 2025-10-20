import { useState, useEffect } from "react";
import bombImage from "./assets/images/csgo-bomb.webp";
import explosionGif from "./assets/images/explosion.gif";
import GameOver from "./components/GameOver";
import SettingsOverlay from "./components/SettingsOverlay";

export const BombStatus = {
    IDLE: 'idle',
    PLANTING: 'planting',
    PLANTED: 'planted',
    DEFUSING: 'defusing',
    DEFUSED: 'defused',
    EXPLODED: 'exploded',
} as const;

export type BombStatus = (typeof BombStatus)[keyof typeof BombStatus];

export default function App() {
  const [status, setStatus] = useState<BombStatus>(BombStatus.IDLE);
  const [settings, setSettings] = useState({
    plantTime: 4000,
    defuseTime: 8000,
    bombTimer: 45000,
  });
  const [plantedAt, setPlantedAt] = useState<number | null>(null);
  const [actionStart, setActionStart] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const [showExplosion, setShowExplosion] = useState(false);

  // Simple ticking clock
  useEffect(() => {
    const id = requestAnimationFrame(function tick() {
      setNow(Date.now());
      requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const bombTimeLeft = plantedAt
    ? Math.max(0, settings.bombTimer - (now - plantedAt))
    : settings.bombTimer;

  const plantProgress = actionStart
    ? Math.min(1, (now - actionStart) / settings.plantTime)
    : 0;

  const defuseProgress = actionStart
    ? Math.min(1, (now - actionStart) / settings.defuseTime)
    : 0;

  // Handle explosion
  useEffect(() => {
    if ((status === BombStatus.PLANTED || status === BombStatus.DEFUSING)  && bombTimeLeft <= 0) {
      setStatus("exploded");
      setPlantedAt(null);
      setActionStart(null);
    }

    setShowExplosion(true);
    const timeout = setTimeout(() => {
      setShowExplosion(false);
    }, 3000);

    return () => clearTimeout(timeout); // clean up if component unmounts
  }, [bombTimeLeft, status]);

  // Handle plant completion
  useEffect(() => {
    if (status === "planting" && plantProgress >= 1) {
      setStatus("planted");
      setPlantedAt(now);
      setActionStart(null);
    }
  }, [plantProgress, status, now]);

  // Handle defuse completion
  useEffect(() => {
    if (status === "defusing" && defuseProgress >= 1 && bombTimeLeft > 0) {
      setStatus("defused");
      setPlantedAt(null);
      setActionStart(null);
    }
  }, [defuseProgress, status, bombTimeLeft]);

  const handlePointerDown = () => {
    if (status === "idle") {
      setStatus("planting");
      setActionStart(now);
    } else if (status === "planted") {
      setStatus("defusing");
      setActionStart(now);
    }
  };

  const handlePointerUp = () => {
    if (status === "planting") {
      setStatus("idle");
      setActionStart(null);
    } else if (status === "defusing") {
      setStatus("planted");
      setActionStart(null);
    }
  };

  const reset = () => {
    setStatus("idle");
    setPlantedAt(null);
    setActionStart(null);
  };

  return (
    <main className="flex flex-col items-center">
      <h1 className="font-[CounterStrike] text-2xl">CSGO BOMB APP</h1>

      {/* Bomb / Explosion Display */}
      {(status === BombStatus.EXPLODED && showExplosion) && (
        <div className="relative flex items-center justify-center">
          <img 
            src={explosionGif} 
            alt="Explosion" 
            className="explosion"
            onContextMenu={(e) => e.preventDefault()}
          />
        </div>
      )}
      
      {status !== BombStatus.EXPLODED && (
        <div 
          className="relative flex items-center justify-center"
          onMouseDown={handlePointerDown}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchEnd={handlePointerUp}
        >
          <img 
            src={bombImage} 
            alt="CSGO bomb" 
            className="w-full h-auto max-h-[90vh]"
            onContextMenu={(e) => e.preventDefault()}
            draggable={false}
          />
          
          {/* Bomb timer */}
          {(status === BombStatus.PLANTED || status === BombStatus.DEFUSING) && (
            <div className="absolute top-[18%] left-[16%] xxs:left-[21%] xs:left-[28%] sm:left-[34%] md:left-[38%] text-black font-[AlarmClock] text-right w-[7rem]">
              <p className='text-xl xxs:text-2xl xs:text-3xl sm:text-4xl md:text-5xl tabular-nums'>{(bombTimeLeft / 1000).toFixed(1)}</p>
            </div>
          )}
          
          {/* Progress bars */}
          {status === BombStatus.PLANTING && (
            <div className="absolute bottom-4 w-48 bg-gray-700 h-2 rounded">
              <div
                className="bg-yellow-500 h-full rounded"
                style={{ width: `${plantProgress * 100}%` }}
              />
            </div>
          )}
          {status === BombStatus.DEFUSING && (
            <div className="absolute bottom-4 w-48 bg-gray-700 h-2 rounded">
              <div
                className="bg-blue-500 h-full rounded"
                style={{ width: `${defuseProgress * 100}%` }}
              />
            </div>
          )}

          {/* Instruction overlay */}
          {(status === BombStatus.IDLE || status === BombStatus.PLANTED) && (
            <div className="absolute bottom-20 w-full text-center text-white pointer-events-none select-none">
              <p className='text-lg font-bold'>
                {status === BombStatus.IDLE
                  ? 'Tap + Hold to plant bomb'
                  : 'Tap + Hold to defuse bomb'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Game over screen */}
      {(status === BombStatus.DEFUSED || status === BombStatus.EXPLODED) && (
        <GameOver
          message={
            status === BombStatus.EXPLODED
              ? "Bomb Exploded - Terrorists Win"
              : "Bomb Defused - Counter Terrorists Win"
          }
          onReset={reset}
        />
      )}

      {/* Settings overlay at the bottom of the screen */}
      <SettingsOverlay
        plantTime={settings.plantTime}
        defuseTime={settings.defuseTime}
        bombTimer={settings.bombTimer}
        onChange={setSettings}
      />
    </main>
  )
}
