'use client'

import { useRef, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface TrajectoryPoint {
    time: number
    altitude: number
    velocity: number
    lat: number
    lon: number
    mass: number
}

interface AsteroidTrajectoryProps {
    trajectory: TrajectoryPoint[]
    diameter: number
    composition: 'rocky' | 'metallic' | 'carbonaceous'
    isAnimating: boolean
    currentTime: number
    earthRadius?: number
}

export function AsteroidTrajectory({
    trajectory,
    diameter,
    composition,
    isAnimating,
    currentTime,
    earthRadius = 5,
}: AsteroidTrajectoryProps) {
    const asteroidRef = useRef<THREE.Mesh>(null)
    const trailRef = useRef<any>(null)

    // Get composition color
    const getColor = () => {
        switch (composition) {
            case 'metallic':
                return '#cccccc'
            case 'carbonaceous':
                return '#333333'
            default:
                return '#996633'
        }
    }

    // Convert lat/lon/altitude to 3D position
    const latLonAltToPosition = (lat: number, lon: number, altitude: number) => {
        const phi = (90 - lat) * (Math.PI / 180)
        const theta = (lon + 180) * (Math.PI / 180)
        const r = earthRadius + altitude / 200000 // Scale altitude

        const x = -r * Math.sin(phi) * Math.cos(theta)
        const y = r * Math.cos(phi)
        const z = r * Math.sin(phi) * Math.sin(theta)

        return new THREE.Vector3(x, y, z)
    }

    // Update asteroid position based on current time
    useFrame(() => {
        if (!isAnimating || !asteroidRef.current || trajectory.length === 0) return

        // Find current position in trajectory
        const currentIndex = trajectory.findIndex((p) => p.time >= currentTime)
        if (currentIndex === -1 || currentIndex === 0) return

        const prev = trajectory[currentIndex - 1]
        const next = trajectory[currentIndex]
        const t = (currentTime - prev.time) / (next.time - prev.time)

        // Interpolate position
        const prevPos = latLonAltToPosition(prev.lat, prev.lon, prev.altitude)
        const nextPos = latLonAltToPosition(next.lat, next.lon, next.altitude)
        const currentPos = prevPos.lerp(nextPos, t)

        asteroidRef.current.position.copy(currentPos)

        // Scale based on mass (ablation)
        const scale = Math.pow(next.mass / trajectory[0].mass, 1 / 3)
        asteroidRef.current.scale.setScalar(scale)
    })

    // Create trajectory trail
    const trailPoints = useMemo(() => {
        return trajectory.map((p) => latLonAltToPosition(p.lat, p.lon, p.altitude))
    }, [trajectory])

    const trailGeometry = useMemo(() => {
        const geometry = new THREE.BufferGeometry().setFromPoints(trailPoints)
        return geometry
    }, [trailPoints])

    return (
        <group>
            {/* Asteroid */}
            <mesh ref={asteroidRef}>
                <sphereGeometry args={[diameter / 2000, 16, 16]} />
                <meshStandardMaterial color={getColor()} roughness={0.8} metalness={0.3} />
            </mesh>

            {/* Trajectory trail */}
            <primitive ref={trailRef} object={new THREE.Line(trailGeometry, new THREE.LineBasicMaterial({ color: '#ff6600', opacity: 0.5, transparent: true }))} />

            {/* Plasma trail effect (during atmospheric entry) */}
            {isAnimating && currentTime > 0 && (
                <pointLight
                    position={asteroidRef.current?.position || [0, 0, 0]}
                    color="#ff6600"
                    intensity={2}
                    distance={2}
                />
            )}
        </group>
    )
}

