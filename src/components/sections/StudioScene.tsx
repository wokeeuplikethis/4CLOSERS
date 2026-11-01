'use client'

import { Component, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, useGLTF } from '@react-three/drei'
import { Bloom, EffectComposer } from '@react-three/postprocessing'
import * as THREE from 'three'

export type StudioId = 'moscow' | 'spb'

const MODEL_URL: Record<StudioId, string> = {
  moscow: '/models/moscow.glb',
  spb: '/models/spb.glb',
}

// Подгони под свой --signal
const ACCENT = '#ff5a36'
const BG = '#0a0a0b'

/* ───────── проверка: есть ли .glb в /public ───────── */

function useModelAvailable(url: string) {
  const [ok, setOk] = useState<boolean | null>(null)

  useEffect(() => {
    let cancelled = false
    setOk(null)

    fetch(url, { method: 'HEAD' })
      .then((r) => {
        if (cancelled) return
        const type = r.headers.get('content-type') ?? ''
        setOk(r.ok && !type.includes('text/html'))
      })
      .catch(() => !cancelled && setOk(false))

    return () => {
      cancelled = true
    }
  }, [url])

  return ok
}

/* ───────── GLB: центрируем и нормализуем размер ───────── */

function GlbModel({ url }: { url: string }) {
  const { scene } = useGLTF(url)

  const obj = useMemo(() => {
    const clone = scene.clone(true)
    const box = new THREE.Box3().setFromObject(clone)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())

    clone.position.sub(center)

    const wrap = new THREE.Group()
    wrap.add(clone)
    wrap.scale.setScalar(2.4 / Math.max(size.x, size.y, size.z))

    return wrap
  }, [scene])

  return <primitive object={obj} />
}

class ModelBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

/* ───────── fallback-примитивы ───────── */

function Body(props: JSX.IntrinsicElements['mesh'] & { children: ReactNode }) {
  const { children, ...rest } = props
  return (
    <mesh {...rest}>
      {children}
      <meshStandardMaterial color="#1b1b1f" metalness={0.65} roughness={0.35} />
    </mesh>
  )
}

function Glow(props: JSX.IntrinsicElements['mesh'] & { children: ReactNode }) {
  const { children, ...rest } = props
  return (
    <mesh {...rest}>
      {children}
      <meshStandardMaterial
        color="#ffb36b"
        emissive="#ffb36b"
        emissiveIntensity={2.4}
        toneMapped={false}
      />
    </mesh>
  )
}

function WindowRow({ y, z, count, width }: { y: number; z: number; count: number; width: number }) {
  const gap = width / count
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Glow key={i} position={[-width / 2 + gap * (i + 0.5), y, z]}>
          <boxGeometry args={[gap * 0.45, 0.12, 0.02]} />
        </Glow>
      ))}
    </>
  )
}

function MoscowFallback() {
  return (
    <group>
      <Body position={[0, -0.95, 0]}>
        <boxGeometry args={[2.4, 0.5, 1.2]} />
      </Body>
      <WindowRow y={-0.95} z={0.61} count={6} width={2.0} />

      {[-0.95, 0.95].map((x) => (
        <Body key={x} position={[x, -0.45, 0]}>
          <boxGeometry args={[0.35, 0.5, 0.35]} />
        </Body>
      ))}

      <Body position={[0, -0.2, 0]}>
        <boxGeometry args={[0.9, 1.0, 0.9]} />
      </Body>
      <Glow position={[0, 0.0, 0.46]}>
        <boxGeometry args={[0.28, 0.28, 0.02]} />
      </Glow>

      <Body position={[0, 0.8, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[0.65, 1.0, 4]} />
      </Body>
      <Glow position={[0, 1.4, 0]}>
        <sphereGeometry args={[0.07, 16, 16]} />
      </Glow>
    </group>
  )
}

function SpbFallback() {
  return (
    <group>
      <Body position={[0, -0.97, 0]}>
        <boxGeometry args={[2.8, 0.45, 1.0]} />
      </Body>
      <WindowRow y={-0.97} z={0.51} count={9} width={2.5} />

      <Body position={[0, -0.5, 0]}>
        <boxGeometry args={[0.8, 0.5, 0.8]} />
      </Body>
      <Body position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.12, 0.14, 0.6, 16]} />
      </Body>
      <Body position={[0, 0.9, 0]}>
        <coneGeometry args={[0.12, 1.1, 16]} />
      </Body>
      <Glow position={[0, 1.5, 0]}>
        <sphereGeometry args={[0.06, 16, 16]} />
      </Glow>
    </group>
  )
}

