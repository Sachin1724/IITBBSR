'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sphere, Ring } from '@react-three/drei'
import * as THREE from 'three'

interface ThreeSceneProps {
    scenario: 'orbit' | 'approach' | 'impact'
}

export default function ThreeScene({ scenario }: ThreeSceneProps) {
    const asteroidRef = useRef<THREE.Mesh>(null)
    const impactRef = useRef<THREE.Mesh>(null)

    useFrame(({ clock }) => {
        const t = clock.getElapsedTime()

        if (asteroidRef.current) {
            if (scenario === 'orbit') {
                // Elliptical orbit
                const a = 80 // semi-major axis
                const b = 60 // semi-minor axis
                asteroidRef.current.position.x = a * Math.cos(t * 0.3)
                asteroidRef.current.position.z = b * Math.sin(t * 0.3)
                asteroidRef.current.position.y = Math.sin(t * 0.5) * 10
            } else if (scenario === 'approach') {
                // Close approach trajectory
                const progress = (Math.sin(t * 0.5) + 1) / 2
                const distance = 15 + progress * 50
                asteroidRef.current.position.x = distance * Math.cos(t * 0.8)
                asteroidRef.current.position.z = distance * Math.sin(t * 0.8)
                asteroidRef.current.position.y = Math.sin(t) * 5
            } else if (scenario === 'impact') {
                // Impact trajectory
                const progress = (Math.sin(t * 0.4) + 1) / 2
                const distance = 100 - progress * 100
                asteroidRef.current.position.x = distance * Math.cos(t * 0.6 + Math.PI / 4)
                asteroidRef.current.position.z = distance * Math.sin(t * 0.6 + Math.PI / 4)
                asteroidRef.current.position.y = distance * 0.3

                // Show impact effect when close
                if (impactRef.current && distance < 15) {
                    impactRef.current.visible = true
                    impactRef.current.scale.setScalar(1 + (15 - distance) / 15)
                } else if (impactRef.current) {
                    impactRef.current.visible = false
                }
            }

            // Rotate asteroid
            asteroidRef.current.rotation.x += 0.01
            asteroidRef.current.rotation.y += 0.02
        }
    })

    return (
        <>
            {/* Sun (at origin) */}
            <Sphere args={[3, 32, 32]} position={[0, 0, 0]}>
                <meshStandardMaterial color="#FDB813" emissive="#FDB813" emissiveIntensity={0.5} />
            </Sphere>

            {/* Earth */}
            <group>
                <Sphere args={[6, 32, 32]} position={[0, 0, 0]}>
                    <meshStandardMaterial color="#4A90E2" roughness={0.7} metalness={0.2} />
                </Sphere>
                {/* Earth's atmosphere glow */}
                <Sphere args={[6.5, 32, 32]} position={[0, 0, 0]}>
                    <meshBasicMaterial color="#4A90E2" transparent opacity={0.1} />
                </Sphere>
            </group>

            {/* Earth's orbit ring */}
            <Ring args={[70, 71, 64]} rotation={[Math.PI / 2, 0, 0]}>
                <meshBasicMaterial color="#535C91" transparent opacity={0.2} side={THREE.DoubleSide} />
            </Ring>

            {/* Asteroid */}
            <Sphere ref={asteroidRef} args={[2, 16, 16]} position={[80, 0, 0]}>
                <meshStandardMaterial color="#9290C3" roughness={0.9} metalness={0.1} />
            </Sphere>

            {/* Asteroid trail */}
            <Trail asteroidRef={asteroidRef} />

            {/* Impact effect (only visible in impact scenario) */}
            <Sphere ref={impactRef} args={[8, 32, 32]} position={[0, 0, 0]} visible={false}>
                <meshBasicMaterial color="#FF4444" transparent opacity={0.3} />
            </Sphere>

            {/* Grid helper */}
            <gridHelper args={[200, 20, '#535C91', '#1B1A55']} />
        </>
    )
}

function Trail({ asteroidRef }: { asteroidRef: React.RefObject<THREE.Mesh> }) {
    const trailRef = useRef<THREE.Line>(null)
    const positions = useRef<number[]>([])
    const maxPoints = 50

    useFrame(() => {
        if (asteroidRef.current && trailRef.current) {
            const pos = asteroidRef.current.position
            positions.current.push(pos.x, pos.y, pos.z)

            if (positions.current.length > maxPoints * 3) {
                positions.current = positions.current.slice(-maxPoints * 3)
            }

            const geometry = new THREE.BufferGeometry()
            geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions.current, 3))
            trailRef.current.geometry = geometry
        }
    })

    return (
        <line ref={trailRef}>
            <bufferGeometry />
            <lineBasicMaterial color="#9290C3" transparent opacity={0.3} />
        </line>
    )
}
