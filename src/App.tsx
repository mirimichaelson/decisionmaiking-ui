import { useRef, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

import { GUI } from 'lil-gui'
import { useLoader } from '@react-three/fiber'

interface GalaxyParams {
  count: number
  size: number
  radius: number
  branches: number
  spin: number
  randomness: number
  randomnessPower: number
  insideColour: string
  outsideColour: string
  zoom: number
  yOffset: number
}

function Galaxy() {
  const [galaxyParams] = useState<GalaxyParams>({
    count: 100000,
    size: 0.01,
    radius: 5.5,
    branches: 4,
    spin: 1,
    randomness: 0.402,
    randomnessPower: 1.924,
    insideColour: '#498efd',
    outsideColour: '#142348',
    zoom: 1,
    yOffset: 5,
  })

  const pointsRef = useRef<THREE.Points>(null)
  const geometryRef = useRef(new THREE.BufferGeometry())
  const particlesTexture = useLoader(THREE.TextureLoader, '/1.png')

  const { camera } = useThree()

  useEffect(() => {
    const gui = new GUI()
    gui.add(galaxyParams, 'count').min(100).max(1000000).step(100).onFinishChange(generateGalaxy)
    gui.add(galaxyParams, 'size').min(0.001).max(0.1).step(0.001).onFinishChange(generateGalaxy)
    gui.add(galaxyParams, 'radius').min(0.01).max(20).step(0.1).onFinishChange(generateGalaxy)
    gui.add(galaxyParams, 'branches').min(2).max(15).step(1).onFinishChange(generateGalaxy)
    gui.add(galaxyParams, 'spin').min(-5).max(5).step(0.1).onFinishChange(generateGalaxy)
    gui.add(galaxyParams, 'randomness').min(0).max(2).step(0.001).onFinishChange(generateGalaxy)
    gui.add(galaxyParams, 'randomnessPower').min(1).max(10).step(0.001).onFinishChange(generateGalaxy)
    gui.addColor(galaxyParams, 'insideColour').onFinishChange(generateGalaxy)
    gui.addColor(galaxyParams, 'outsideColour').onFinishChange(generateGalaxy)

    gui.hide()

    generateGalaxy()

    return () => {
      gui.destroy()
    }
  }, [galaxyParams])

  const generateGalaxy = () => {
    const positions = new Float32Array(galaxyParams.count * 3)
    const colors = new Float32Array(galaxyParams.count * 3)
    const colorInside = new THREE.Color(galaxyParams.insideColour)
    const colorOutside = new THREE.Color(galaxyParams.outsideColour)

    for (let i = 0; i < galaxyParams.count; i++) {
      const i3 = i * 3
      const radius = Math.random() * galaxyParams.radius
      const spinAngle = radius * galaxyParams.spin
      const branchAngle = ((i % galaxyParams.branches) / galaxyParams.branches) * Math.PI * 2

      const randomX = Math.pow(Math.random(), galaxyParams.randomnessPower) * (Math.random() < 0.5 ? 1 : -1)
      const randomY = Math.pow(Math.random(), galaxyParams.randomnessPower) * (Math.random() < 0.5 ? 1 : -1)
      const randomZ = Math.pow(Math.random(), galaxyParams.randomnessPower) * (Math.random() < 0.5 ? 1 : -1)

      positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX
      positions[i3 + 1] = randomY
      positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ

      const mixedColor = colorInside.clone()
      mixedColor.lerp(colorOutside, radius / galaxyParams.radius)

      colors[i3] = mixedColor.r
      colors[i3 + 1] = mixedColor.g
      colors[i3 + 2] = mixedColor.b
    }

    geometryRef.current.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometryRef.current.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  }

  useFrame(({ clock }) => {
    const elapsedTime = clock.getElapsedTime()
    const radius = galaxyParams.radius * galaxyParams.zoom

    camera.position.x = Math.cos(elapsedTime / 5) * radius
    camera.position.z = Math.sin(elapsedTime / 5) * radius
    camera.position.y = galaxyParams.yOffset * galaxyParams.zoom
    camera.lookAt(new THREE.Vector3(0, 0, 0))
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry ref={geometryRef} />
      <pointsMaterial
        size={galaxyParams.size}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        vertexColors
        map={particlesTexture}
        alphaMap={particlesTexture}
        transparent
      />
    </points>
  )
}

export default function App() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  })

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <Canvas
      camera={{ position: [7, 3, 2], fov: 75, aspect: size.width / size.height, near: 0.1, far: 100 }}
      style={{ width: '100vw', height: '100vh', background: 'black' }}
      // TODO: Remove white background on scroll
    >
      <Galaxy />
    </Canvas>
  )
}
