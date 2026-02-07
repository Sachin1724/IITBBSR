'use client'

import { useState, useEffect, useRef } from 'react'
import { SimulationScene } from '@/components/simulation/SimulationScene'
import { SimulationControls, SimulationParams } from '@/components/simulation/SimulationControls'
import { ResultsDashboard } from '@/components/simulation/ResultsDashboard'
import { TimeControls } from '@/components/simulation/TimeControls'

interface SimulationResult {
    outcome: 'burnup' | 'airburst' | 'land_impact' | 'ocean_impact'
    energyRelease: number
    impactEnergy: number
    impactVelocity: number
    impactEffects: any
    trajectory: any[]
    fragmentationAltitude?: number
    airburstAltitude?: number
    explanation: string[]
    survivedMass: number
}

interface Preset {
    id: string
    name: string
    description: string
    parameters: SimulationParams
}

export default function ImpactSimulationPage() {
    const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null)
    const [presets, setPresets] = useState<Preset[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isAnimating, setIsAnimating] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [timeScale, setTimeScale] = useState(1)
    const [asteroidName, setAsteroidName] = useState<string>('')
    const [currentParams, setCurrentParams] = useState<SimulationParams>({
        diameter: 20,
        composition: 'rocky',
        velocity: 19,
        approachAngle: 45,
        impactLocation: { lat: 40, lon: -74, isOcean: false },
    })

    const animationRef = useRef<number>()
    const lastTimeRef = useRef<number>(0)

    // Load presets on mount
    useEffect(() => {
        fetchPresets()

        // Check for URL parameters
        const params = new URLSearchParams(window.location.search)
        const diameter = params.get('diameter')
        const velocity = params.get('velocity')
        const composition = params.get('composition')
        const angle = params.get('angle')
        const name = params.get('name')

        if (diameter || velocity || composition) {
            const newParams: SimulationParams = {
                diameter: diameter ? parseFloat(diameter) * 1000 : 20, // Convert km to meters
                composition: (composition as any) || 'rocky',
                velocity: velocity ? parseFloat(velocity) : 19,
                approachAngle: angle ? parseFloat(angle) : 45,
                impactLocation: { lat: 40, lon: -74, isOcean: false },
            }
            setCurrentParams(newParams)
            if (name) setAsteroidName(decodeURIComponent(name))
        }
    }, [])

    // Animation loop
    useEffect(() => {
        if (!isAnimating || !simulationResult) return

        const maxTime = simulationResult.trajectory[simulationResult.trajectory.length - 1]?.time || 0

        const animate = (timestamp: number) => {
            if (!lastTimeRef.current) lastTimeRef.current = timestamp

            const deltaTime = (timestamp - lastTimeRef.current) / 1000 // Convert to seconds
            lastTimeRef.current = timestamp

            setCurrentTime((prev) => {
                const newTime = prev + deltaTime * timeScale
                if (newTime >= maxTime + 5) {
                    // Add 5 seconds to show impact effects
                    setIsAnimating(false)
                    return maxTime + 5
                }
                return newTime
            })

            animationRef.current = requestAnimationFrame(animate)
        }

        animationRef.current = requestAnimationFrame(animate)

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current)
            }
        }
    }, [isAnimating, timeScale, simulationResult])

    const fetchPresets = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
            const response = await fetch(`${apiUrl}/api/simulation/presets`)
            const data = await response.json()
            if (data.success) {
                setPresets(data.data)
            }
        } catch (error) {
            console.error('Failed to fetch presets:', error)
        }
    }

    const runSimulation = async (params: SimulationParams) => {
        setIsLoading(true)
        setSimulationResult(null) // Clear previous result

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
            const response = await fetch(`${apiUrl}/api/simulation/impact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(params),
            })

            const data = await response.json()

            if (data.success) {
                setSimulationResult(data.data)
                setCurrentTime(0)
                setIsAnimating(true)
                lastTimeRef.current = 0
            } else {
                alert('Simulation failed: ' + data.message)
            }
        } catch (error) {
            console.error('Simulation error:', error)
            alert('Failed to run simulation')
        } finally {
            setIsLoading(false)
        }
    }

    const loadPreset = (presetId: string) => {
        const preset = presets.find((p) => p.id === presetId)
        if (preset) {
            runSimulation(preset.parameters)
        }
    }

    const handlePlayPause = () => {
        setIsAnimating(!isAnimating)
        if (!isAnimating) {
            lastTimeRef.current = 0
        }
    }

    const handleReset = () => {
        setCurrentTime(0)
        setIsAnimating(false)
        lastTimeRef.current = 0
    }

    const maxTime = simulationResult?.trajectory[simulationResult.trajectory.length - 1]?.time || 100

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#070F2B] to-[#1B1A55] p-6">
            <div className="max-w-[1800px] mx-auto space-y-6">
                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-bold text-[#9290C3]">
                        Physics-Based Impact Simulation
                    </h1>
                    <p className="text-[#9290C3]/60">
                        Realistic asteroid impact modeling with atmospheric entry and effects
                    </p>
                </div>

                {/* Main Layout */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {/* Left Panel - Controls */}
                    <div className="xl:col-span-1 space-y-6">
                        <SimulationControls
                            onSimulate={runSimulation}
                            onLoadPreset={loadPreset}
                            presets={presets}
                            isLoading={isLoading}
                        />
                    </div>

                    {/* Center - 3D Visualization */}
                    <div className="xl:col-span-1 space-y-4">
                        <div className="relative h-[600px] rounded-xl overflow-hidden border border-[#535C91]/30">
                            <SimulationScene
                                simulationResult={simulationResult}
                                isAnimating={isAnimating}
                                currentTime={currentTime}
                                impactLocation={currentParams.impactLocation}
                                asteroidParams={{
                                    diameter: currentParams.diameter,
                                    composition: currentParams.composition,
                                }}
                            />
                        </div>

                        {/* Time Controls */}
                        {simulationResult && (
                            <TimeControls
                                isPlaying={isAnimating}
                                currentTime={currentTime}
                                maxTime={maxTime}
                                timeScale={timeScale}
                                onPlayPause={handlePlayPause}
                                onReset={handleReset}
                                onTimeChange={setCurrentTime}
                                onTimeScaleChange={setTimeScale}
                            />
                        )}
                    </div>

                    {/* Right Panel - Results */}
                    <div className="xl:col-span-1">
                        <ResultsDashboard result={simulationResult} />
                    </div>
                </div>
            </div>
        </div>
    )
}
