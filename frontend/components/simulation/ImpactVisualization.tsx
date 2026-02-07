'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { FireParticles } from './FireParticles'

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
    const severeRingRef = useRef<THREE.Mesh>(null)
    const moderateRingRef = useRef<THREE.Mesh>(null)
    const lightRingRef = useRef<THREE.Mesh>(null)
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
        if (!isVisible) {
            timeRef.current = 0
            return
        }

        timeRef.current += delta

        // Flash animation
        if (flashRef.current && timeRef.current < 1) {
            const intensity = 15 * (1 - timeRef.current)
            flashRef.current.intensity = Math.max(0, intensity)
        }

        // Shockwave expansion
        if (shockwaveRef.current && timeRef.current < 3) {
            const scale = timeRef.current * 2
            shockwaveRef.current.scale.setScalar(scale)
            const opacity = 1 - timeRef.current / 3
                ; (shockwaveRef.current.material as THREE.MeshBasicMaterial).opacity = opacity
        }

        // Pulsing damage zones
        const pulse = Math.sin(timeRef.current * 3) * 0.2 + 0.8
        if (severeRingRef.current) {
            (severeRingRef.current.material as THREE.MeshBasicMaterial).opacity = 0.4 * pulse
        }
        if (moderateRingRef.current) {
            (moderateRingRef.current.material as THREE.MeshBasicMaterial).opacity = 0.3 * pulse
        }
        if (lightRingRef.current) {
            (lightRingRef.current.material as THREE.MeshBasicMaterial).opacity = 0.2 * pulse
        }
    })

    // Convert meters to scene units
    const metersToUnits = (meters: number) => {
        return (meters / 6371000) * earthRadius
    }

    const craterRadius = effects.craterDiameter ? metersToUnits(effects.craterDiameter / 2) : 0

    return (
        <group position={impactPos}>
            {/* Fire particles */}
            {isVisible && outcome !== 'burnup' && timeRef.current < 5 && (
                <FireParticles
                    position={new THREE.Vector3(0, 0, 0)}
                    intensity={1.5}
                    isActive={isVisible}
                />
            )}

            {/* Impact flash */}
            {isVisible && outcome !== 'burnup' && (
                <>
                    <pointLight ref={flashRef} color="#ffdd00" intensity={15} distance={8} />
                    <pointLight color="#ff6600" intensity={5} distance={4} />
                </>
            )}

            {/* Crater depression (for land impacts) */}
            {isVisible && outcome === 'land_impact' && craterRadius > 0 && (
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.03, 0]}>
                    <circleGeometry args={[craterRadius, 64]} />
                    <meshStandardMaterial
                        color="#2a1810"
                        roughness={0.95}
                        metalness={0.05}
                        emissive="#ff4400"
                        emissiveIntensity={0.15}
                    />
                </mesh>
            )}

            {/* Shockwave ring */}
            {isVisible && outcome !== 'burnup' && (
                <mesh ref={shockwaveRef} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[0.1, 0.25, 32]} />
                    <meshBasicMaterial
                        color="#ff8800"
                        transparent
                        opacity={1}
                        side={THREE.DoubleSide}
                    />
                </mesh>
            )}

            {/* Effect zones (concentric circles) with enhanced visibility */}
            {isVisible && outcome !== 'burnup' && (
                <>
                    {/* Severe damage zone (red) */}
                    <mesh ref={severeRingRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
                        <ringGeometry
                            args={[
                                metersToUnits(effects.blastRadius.severe * 0.75),
                                metersToUnits(effects.blastRadius.severe),
                                64,
                            ]}
                        />
                        <meshBasicMaterial
                            color="#ff0000"
                            transparent
                            opacity={0.4}
                            side={THREE.DoubleSide}
                        />
                    </mesh>

                    {/* Moderate damage zone (orange) */}
                    <mesh ref={moderateRingRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]}>
                        <ringGeometry
                            args={[
                                metersToUnits(effects.blastRadius.moderate * 0.75),
                                metersToUnits(effects.blastRadius.moderate),
                                64,
                            ]}
                        />
                        <meshBasicMaterial
                            color="#ff6600"
                            transparent
                            opacity={0.3}
                            side={THREE.DoubleSide}
                        />
                    </mesh>

                    {/* Light damage zone (yellow) */}
                    <mesh ref={lightRingRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.009, 0]}>
                        <ringGeometry
                            args={[
                                metersToUnits(effects.blastRadius.light * 0.75),
                                metersToUnits(effects.blastRadius.light),
                                64,
                            ]}
                        />
                        <meshBasicMaterial
                            color="#ffcc00"
                            transparent
                            opacity={0.2}
                            side={THREE.DoubleSide}
                        />
                    </mesh>

                    {/* Thermal radiation zone (white/orange glow) */}
                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 0]}>
                        <circleGeometry args={[metersToUnits(effects.thermalRadius), 64]} />
                        <meshBasicMaterial
                            color="#ffaa44"
                            transparent
                            opacity={0.15}
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
                            metersToUnits(effects.tsunamiRadius * 0.85),
                            metersToUnits(effects.tsunamiRadius),
                            64,
                        ]}
                    />
                    <meshBasicMaterial
                        color="#0088ff"
                        transparent
                        opacity={0.5}
                        side={THREE.DoubleSide}
                    />
                </mesh>
            )}
        </group>
    )
}

