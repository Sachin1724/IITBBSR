'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import { EarthModel } from './EarthModel'
import { AsteroidTrajectory } from './AsteroidTrajectory'
import { ImpactVisualization } from './ImpactVisualization'

interface SimulationResult {
    outcome: 'burnup' | 'airburst' | 'land_impact' | 'ocean_impact'
    energyRelease: number
    impactEffects: any
    trajectory: any[]
    fragmentationAltitude?: number
    airburstAltitude?: number
}

interface SimulationSceneProps {
    simulationResult: SimulationResult | null
    isAnimating: boolean
    currentTime: number
    impactLocation: { lat: number; lon: number }
    asteroidParams: {
        diameter: number
        composition: 'rocky' | 'metallic' | 'carbonaceous'
    }
}

export function SimulationScene({
    simulationResult,
    isAnimating,
    currentTime,
    impactLocation,
    asteroidParams,
}: SimulationSceneProps) {
    return (
        <div className="w-full h-full bg-gradient-to-b from-[#070F2B] to-[#1B1A55]">
            <Canvas
                camera={{ position: [0, 0, 15], fov: 50 }}
                gl={{ antialias: true, alpha: true }}
            >
                {/* Background stars */}
                <Stars radius={100} depth={50} count={5000} factor={4} fade speed={1} />

                {/* Earth */}
                <EarthModel radius={5} />

                {/* Asteroid trajectory */}
                {simulationResult && simulationResult.trajectory.length > 0 && (
                    <AsteroidTrajectory
                        trajectory={simulationResult.trajectory}
                        diameter={asteroidParams.diameter}
                        composition={asteroidParams.composition}
                        isAnimating={isAnimating}
                        currentTime={currentTime}
                        earthRadius={5}
                    />
                )}

                {/* Impact visualization */}
                {simulationResult && (
                    <ImpactVisualization
                        impactLocation={impactLocation}
                        effects={simulationResult.impactEffects}
                        outcome={simulationResult.outcome}
                        isVisible={isAnimating && currentTime > (simulationResult.trajectory[simulationResult.trajectory.length - 1]?.time || 0)}
                        earthRadius={5}
                    />
                )}

                {/* Camera controls */}
                <OrbitControls
                    enablePan={true}
                    enableZoom={true}
                    enableRotate={true}
                    minDistance={8}
                    maxDistance={30}
                />
            </Canvas>

            {/* Educational disclaimer overlay */}
            <div className="absolute bottom-4 left-4 right-4 bg-black/50 backdrop-blur-sm border border-yellow-500/30 rounded-lg p-3">
                <p className="text-yellow-400 text-xs flex items-center gap-2">
                    <span className="text-lg">⚠️</span>
                    <span>
                        <strong>EDUCATIONAL SIMULATION ONLY:</strong> This is a simplified physics model for educational purposes. Real asteroid impacts involve complex variables not fully captured here. Results are hypothetical approximations based on known physics, not predictions.
                    </span>
                </p>
            </div>
        </div>
    )
}

