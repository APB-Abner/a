import { useState } from 'react'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as THREE from 'three'
import Modelo from './components/Modelo'
import './App.css'

export default function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Modelo modelo='car.glb' scale='.5' />
    </>
  )
}


