'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Stars, Html, useTexture, Sphere } from '@react-three/drei'
import { Suspense, useState, useRef } from 'react'
import * as THREE from 'three'

interface Asteroid {
    id: string
    name: string
    closeApproachDate: string
    missDistance: number
    velocity: number
    diameter: number
    isHazardous: boolean
    orbitalData?: {
        semiMajorAxis?: number
        eccentricity?: number
        inclination?: number
    }
}

interface OrbitalViewProps {
    asteroids: Asteroid[]
}

// Realistic Earth component with textures
function RealisticEarth() {
    const earthRef = useRef<THREE.Mesh>(null)

    const [dayMap, normalMap, specularMap] = useTexture([
        '/textures/8k_earth_daymap.jpg',
        '/textures/8k_earth_normal_map_1.jpg',
        '/textures/8k_earth_specular_map.jpg',
    ])

    useFrame((state, delta) => {
        if (earthRef.current) {
            earthRef.current.rotation.y += delta * 0.05
        }
    })

    return (
        <>
            <Sphere ref={earthRef} args={[1, 128, 128]}>
                <meshStandardMaterial
                    map={dayMap}
                    normalMap={normalMap}
                    roughnessMap={specularMap}
                    roughness={0.8}
                    metalness={0.1}
                />
            </Sphere>

            {/* Atmosphere */}
            <Sphere args={[1.02, 64, 64]}>
                <meshBasicMaterial
                    color="#88ccff"
                    transparent
                    opacity={0.15}
                    side={THREE.BackSide}
                />
            </Sphere>

            <Sphere args={[1.05, 64, 64]}>
                <meshBasicMaterial
                    color="#4488ff"
                    transparent
                    opacity={0.08}
                    side={THREE.BackSide}
                />
            </Sphere>
        </>
    )
}

// Fallback Earth
function FallbackEarth() {
    const earthRef = useRef<THREE.Mesh>(null)

    useFrame((state, delta) => {
        if (earthRef.current) {
            earthRef.current.rotation.y += delta * 0.05
        }
    })

    return (
        <Sphere ref={earthRef} args={[1, 64, 64]}>
            <meshStandardMaterial
                color="#2244aa"
                roughness={0.7}
                metalness={0.1}
                emissive="#001133"
                emissiveIntensity={0.2}
            />
        </Sphere>
    )
}

// Enhanced asteroid marker with responsive sizing
function AsteroidMarker({
    asteroid,
    onClick,
    isSelected
}: {
    asteroid: Asteroid
    onClick: () => void
    isSelected: boolean
}) {
    const meshRef = useRef<THREE.Mesh>(null)
    const [hovered, setHovered] = useState(false)

    // Calculate position based on miss distance
    const distance = Math.min(asteroid.missDistance / 384400, 10) + 2
    const angle = Math.random() * Math.PI * 2
    const x = Math.cos(angle) * distance
    const z = Math.sin(angle) * distance
    const y = (Math.random() - 0.5) * 2

    const color = asteroid.isHazardous ? '#ff0000' : asteroid.missDistance < 0.05 ? '#ffaa00' : '#00ff00'

    // Base size scales with diameter, but responsive to camera distance
    const baseSize = Math.max(0.03, Math.min(asteroid.diameter / 1000, 0.2))

    useFrame((state) => {
        if (meshRef.current) {
            // Calculate distance from camera to asteroid
            const cameraDistance = state.camera.position.distanceTo(meshRef.current.position)

            // Scale inversely with distance (closer = smaller, farther = larger for visibility)
            const scale = baseSize * Math.max(0.5, Math.min(cameraDistance / 10, 2))
            meshRef.current.scale.setScalar(scale)

            // Gentle rotation
            meshRef.current.rotation.y += 0.01
        }
    })

    return (
        <group position={[x, y, z]}>
            <mesh
                ref={meshRef}
                onClick={onClick}
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
            >
                <sphereGeometry args={[1, 16, 16]} />
                <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={hovered || isSelected ? 0.8 : 0.5}
                    roughness={0.7}
                />
            </mesh>

            {/* Info label - always visible but scales with distance */}
            <Html distanceFactor={15} center>
                <div className={`bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none transition-all ${hovered || isSelected ? 'opacity-100 scale-110' : 'opacity-70'
                    }`}>
                    <div className="font-semibold">{asteroid.name}</div>
                    <div className="text-[10px] text-gray-300">
                        {asteroid.missDistance.toFixed(3)} LD • {asteroid.velocity.toFixed(1)} km/s
                    </div>
                    <div className="text-[10px] text-gray-400">
                        Ø {asteroid.diameter.toFixed(0)}m
                    </div>
                </div>
            </Html>
        </group>
    )
}

// Orbital path component
function OrbitalPath({ asteroid }: { asteroid: Asteroid }) {
    const distance = Math.min(asteroid.missDistance / 384400, 10) + 2
    const points: THREE.Vector3[] = []

    for (let i = 0; i <= 64; i++) {
        const angle = (i / 64) * Math.PI * 2
        const x = Math.cos(angle) * distance
        const z = Math.sin(angle) * distance * 0.8
        const y = Math.sin(angle * 2) * 0.5
        points.push(new THREE.Vector3(x, y, z))
    }

    const lineGeometry = new THREE.BufferGeometry().setFromPoints(points)
    const color = asteroid.isHazardous ? '#ff000040' : '#00ff0020'

    return (
        <primitive
            object={new THREE.Line(
                lineGeometry,
                new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.3 })
            )}
        />
    )
}

