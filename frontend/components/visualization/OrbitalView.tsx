'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars, Html } from '@react-three/drei'
import { Suspense, useState } from 'react'
import * as THREE from 'three'
import { EarthModel } from '../simulation/EarthModel'
import { MetricErrorBoundary } from '../ui/MetricErrorBoundary'

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
        longitudeAscendingNode?: number
        perihelionArgument?: number
    }
}

interface OrbitalViewProps {
    asteroids: Asteroid[]
}

// Asteroid marker component
function AsteroidMarker({ asteroid, onClick }: { asteroid: Asteroid; onClick: () => void }) {
    // Calculate position based on miss distance (simplified)
    const distance = Math.min(asteroid.missDistance / 384400, 10) + 2 // Scale to scene units
    const angle = Math.random() * Math.PI * 2 // Random angle for demo
    const x = Math.cos(angle) * distance
    const z = Math.sin(angle) * distance
    const y = (Math.random() - 0.5) * 2 // Random height

    const color = asteroid.isHazardous ? '#ff0000' : asteroid.missDistance < 0.05 ? '#ffaa00' : '#00ff00'
    const size = Math.max(0.05, Math.min(asteroid.diameter / 1000, 0.3))

    return (
        <group position={[x, y, z]}>
            <mesh onClick={onClick}>
                <sphereGeometry args={[size, 16, 16]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
            </mesh>
            <Html distanceFactor={10}>
                <div className="bg-black/70 text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none">
                    {asteroid.name}
                </div>
            </Html>
        </group>
    )
}

// Orbital path component (Keplerian ellipse)
function OrbitalPath({ asteroid }: { asteroid: Asteroid }) {
    const points: THREE.Vector3[] = []
    const segmentCount = 128

    if (asteroid.orbitalData) {
        // Use Keplerian elements if available
        const { semiMajorAxis = 1, eccentricity = 0, inclination = 0, longitudeAscendingNode = 0, perihelionArgument = 0 } = asteroid.orbitalData

        // Convert degrees to radians
        const i = (inclination * Math.PI) / 180
        const om = (longitudeAscendingNode * Math.PI) / 180
        const w = (perihelionArgument * Math.PI) / 180

        // Scale factor for visualization (compressed to fit view)
        const scale = 5

        for (let j = 0; j <= segmentCount; j++) {
            const E = (j / segmentCount) * 2 * Math.PI // Eccentric anomaly

            // Perifocal coordinates
            const P = semiMajorAxis * (Math.cos(E) - eccentricity) * scale
            const Q = semiMajorAxis * Math.sqrt(1 - eccentricity * eccentricity) * Math.sin(E) * scale

            // Rotate to Heliocentric Ecliptic coordinates
            const x = (Math.cos(om) * Math.cos(w) - Math.sin(om) * Math.sin(w) * Math.cos(i)) * P +
                (-Math.cos(om) * Math.sin(w) - Math.sin(om) * Math.cos(w) * Math.cos(i)) * Q

            const y = (Math.sin(om) * Math.sin(i)) * P + (Math.cos(om) * Math.sin(i)) * Q

            const z = (Math.sin(om) * Math.cos(w) + Math.cos(om) * Math.sin(w) * Math.cos(i)) * P +
                (-Math.sin(om) * Math.sin(w) + Math.cos(om) * Math.cos(w) * Math.cos(i)) * Q

            points.push(new THREE.Vector3(x, y, z)) // Swap Y/Z for Three.js coordinate system mostly matches
        }
    } else {
        // Fallback to simple circle based on miss distance
        const distance = Math.min(asteroid.missDistance / 384400, 10) + 2

        // Create elliptical path
        for (let i = 0; i <= segmentCount; i++) {
            const angle = (i / segmentCount) * Math.PI * 2
            const x = Math.cos(angle) * distance
            const z = Math.sin(angle) * distance * 0.8 // Slightly elliptical
            const y = Math.sin(angle * 2) * 0.5 // Add some vertical variation
            points.push(new THREE.Vector3(x, y, z))
        }
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

    // Limit to closest 50 asteroids for performance
    const displayAsteroids = asteroids.slice(0, 50)

    return (
        <div className="relative w-full h-[700px] bg-gradient-to-b from-[#070F2B] to-[#1B1A55] rounded-xl overflow-hidden shadow-2xl">
            <MetricErrorBoundary>
                {/* Controls */}
                <div className="absolute top-4 left-4 z-10 bg-[#1B1A55]/80 backdrop-blur-md border border-[#535C91]/30 rounded-lg p-4 space-y-3">
                    <h3 className="text-[#9290C3] font-semibold">Orbital View</h3>
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="showPaths"
                            checked={showPaths}
                            onChange={(e) => setShowPaths(e.target.checked)}
                            className="w-4 h-4 accent-[#9290C3] cursor-pointer"
                        />
                        <label htmlFor="showPaths" className="text-sm text-[#9290C3] cursor-pointer">
                            Show Orbital Paths
                        </label>
                    </div>
                    <div className="text-xs text-[#9290C3]/60">
                        Showing {displayAsteroids.length} closest asteroids
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
                                className="p-1 hover:bg-[#535C91]/30 rounded-lg transition-colors text-[#9290C3]"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                )}

                {/* 3D Canvas */}
                <Canvas camera={{ position: [0, 8, 15], fov: 60 }}>
                    <Suspense fallback={null}>
                        {/* Background stars */}
                        <Stars radius={100} depth={50} count={5000} factor={4} fade speed={1} />

                        {/* Textured Earth Model */}
                        <EarthModel radius={1} />

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
                            />
                        ))}

                        {/* Lights are handled inside EarthModel, but we add some scene lights too */}
                        <ambientLight intensity={0.5} />
                        <pointLight position={[10, 10, 10]} intensity={1} />

                        {/* Camera controls */}
                        <OrbitControls
                            enablePan={true}
                            enableZoom={true}
                            enableRotate={true}
                            minDistance={3}
                            maxDistance={50}
                        />
                    </Suspense>
                </Canvas>

                {/* Instructions */}
                <div className="absolute bottom-4 right-4 z-10 bg-[#1B1A55]/70 backdrop-blur-sm border border-[#535C91]/20 rounded-lg p-2 text-xs text-[#9290C3]/60">
                    Click and drag to rotate • Scroll to zoom • Click asteroids for details
                </div>
            </MetricErrorBoundary>
        </div>
    )
}
