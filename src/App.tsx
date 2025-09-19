import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900">
        <div className="flex gap-8 mb-6">
          <a href="https://vite.dev" target="_blank">
            <img src={viteLogo} className="h-24 w-24 transition-transform hover:scale-110" alt="Vite logo" />
          </a>
          <a href="https://react.dev" target="_blank">
            <img src={reactLogo} className="h-24 w-24 transition-transform hover:scale-110" alt="React logo" />
          </a>
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">Vite + React</h1>
        <div className="bg-gray-800 rounded-lg shadow p-6 mb-4">
          <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition" onClick={() => setCount((count) => count + 1)}>
            count is {count}
          </button>
          <p className="mt-2 text-gray-300">
            Edit <code className="bg-gray-700 px-1 rounded">src/App.tsx</code> and save to test HMR
          </p>
        </div>
        <p className="text-red-300 mt-2">
          Click on the Vite and React logos to learn more
        </p>
      </div>
    </>
  )
}

export default App
