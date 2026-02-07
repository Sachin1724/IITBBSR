'use client'

import { useRef, Suspense } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture, Sphere } from '@react-three/drei'
import * as THREE from 'three'

interface EarthModelProps {
    radius?: number
    rotation?: number
}

function TexturedEarth({ radius }: { radius: number }) {
    const earthRef = useRef<THREE.Mesh>(null)

    // Load 8K Earth textures
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
        <Sphere ref={earthRef} args={[radius, 128, 128]}>
            <meshStandardMaterial
                map={dayMap}
                normalMap={normalMap}
                roughnessMap={specularMap}
                roughness={0.8}
                metalness={0.1}
            />
        </Sphere>
    )
}

function FallbackEarth({ radius }: { radius: number }) {
    const earthRef = useRef<THREE.Mesh>(null)

    useFrame((state, delta) => {
        if (earthRef.current) {
            earthRef.current.rotation.y += delta * 0.05
        }
    })

    return (
        <Sphere ref={earthRef} args={[radius, 64, 64]}>
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

export function EarthModel({ radius = 5, rotation = 0 }: EarthModelProps) {
    return (
        <group>
            {/* Earth with 8K Textures (fallback to blue sphere if textures fail) */}
            <Suspense fallback={<FallbackEarth radius={radius} />}>
                <TexturedEarth radius={radius} />
            </Suspense>

            {/* Atmosphere layer */}
            <Sphere args={[radius * 1.02, 64, 64]}>
                <meshBasicMaterial
                    color="#88ccff"
                    transparent
                    opacity={0.15}
                    side={THREE.BackSide}
                />
            </Sphere>

            {/* Outer atmosphere glow */}
            <Sphere args={[radius * 1.05, 64, 64]}>
                <meshBasicMaterial
                    color="#4488ff"
                    transparent
                    opacity={0.08}
                    side={THREE.BackSide}
                />
            </Sphere>

            {/* Lights */}
            <ambientLight intensity={0.4} />
            <directionalLight position={[10, 10, 5]} intensity={1.2} castShadow />
            <pointLight position={[-10, -10, -5]} intensity={0.3} color="#4488ff" />
        </group>
    )
}

// Preload textures for better performance
useTexture.preload('/textures/8k_earth_daymap.jpg')
useTexture.preload('/textures/8k_earth_normal_map_1.jpg')
useTexture.preload('/textures/8k_earth_specular_map.jpg')

