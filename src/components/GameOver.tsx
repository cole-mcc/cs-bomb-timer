interface GameOverProps {
  message: string;
  onReset?: () => void;
}

export default function GameOver({ message, onReset }: GameOverProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60">
      <h1 className="font-[CounterStrike] text-4xl sm:text-6xl md:text-7xl text-red-700 text-center mb-6">
        {message}
      </h1>
      {onReset && (
        <button onClick={onReset}>
          Restart
        </button>
      )}
    </div>
  );
}
