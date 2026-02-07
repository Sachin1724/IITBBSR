'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sphere, useTexture } from '@react-three/drei'
import * as THREE from 'three'

interface EarthModelProps {
    radius?: number
    rotation?: number
}

export function EarthModel({ radius = 5, rotation = 0 }: EarthModelProps) {
    const earthRef = useRef<THREE.Mesh>(null)

    // Load Earth textures (we'll use procedural for now, can add real textures later)
    const earthMaterial = useMemo(() => {
        return new THREE.MeshStandardMaterial({
            color: '#2233ff',
            roughness: 0.7,
            metalness: 0.1,
        })
    }, [])

    // Rotate Earth
    useFrame((state, delta) => {
        if (earthRef.current) {
            earthRef.current.rotation.y += delta * 0.05
        }
    })

    return (
        <group>
            {/* Earth sphere */}
            <Sphere ref={earthRef} args={[radius, 64, 64]} material={earthMaterial}>
                {/* Add atmosphere glow */}
                <meshBasicMaterial
                    color="#4488ff"
                    transparent
                    opacity={0.1}
                    side={THREE.BackSide}
                />
            </Sphere>

            {/* Atmosphere layer */}
            <Sphere args={[radius * 1.02, 64, 64]}>
                <meshBasicMaterial
                    color="#88ccff"
                    transparent
                    opacity={0.15}
                    side={THREE.BackSide}
                />
            </Sphere>

            {/* Lights */}
            <ambientLight intensity={0.3} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
        </group>
    )
}
