'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface ImpactEffects {
    craterDiameter?: number
    blastRadius: {
        severe: number
        moderate: number
        light: number
    }
    thermalRadius: number
    seismicMagnitude?: number
    tsunamiRadius?: number
}

interface ImpactVisualizationProps {
    impactLocation: { lat: number; lon: number }
    effects: ImpactEffects
    outcome: 'burnup' | 'airburst' | 'land_impact' | 'ocean_impact'
    isVisible: boolean
    earthRadius?: number
}

export function ImpactVisualization({
    impactLocation,
    effects,
    outcome,
    isVisible,
    earthRadius = 5,
}: ImpactVisualizationProps) {
    const flashRef = useRef<THREE.PointLight>(null)
    const shockwaveRef = useRef<THREE.Mesh>(null)
    const timeRef = useRef(0)

    // Convert lat/lon to 3D position
    const getImpactPosition = () => {
        const phi = (90 - impactLocation.lat) * (Math.PI / 180)
        const theta = (impactLocation.lon + 180) * (Math.PI / 180)

        const x = -earthRadius * Math.sin(phi) * Math.cos(theta)
        const y = earthRadius * Math.cos(phi)
        const z = earthRadius * Math.sin(phi) * Math.sin(theta)

        return new THREE.Vector3(x, y, z)
    }

    const impactPos = useMemo(() => getImpactPosition(), [impactLocation])

    // Animate impact flash and shockwave
    useFrame((state, delta) => {
        if (!isVisible) return

        timeRef.current += delta

        // Flash animation
        if (flashRef.current && timeRef.current < 1) {
            const intensity = 10 * (1 - timeRef.current)
            flashRef.current.intensity = Math.max(0, intensity)
        }

        // Shockwave expansion
        if (shockwaveRef.current && timeRef.current < 3) {
            const scale = timeRef.current * 2
            shockwaveRef.current.scale.setScalar(scale)
            const opacity = 1 - timeRef.current / 3
                ; (shockwaveRef.current.material as THREE.MeshBasicMaterial).opacity = opacity
        }
    })

    // Convert meters to scene units
    const metersToUnits = (meters: number) => {
        return (meters / 6371000) * earthRadius
    }

    return (
        <group position={impactPos}>
            {/* Impact flash */}
            {isVisible && outcome !== 'burnup' && (
                <pointLight ref={flashRef} color="#ffaa00" intensity={10} distance={5} />
            )}

            {/* Shockwave ring */}
            {isVisible && outcome !== 'burnup' && (
                <mesh ref={shockwaveRef} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[0.1, 0.2, 32]} />
                    <meshBasicMaterial
                        color="#ff6600"
                        transparent
                        opacity={1}
                        side={THREE.DoubleSide}
                    />
                </mesh>
            )}

            {/* Effect zones (concentric circles) */}
            {isVisible && outcome !== 'burnup' && (
                <>
                    {/* Severe damage zone (red) */}
                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
                        <ringGeometry
                            args={[
                                metersToUnits(effects.blastRadius.severe * 0.8),
                                metersToUnits(effects.blastRadius.severe),
                                32,
                            ]}
                        />
                        <meshBasicMaterial
                            color="#ff0000"
                            transparent
                            opacity={0.3}
                            side={THREE.DoubleSide}
                        />
                    </mesh>

                    {/* Moderate damage zone (orange) */}
                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
                        <ringGeometry
                            args={[
                                metersToUnits(effects.blastRadius.moderate * 0.8),
                                metersToUnits(effects.blastRadius.moderate),
                                32,
                            ]}
                        />
                        <meshBasicMaterial
                            color="#ff6600"
                            transparent
                            opacity={0.2}
                            side={THREE.DoubleSide}
                        />
                    </mesh>

                    {/* Light damage zone (yellow) */}
                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
                        <ringGeometry
                            args={[
                                metersToUnits(effects.blastRadius.light * 0.8),
                                metersToUnits(effects.blastRadius.light),
                                32,
                            ]}
                        />
                        <meshBasicMaterial
                            color="#ffcc00"
                            transparent
                            opacity={0.15}
                            side={THREE.DoubleSide}
                        />
                    </mesh>

                    {/* Thermal radiation zone (white) */}
                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
                        <circleGeometry args={[metersToUnits(effects.thermalRadius), 32]} />
                        <meshBasicMaterial
                            color="#ffffff"
                            transparent
                            opacity={0.1}
                            side={THREE.DoubleSide}
                        />
                    </mesh>
                </>
            )}

            {/* Tsunami zone for ocean impacts */}
            {isVisible && outcome === 'ocean_impact' && effects.tsunamiRadius && (
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
                    <ringGeometry
                        args={[
                            metersToUnits(effects.tsunamiRadius * 0.9),
                            metersToUnits(effects.tsunamiRadius),
                            64,
                        ]}
                    />
                    <meshBasicMaterial
                        color="#0088ff"
                        transparent
                        opacity={0.4}
                        side={THREE.DoubleSide}
                    />
                </mesh>
            )}
        </group>
    )
}