function StudioModel({ id }: { id: StudioId }) {
  const url = MODEL_URL[id]
  const available = useModelAvailable(url)
  const Fallback = id === 'moscow' ? MoscowFallback : SpbFallback

  if (available === null) return null
  if (!available) return <Fallback />

  return (
    <ModelBoundary fallback={<Fallback />}>
      <Suspense fallback={null}>
        <GlbModel url={url} />
      </Suspense>
    </ModelBoundary>
  )
}

/* ───────── вращение, tilt по курсору, смена модели ───────── */

function Rig({ studio, reduced }: { studio: StudioId; reduced: boolean }) {
  const outer = useRef<THREE.Group>(null)
  const inner = useRef<THREE.Group>(null)
  const [current, setCurrent] = useState<StudioId>(studio)

  const spin = useRef(0)
  const scale = useRef(1)
  const tilt = useRef({ x: 0, y: 0 })

  useFrame((state, dt) => {
    if (!outer.current || !inner.current) return

    const switching = current !== studio

    // растворение: модель схлопывается с ускоренным вращением, затем растёт обратно
    if (reduced) {
      scale.current = 1
      if (switching) setCurrent(studio)
    } else {
      scale.current = THREE.MathUtils.damp(scale.current, switching ? 0 : 1, switching ? 7 : 5, dt)
      if (switching && scale.current < 0.03) setCurrent(studio)
    }

    if (!reduced) {
      spin.current += dt * (0.35 + (switching ? (1 - scale.current) * 6 : 0))
    }

    const px = reduced ? 0 : state.pointer.x
    const py = reduced ? 0 : state.pointer.y

    tilt.current.x = THREE.MathUtils.damp(tilt.current.x, -py * 0.22, 4, dt)
    tilt.current.y = THREE.MathUtils.damp(tilt.current.y, px * 0.45, 4, dt)

    outer.current.rotation.set(tilt.current.x, tilt.current.y, 0)
    outer.current.scale.setScalar(Math.max(scale.current, 0.0001))
    inner.current.rotation.y = spin.current

    // лёгкий параллакс камеры
    state.camera.position.x = THREE.MathUtils.damp(state.camera.position.x, px * 0.35, 3, dt)
    state.camera.position.y = THREE.MathUtils.damp(state.camera.position.y, 1.1 + py * 0.2, 3, dt)
    state.camera.lookAt(0, -0.1, 0)
  })

  return (
    <group ref={outer}>
      <group ref={inner}>
        <StudioModel id={current} />
      </group>
    </group>
  )
}

function Platform() {
  return (
    <group position={[0, -1.3, 0]}>
      <mesh>
        <cylinderGeometry args={[1.7, 1.8, 0.08, 64]} />
        <meshStandardMaterial color="#111114" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.045, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.62, 1.68, 96]} />
        <meshStandardMaterial
          color={ACCENT}
          emissive={ACCENT}
          emissiveIntensity={2.2}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}

export default function StudioScene({
  studio,
  reduced = false,
}: {
  studio: StudioId
  reduced?: boolean
}) {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 1.1, 5.4], fov: 35 }}
      gl={{ antialias: true }}
      aria-hidden="true"
    >
      <color attach="background" args={[BG]} />
      <fog attach="fog" args={[BG, 6, 12]} />

      {/* ключевой + заполняющий */}
      <ambientLight intensity={0.18} />
      <directionalLight position={[-3, 3, 4]} intensity={1.3} color="#ffe2c2" />

      {/* rim light: контровой акцентный и холодный */}
      <spotLight
        position={[3.5, 2.5, -3.5]}
        angle={0.6}
        penumbra={0.8}
        intensity={90}
        color={ACCENT}
      />
      <spotLight
        position={[-3.5, 1.5, -3]}
        angle={0.6}
        penumbra={0.8}
        intensity={50}
        color="#6fa8ff"
      />

      <Platform />
      <Rig studio={studio} reduced={reduced} />

      <ContactShadows
        position={[0, -1.25, 0]}
        opacity={0.55}
        scale={6}
        blur={2.6}
        far={2.5}
      />

      <EffectComposer multisampling={0}>
        <Bloom intensity={0.9} luminanceThreshold={0.7} luminanceSmoothing={0.2} mipmapBlur />
      </EffectComposer>
    </Canvas>
  )
}