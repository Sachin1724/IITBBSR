'use client'

interface SimulationResult {
    outcome: 'burnup' | 'airburst' | 'land_impact' | 'ocean_impact'
    energyRelease: number
    impactEnergy: number
    impactVelocity: number
    impactEffects: {
        craterDiameter?: number
        blastRadius: {
            severe: number
            moderate: number
            light: number
        }
        thermalRadius: number
        seismicMagnitude?: number
        tsunamiRadius?: number
        tsunamiHeight?: number
    }
    fragmentationAltitude?: number
    airburstAltitude?: number
    explanation: string[]
    survivedMass: number
}

interface ResultsDashboardProps {
    result: SimulationResult | null
}

export function ResultsDashboard({ result }: ResultsDashboardProps) {
    if (!result) {
        return (
            <div className="bg-[#1B1A55]/80 backdrop-blur-md border border-[#535C91]/30 rounded-xl p-6">
                <p className="text-[#9290C3]/60 text-center">
                    Run a simulation to see results
                </p>
            </div>
        )
    }

    const getOutcomeColor = () => {
        switch (result.outcome) {
            case 'burnup':
                return 'text-green-400'
            case 'airburst':
                return 'text-yellow-400'
            case 'land_impact':
                return 'text-red-400'
            case 'ocean_impact':
                return 'text-blue-400'
        }
    }

    const getOutcomeLabel = () => {
        switch (result.outcome) {
            case 'burnup':
                return 'Complete Burnup'
            case 'airburst':
                return 'Airburst'
            case 'land_impact':
                return 'Land Impact'
            case 'ocean_impact':
                return 'Ocean Impact'
        }
    }

    return (
        <div className="bg-[#1B1A55]/80 backdrop-blur-md border border-[#535C91]/30 rounded-xl p-6 space-y-6">
            <h2 className="text-2xl font-bold text-[#9290C3]">Simulation Results</h2>

            {/* Outcome */}
            <div className="bg-[#070F2B]/50 rounded-lg p-4">
                <div className="text-sm text-[#9290C3]/60 mb-1">Outcome</div>
                <div className={`text-2xl font-bold ${getOutcomeColor()}`}>
                    {getOutcomeLabel()}
                </div>
            </div>

            {/* Energy Release */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#070F2B]/50 rounded-lg p-4">
                    <div className="text-sm text-[#9290C3]/60 mb-1">Energy Release</div>
                    <div className="text-xl font-bold text-[#9290C3]">
                        {result.energyRelease.toFixed(2)} MT
                    </div>
                    <div className="text-xs text-[#9290C3]/40 mt-1">megatons TNT</div>
                </div>

                <div className="bg-[#070F2B]/50 rounded-lg p-4">
                    <div className="text-sm text-[#9290C3]/60 mb-1">Impact Velocity</div>
                    <div className="text-xl font-bold text-[#9290C3]">
                        {(result.impactVelocity / 1000).toFixed(1)} km/s
                    </div>
                </div>
            </div>

            {/* Effect Zones */}
            {result.outcome !== 'burnup' && (
                <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-[#9290C3]">Effect Zones</h3>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                            <span className="text-sm text-red-400">Severe Damage</span>
                            <span className="font-semibold text-red-400">
                                {(result.impactEffects.blastRadius.severe / 1000).toFixed(1)} km
                            </span>
                        </div>

                        <div className="flex items-center justify-between bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
                            <span className="text-sm text-orange-400">Moderate Damage</span>
                            <span className="font-semibold text-orange-400">
                                {(result.impactEffects.blastRadius.moderate / 1000).toFixed(1)} km
                            </span>
                        </div>

                        <div className="flex items-center justify-between bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                            <span className="text-sm text-yellow-400">Light Damage</span>
                            <span className="font-semibold text-yellow-400">
                                {(result.impactEffects.blastRadius.light / 1000).toFixed(1)} km
                            </span>
                        </div>

                        <div className="flex items-center justify-between bg-white/10 border border-white/30 rounded-lg p-3">
                            <span className="text-sm text-white">Thermal Radiation</span>
                            <span className="font-semibold text-white">
                                {(result.impactEffects.thermalRadius / 1000).toFixed(1)} km
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Land Impact Specific */}
            {result.outcome === 'land_impact' && (
                <div className="grid grid-cols-2 gap-4">
                    {result.impactEffects.craterDiameter && (
                        <div className="bg-[#070F2B]/50 rounded-lg p-4">
                            <div className="text-sm text-[#9290C3]/60 mb-1">Crater Diameter</div>
                            <div className="text-xl font-bold text-[#9290C3]">
                                {(result.impactEffects.craterDiameter / 1000).toFixed(2)} km
                            </div>
                        </div>
                    )}

                    {result.impactEffects.seismicMagnitude && (
                        <div className="bg-[#070F2B]/50 rounded-lg p-4">
                            <div className="text-sm text-[#9290C3]/60 mb-1">
                                Seismic Magnitude
                            </div>
                            <div className="text-xl font-bold text-[#9290C3]">
                                {result.impactEffects.seismicMagnitude.toFixed(1)}
                            </div>
                            <div className="text-xs text-[#9290C3]/40 mt-1">Richter scale</div>
                        </div>
                    )}
                </div>
            )}

            {/* Ocean Impact Specific */}
            {result.outcome === 'ocean_impact' && (
                <div className="grid grid-cols-2 gap-4">
                    {result.impactEffects.tsunamiHeight && (
                        <div className="bg-[#070F2B]/50 rounded-lg p-4">
                            <div className="text-sm text-[#9290C3]/60 mb-1">Tsunami Height</div>
                            <div className="text-xl font-bold text-blue-400">
                                {result.impactEffects.tsunamiHeight.toFixed(1)} m
                            </div>
                        </div>
                    )}

                    {result.impactEffects.tsunamiRadius && (
                        <div className="bg-[#070F2B]/50 rounded-lg p-4">
                            <div className="text-sm text-[#9290C3]/60 mb-1">
                                Tsunami Propagation
                            </div>
                            <div className="text-xl font-bold text-blue-400">
                                {(result.impactEffects.tsunamiRadius / 1000).toFixed(0)} km
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Explanation */}
            <div className="border-t border-[#535C91]/30 pt-4">
                <h3 className="text-lg font-semibold text-[#9290C3] mb-3">Physics Explanation</h3>
                <div className="space-y-2">
                    {result.explanation.map((line, index) => (
                        <p
                            key={index}
                            className={`text-sm ${line.includes('⚠️')
                                    ? 'text-yellow-400 font-medium'
                                    : 'text-[#9290C3]/80'
                                }`}
                        >
                            {line}
                        </p>
                    ))}
                </div>
            </div>
        </div>
    )
}