export function OrbitalView({ asteroids }: OrbitalViewProps) {
    const [selectedAsteroid, setSelectedAsteroid] = useState<Asteroid | null>(null)
    const [showPaths, setShowPaths] = useState(true)

    const displayAsteroids = asteroids.slice(0, 50)

    return (
        <div className="relative w-full h-[700px] bg-gradient-to-b from-[#070F2B] to-[#1B1A55] rounded-xl overflow-hidden">
            {/* Controls */}
            <div className="absolute top-4 left-4 z-10 bg-[#1B1A55]/80 backdrop-blur-md border border-[#535C91]/30 rounded-lg p-4 space-y-3">
                <h3 className="text-[#9290C3] font-semibold">Orbital View</h3>
                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="showPaths"
                        checked={showPaths}
                        onChange={(e) => setShowPaths(e.target.checked)}
                        className="w-4 h-4 accent-[#9290C3]"
                    />
                    <label htmlFor="showPaths" className="text-sm text-[#9290C3]">
                        Show Orbital Paths
                    </label>
                </div>
                <div className="text-xs text-[#9290C3]/60">
                    Showing {displayAsteroids.length} closest asteroids
                </div>
                <div className="text-xs text-[#9290C3]/40 mt-2 pt-2 border-t border-[#535C91]/30">
                    💡 Zoom in/out to see asteroids resize
                </div>
            </div>

            {/* Legend */}
            <div className="absolute top-4 right-4 z-10 bg-[#1B1A55]/80 backdrop-blur-md border border-[#535C91]/30 rounded-lg p-4 space-y-2">
                <h4 className="text-sm font-semibold text-[#9290C3]">Legend</h4>
                <div className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-[#9290C3]">Hazardous</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span className="text-[#9290C3]">Close Approach</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-[#9290C3]">Safe Distance</span>
                </div>
            </div>

            {/* Selected Asteroid Info */}
            {selectedAsteroid && (
                <div className="absolute bottom-4 left-4 right-4 z-10 bg-[#1B1A55]/90 backdrop-blur-md border border-[#535C91]/30 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <h4 className="text-lg font-bold text-[#9290C3]">{selectedAsteroid.name}</h4>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-sm">
                                <div className="text-[#9290C3]/60">Miss Distance:</div>
                                <div className="text-[#9290C3]">{selectedAsteroid.missDistance.toFixed(4)} LD</div>
                                <div className="text-[#9290C3]/60">Velocity:</div>
                                <div className="text-[#9290C3]">{selectedAsteroid.velocity.toFixed(2)} km/s</div>
                                <div className="text-[#9290C3]/60">Diameter:</div>
                                <div className="text-[#9290C3]">{selectedAsteroid.diameter.toFixed(0)} m</div>
                                <div className="text-[#9290C3]/60">Approach Date:</div>
                                <div className="text-[#9290C3]">{new Date(selectedAsteroid.closeApproachDate).toLocaleDateString()}</div>
                            </div>
                        </div>
                        <button
                            onClick={() => setSelectedAsteroid(null)}
                            className="text-[#9290C3] hover:text-white"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}

            {/* 3D Canvas */}
            <Canvas camera={{ position: [0, 5, 10], fov: 60 }}>
                <Suspense fallback={null}>
                    <Stars radius={100} depth={50} count={5000} factor={4} fade speed={1} />

                    {/* Realistic Earth with textures */}
                    <Suspense fallback={<FallbackEarth />}>
                        <RealisticEarth />
                    </Suspense>

                    {/* Orbital paths */}
                    {showPaths && displayAsteroids.map((asteroid) => (
                        <OrbitalPath key={`path-${asteroid.id}`} asteroid={asteroid} />
                    ))}

                    {/* Asteroid markers */}
                    {displayAsteroids.map((asteroid) => (
                        <AsteroidMarker
                            key={asteroid.id}
                            asteroid={asteroid}
                            onClick={() => setSelectedAsteroid(asteroid)}
                            isSelected={selectedAsteroid?.id === asteroid.id}
                        />
                    ))}

                    {/* Lights */}
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} intensity={1} />
                    <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4488ff" />

                    {/* Camera controls */}
                    <OrbitControls
                        enablePan={true}
                        enableZoom={true}
                        enableRotate={true}
                        minDistance={2}
                        maxDistance={50}
                    />
                </Suspense>
            </Canvas>

            {/* Instructions */}
            <div className="absolute bottom-4 right-4 z-10 bg-[#1B1A55]/70 backdrop-blur-sm border border-[#535C91]/20 rounded-lg p-2 text-xs text-[#9290C3]/60">
                Drag to rotate • Scroll to zoom • Click asteroids for details
            </div>
        </div>
    )
}
