import { useState } from 'react'
import Modelo from './components/Modelo'
import './App.css'

export default function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Modelo modelo='ca.glb' scale='.5' />
    </>
  )
}


