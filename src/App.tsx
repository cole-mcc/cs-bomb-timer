import bombImage from './assets/images/csgo-bomb.webp'
import explosionGif from './assets/images/explosion.gif'
import './App.css'

function App() {

  return (
    <main>
      <h1 className='font-[CounterStrike]'>CSGO BOMB APP</h1>
      <div>
        <img src={bombImage} className="" alt="Image of CSGO bomb" />
        <img src={explosionGif} />
      </div>
    </main>
  )
}

export default App
