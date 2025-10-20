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

  const handlePlantPointerDown = () => {
    if (status === BombStatus.IDLE) dispatch({ type: 'PLANT_START', time: now })
  }
  const handlePlantPointerUp = () => {
    if (status === BombStatus.PLANTING) dispatch({ type: 'PLANT_CANCEL' })
  }
  const handleDefusePointerDown = () => {
    if (status === BombStatus.PLANTED) dispatch({ type: 'DEFUSE_START', time: now })
  }
  const handleDefusePointerUp = () => {
    if (status === BombStatus.DEFUSING) dispatch({ type: 'DEFUSE_CANCEL' })
  }

  const handleReset = () => {
    dispatch({ type: 'RESET' })
  }

  return (
    <main className="flex flex-col items-center">
      <h1 className="font-[CounterStrike] text-2xl">CSGO BOMB APP</h1>

      {/* Bomb / Explosion Display */}
      {status === BombStatus.EXPLODED ? (
        <div className="relative flex items-center justify-center">
          <img 
            src={explosionGif} 
            alt="Explosion" 
            className="w-full h-auto max-h-[90vh]"
            onContextMenu={(e) => e.preventDefault()}
          />
          <button
              onClick={handleReset}
              className="absolute bottom-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Reset
          </button>
        </div>
      ) : (
        <div 
          className="relative flex items-center justify-center"
          onMouseDown={
            status === BombStatus.IDLE
              ? handlePlantPointerDown
              : status === BombStatus.PLANTED
              ? handleDefusePointerDown
              : undefined
          }
          onMouseUp={
            status === BombStatus.PLANTING
              ? handlePlantPointerUp
              : status === BombStatus.DEFUSING
              ? handleDefusePointerUp
              : undefined
          }
          onMouseLeave={
            status === BombStatus.PLANTING
              ? handlePlantPointerUp
              : status === BombStatus.DEFUSING
              ? handleDefusePointerUp
              : undefined
          }
          onTouchStart={
            status === BombStatus.IDLE
              ? handlePlantPointerDown
              : status === BombStatus.PLANTED
              ? handleDefusePointerDown
              : undefined
          }
          onTouchEnd={
            status === BombStatus.PLANTING
              ? handlePlantPointerUp
              : status === BombStatus.DEFUSING
              ? handleDefusePointerUp
              : undefined
          }
        >
          <img 
            src={bombImage} 
            alt="CSGO bomb" 
            className="w-full h-auto max-h-[90vh]"
            onContextMenu={(e) => e.preventDefault()}
          />
          
          {/* Bomb timer */}
          {(status === BombStatus.PLANTED || status === BombStatus.DEFUSING) && (
            <div className="absolute top-[18%] left-[44%] md:left-[43%] text-black font-[AlarmClock] text-right">
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

      {/* Reset button after defuse */}
      {status === BombStatus.DEFUSED && (
        <button
          onClick={handleReset}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Reset
        </button>
      )}
    </main>
  )
}
