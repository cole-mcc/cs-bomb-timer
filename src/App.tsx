import { useReducer } from 'react'
import bombImage from './assets/images/csgo-bomb.webp'
import explosionGif from './assets/images/explosion.gif'
import './App.css'

import {
  bombReducer,
  createInitialMachine,
  BombStatus,
  getPlantProgress,
  getDefuseProgress,
  getBombTimeLeft,
} from './utils/stateMachine'
import { useAnimationFrame } from './hooks/useAnimationFrame'

export default function App() {
  const [machine, dispatch] = useReducer(bombReducer, createInitialMachine())
  const now = useAnimationFrame(true)

  const { status, context } = machine
  const plantProgress = getPlantProgress(context, now)
  const defuseProgress = getDefuseProgress(context, now)
  const bombTimeLeft = getBombTimeLeft(context, now)

  // Check for state transitions (e.g. planting done, defusing done, bomb explode)
  if (status === BombStatus.PLANTING && plantProgress >= 1) {
    dispatch({ type: 'PLANT_COMPLETE', time: now })
  }

  if (status === BombStatus.DEFUSING && defuseProgress >= 1) {
    dispatch({ type: 'DEFUSE_COMPLETE' })
  }

  if (status === BombStatus.PLANTED && bombTimeLeft <= 0) {
    dispatch({ type: 'COUNTDOWN_EXPIRED' })
  }

  const handlePlantStart = () => {
    if (status === BombStatus.IDLE) {
      dispatch({ type: 'PLANT_START', time: now })
    }
  }

  const handlePlantCancel = () => {
    if (status === BombStatus.PLANTING) {
      dispatch({ type: 'PLANT_CANCEL' })
    }
  }

  const handleDefuseStart = () => {
    if (status === BombStatus.PLANTED) {
      dispatch({ type: 'DEFUSE_START', time: now })
    }
  }

  const handleDefuseCancel = () => {
    if (status === BombStatus.DEFUSING) {
      dispatch({ type: 'DEFUSE_CANCEL' })
    }
  }

  const handleReset = () => {
    dispatch({ type: 'RESET' })
  }

  return (
    <main className="flex flex-col items-center gap-4 p-4">
      <h1 className="font-[CounterStrike] text-3xl mb-4">CSGO BOMB APP</h1>

      {/* Bomb / Explosion Display */}
      {status === BombStatus.EXPLODED ? (
        <img src={explosionGif} alt="Explosion" className="w-64" />
      ) : (
        <div className="relative w-48 h-48 flex items-center justify-center">
          <img src={bombImage} alt="CSGO bomb" className="w-full h-full object-contain" />
          {status === BombStatus.PLANTED && (
            <div className="absolute text-white text-2xl font-bold">
              {(bombTimeLeft / 1000).toFixed(1)}s
            </div>
          )}
        </div>
      )}

      {/* Progress bars */}
      {status === BombStatus.PLANTING && (
        <div className="w-48 bg-gray-700 h-2 rounded">
          <div
            className="bg-yellow-500 h-full rounded"
            style={{ width: `${plantProgress * 100}%` }}
          />
        </div>
      )}
      {status === BombStatus.DEFUSING && (
        <div className="w-48 bg-gray-700 h-2 rounded">
          <div
            className="bg-blue-500 h-full rounded"
            style={{ width: `${defuseProgress * 100}%` }}
          />
        </div>
      )}

      {/* Buttons */}
      <div className="flex flex-wrap justify-center gap-2 mt-4">
        {status === BombStatus.IDLE && (
          <button
            onClick={handlePlantStart}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Plant Bomb
          </button>
        )}
        {status === BombStatus.PLANTING && (
          <button
            onClick={handlePlantCancel}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Cancel Plant
          </button>
        )}
        {status === BombStatus.PLANTED && (
          <button
            onClick={handleDefuseStart}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Start Defuse
          </button>
        )}
        {status === BombStatus.DEFUSING && (
          <button
            onClick={handleDefuseCancel}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Cancel Defuse
          </button>
        )}
        {(status === BombStatus.EXPLODED || status === BombStatus.DEFUSED) && (
          <button
            onClick={handleReset}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Reset
          </button>
        )}
      </div>
    </main>
  )
}
