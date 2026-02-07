'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface FireParticlesProps {
    position: THREE.Vector3
    intensity?: number
    isActive: boolean
}

export function FireParticles({ position, intensity = 1, isActive }: FireParticlesProps) {
    const particlesRef = useRef<THREE.Points>(null)
    const timeRef = useRef(0)

    const particleCount = Math.floor(1000 * intensity)

    const { positions, velocities, lifetimes, sizes } = useMemo(() => {
        const positions = new Float32Array(particleCount * 3)
        const velocities = new Float32Array(particleCount * 3)
        const lifetimes = new Float32Array(particleCount)
        const sizes = new Float32Array(particleCount)
        const colors = new Float32Array(particleCount * 3)

        for (let i = 0; i < particleCount; i++) {
            // Initialize particles at impact point
            positions[i * 3] = 0
            positions[i * 3 + 1] = 0
            positions[i * 3 + 2] = 0

            // Random velocities (upward with spread)
            const angle = Math.random() * Math.PI * 2
            const speed = 0.5 + Math.random() * 1.5
            velocities[i * 3] = Math.cos(angle) * speed * 0.3
            velocities[i * 3 + 1] = speed // Upward
            velocities[i * 3 + 2] = Math.sin(angle) * speed * 0.3

            lifetimes[i] = Math.random() * 2
            sizes[i] = 0.05 + Math.random() * 0.1

            // Start with white/yellow fire
            colors[i * 3] = 1
            colors[i * 3 + 1] = 0.8 + Math.random() * 0.2
            colors[i * 3 + 2] = 0.2
        }

        return { positions, velocities, lifetimes, sizes, colors }
    }, [particleCount])

    useFrame((state, delta) => {
        if (!particlesRef.current || !isActive) return

        timeRef.current += delta
        const posAttr = particlesRef.current.geometry.attributes.position
        const colorAttr = particlesRef.current.geometry.attributes.color

        for (let i = 0; i < particleCount; i++) {
            // Update lifetime
            lifetimes[i] -= delta

            if (lifetimes[i] <= 0) {
                // Reset particle
                positions[i * 3] = 0
                positions[i * 3 + 1] = 0
                positions[i * 3 + 2] = 0
                lifetimes[i] = 1 + Math.random() * 2

                const angle = Math.random() * Math.PI * 2
                const speed = 0.5 + Math.random() * 1.5
                velocities[i * 3] = Math.cos(angle) * speed * 0.3
                velocities[i * 3 + 1] = speed
                velocities[i * 3 + 2] = Math.sin(angle) * speed * 0.3
            } else {
                // Update position
                positions[i * 3] += velocities[i * 3] * delta
                positions[i * 3 + 1] += velocities[i * 3 + 1] * delta
                positions[i * 3 + 2] += velocities[i * 3 + 2] * delta

                // Apply gravity to y velocity
                velocities[i * 3 + 1] -= 0.5 * delta
            }

            // Update color (white → yellow → orange → red → dark)
            const age = 1 - (lifetimes[i] / 2)
            if (age < 0.2) {
                // White to yellow
                colorAttr.array[i * 3] = 1
                colorAttr.array[i * 3 + 1] = 0.9
                colorAttr.array[i * 3 + 2] = 0.7
            } else if (age < 0.5) {
                // Yellow to orange
                colorAttr.array[i * 3] = 1
                colorAttr.array[i * 3 + 1] = 0.5 + (0.5 - age) * 2
                colorAttr.array[i * 3 + 2] = 0.1
            } else if (age < 0.7) {
                // Orange to red
                colorAttr.array[i * 3] = 1
                colorAttr.array[i * 3 + 1] = (0.7 - age) * 2.5
                colorAttr.array[i * 3 + 2] = 0
            } else {
                // Red to black (smoke)
                colorAttr.array[i * 3] = (1 - age) * 3
                colorAttr.array[i * 3 + 1] = 0
                colorAttr.array[i * 3 + 2] = 0
            }
        }

        posAttr.needsUpdate = true
        colorAttr.needsUpdate = true
    })

    return (
        <points ref={particlesRef} position={position}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={particleCount}
                    array={positions}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-color"
                    count={particleCount}
                    array={new Float32Array(particleCount * 3).fill(1)}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-size"
                    count={particleCount}
                    array={sizes}
                    itemSize={1}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.1}
                vertexColors
                transparent
                opacity={0.8}
                sizeAttenuation
                blending={THREE.AdditiveBlending}
                depthWrite={false}
            />
        </points>
    )
}
