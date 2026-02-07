'use client'

import { Suspense, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import { motion } from 'framer-motion'
import { AlertTriangle, Info } from 'lucide-react'
import ThreeScene from '@/components/ThreeScene'

export default function SimulationPage() {
    const [showDisclaimer, setShowDisclaimer] = useState(true)
    const [selectedScenario, setSelectedScenario] = useState<'orbit' | 'approach' | 'impact'>('orbit')

    return (
        <div className="container mx-auto px-6 py-8 h-screen flex flex-col">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
            >
                <h1 className="text-4xl font-bold text-gradient mb-2 font-[family-name:var(--font-space-grotesk)]">
                    3D Orbital Simulation
                </h1>
                <p className="text-cosmic-lavender/70">
                    Interactive visualization of asteroid trajectories and orbital mechanics
                </p>
            </motion.div>

            {/* Disclaimer */}
            {showDisclaimer && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-card p-4 mb-6 border-yellow-500/30 bg-yellow-500/5"
                >
                    <div className="flex items-start space-x-3">
                        <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <h3 className="text-yellow-400 font-bold mb-1">EDUCATIONAL SIMULATION ONLY</h3>
                            <p className="text-cosmic-lavender/80 text-sm">
                                The impact scenario is purely hypothetical and for educational purposes. All
                                trajectories shown are scientifically accurate based on NASA data, but impact
                                simulations do not represent actual threats.
                            </p>
                        </div>
                        <button
                            onClick={() => setShowDisclaimer(false)}
                            className="text-cosmic-lavender/50 hover:text-cosmic-lavender"
                        >
                            ✕
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Scenario Selector */}
            <div className="flex space-x-4 mb-6">
                <ScenarioButton
                    active={selectedScenario === 'orbit'}
                    onClick={() => setSelectedScenario('orbit')}
                >
                    Orbital View
                </ScenarioButton>
                <ScenarioButton
                    active={selectedScenario === 'approach'}
                    onClick={() => setSelectedScenario('approach')}
                >
                    Close Approach
                </ScenarioButton>
                <ScenarioButton
                    active={selectedScenario === 'impact'}
                    onClick={() => setSelectedScenario('impact')}
                >
                    Impact Simulation
                </ScenarioButton>
            </div>

            {/* 3D Canvas */}
            <div className="flex-1 glass-card overflow-hidden relative">
                <Canvas camera={{ position: [0, 50, 100], fov: 60 }}>
                    <Suspense fallback={null}>
                        <ambientLight intensity={0.3} />
                        <pointLight position={[0, 0, 0]} intensity={2} color="#FDB813" />
                        <Stars radius={300} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                        <ThreeScene scenario={selectedScenario} />
                        <OrbitControls
                            enablePan={true}
                            enableZoom={true}
                            enableRotate={true}
                            minDistance={20}
                            maxDistance={300}
                        />
                    </Suspense>
                </Canvas>

                {/* Controls Info */}
                <div className="absolute bottom-4 left-4 glass-card p-3 text-sm">
                    <div className="flex items-center space-x-2 mb-2">
                        <Info className="w-4 h-4 text-cosmic-lavender" />
                        <span className="text-white font-medium">Controls</span>
                    </div>
                    <ul className="text-cosmic-lavender/70 space-y-1">
                        <li>• Left click + drag: Rotate</li>
                        <li>• Right click + drag: Pan</li>
                        <li>• Scroll: Zoom</li>
                    </ul>
                </div>

                {/* Legend */}
                <div className="absolute top-4 right-4 glass-card p-3 text-sm">
                    <h3 className="text-white font-medium mb-2">Legend</h3>
                    <div className="space-y-2">
                        <LegendItem color="bg-blue-500" label="Earth" />
                        <LegendItem color="bg-yellow-500" label="Sun" />
                        <LegendItem color="bg-gray-400" label="Asteroid" />
                        <LegendItem color="bg-red-500" label="Impact Zone" />
                    </div>
                </div>
            </div>
        </div>
    )
}

function ScenarioButton({
    active,
    onClick,
    children,
}: {
    active: boolean
    onClick: () => void
    children: React.ReactNode
}) {
    return (
        <button
            onClick={onClick}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${active
                    ? 'bg-cosmic-nebula text-white shadow-lg shadow-cosmic-nebula/30'
                    : 'bg-cosmic-dark/60 text-cosmic-lavender hover:bg-cosmic-dark border border-cosmic-nebula/30'
                }`}
        >
            {children}
        </button>
    )
}

function LegendItem({ color, label }: { color: string; label: string }) {
    return (
        <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${color}`} />
            <span className="text-cosmic-lavender/70">{label}</span>
        </div>
    )
}
