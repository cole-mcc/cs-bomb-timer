import { useState } from "react";

interface SettingsProps {
  plantTime: number;
  defuseTime: number;
  bombTimer: number;
  onChange: (settings: { plantTime: number; defuseTime: number; bombTimer: number }) => void;
}

export default function SettingsOverlay({ plantTime, defuseTime, bombTimer, onChange }: SettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localPlantTime, setLocalPlantTime] = useState(plantTime);
  const [localDefuseTime, setLocalDefuseTime] = useState(defuseTime);
  const [localBombTimer, setLocalBombTimer] = useState(bombTimer);

  const handleApply = () => {
    onChange({
      plantTime: localPlantTime,
      defuseTime: localDefuseTime,
      bombTimer: localBombTimer,
    });
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Settings Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="fixed bottom-4 left-4 z-50 bg-gray-800 text-white p-3 rounded-full shadow-lg hover:bg-gray-700"
          title="Settings"
        >
          ⚙️
        </button>
      )}

      {/* Bottom Drawer Panel */}
      <div
        className={`fixed left-0 right-0 bottom-0 bg-gray-900 text-white p-4 rounded-t-lg shadow-lg transition-transform duration-300 ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <h2 className="text-xl font-bold mb-4">Game Settings</h2>

        <div className="mb-3">
          <label className="block mb-1">Plant Time (ms)</label>
          <input
            type="number"
            value={localPlantTime}
            onChange={(e) => setLocalPlantTime(Number(e.target.value))}
            className="w-full px-2 py-1 rounded border-1"
          />
        </div>

        <div className="mb-3">
          <label className="block mb-1">Defuse Time (ms)</label>
          <input
            type="number"
            value={localDefuseTime}
            onChange={(e) => setLocalDefuseTime(Number(e.target.value))}
            className="w-full px-2 py-1 rounded border-1"
          />
        </div>

        <div className="mb-3">
          <label className="block mb-1">Bomb Timer (ms)</label>
          <input
            type="number"
            value={localBombTimer}
            onChange={(e) => setLocalBombTimer(Number(e.target.value))}
            className="w-full px-2 py-1 rounded border-1"
          />
        </div>

        <button
          onClick={handleApply}
          className="mt-2 w-full"
        >
          Apply
        </button>
      </div>
    </>
  );
}
