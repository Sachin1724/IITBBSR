'use client'

import { useState } from 'react'

interface SimulationControlsProps {
    onSimulate: (params: SimulationParams) => void
    onLoadPreset: (presetId: string) => void
    presets: any[]
    isLoading: boolean
}

export interface SimulationParams {
    diameter: number
    composition: 'rocky' | 'metallic' | 'carbonaceous'
    velocity: number
    approachAngle: number
    impactLocation: {
        lat: number
        lon: number
        isOcean: boolean
    }
}

export function SimulationControls({
    onSimulate,
    onLoadPreset,
    presets,
    isLoading,
}: SimulationControlsProps) {
    const [params, setParams] = useState<SimulationParams>({
        diameter: 20,
        composition: 'rocky',
        velocity: 19,
        approachAngle: 45,
        impactLocation: { lat: 40, lon: -74, isOcean: false },
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSimulate(params)
    }

    return (
        <div className="bg-[#1B1A55]/80 backdrop-blur-md border border-[#535C91]/30 rounded-xl p-6 space-y-6">
            <h2 className="text-2xl font-bold text-[#9290C3]">Simulation Parameters</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Diameter */}
                <div>
                    <label className="block text-sm font-medium text-[#9290C3] mb-2">
                        Asteroid Diameter: {params.diameter}m
                    </label>
                    <input
                        type="range"
                        min="1"
                        max="10000"
                        step="1"
                        value={params.diameter}
                        onChange={(e) =>
                            setParams({ ...params, diameter: Number(e.target.value) })
                        }
                        className="w-full h-2 bg-[#535C91]/30 rounded-lg appearance-none cursor-pointer accent-[#9290C3]"
                    />
                    <div className="flex justify-between text-xs text-[#9290C3]/60 mt-1">
                        <span>1m</span>
                        <span>10km</span>
                    </div>
                </div>

                {/* Composition */}
                <div>
                    <label className="block text-sm font-medium text-[#9290C3] mb-2">
                        Composition
                    </label>
                    <select
                        value={params.composition}
                        onChange={(e) =>
                            setParams({
                                ...params,
                                composition: e.target.value as any,
                            })
                        }
                        className="w-full bg-[#070F2B] border border-[#535C91]/30 rounded-lg px-4 py-2 text-[#9290C3] focus:outline-none focus:border-[#9290C3]"
                    >
                        <option value="rocky">Rocky (S-type) - 2,500 kg/m³</option>
                        <option value="metallic">Metallic (M-type) - 7,500 kg/m³</option>
                        <option value="carbonaceous">
                            Carbonaceous (C-type) - 1,500 kg/m³
                        </option>
                    </select>
                </div>

                {/* Velocity */}
                <div>
                    <label className="block text-sm font-medium text-[#9290C3] mb-2">
                        Velocity: {params.velocity} km/s
                    </label>
                    <input
                        type="range"
                        min="11"
                        max="72"
                        step="0.1"
                        value={params.velocity}
                        onChange={(e) =>
                            setParams({ ...params, velocity: Number(e.target.value) })
                        }
                        className="w-full h-2 bg-[#535C91]/30 rounded-lg appearance-none cursor-pointer accent-[#9290C3]"
                    />
                    <div className="flex justify-between text-xs text-[#9290C3]/60 mt-1">
                        <span>11 km/s (min)</span>
                        <span>72 km/s (max)</span>
                    </div>
                </div>

                {/* Approach Angle */}
                <div>
                    <label className="block text-sm font-medium text-[#9290C3] mb-2">
                        Approach Angle: {params.approachAngle}°
                    </label>
                    <input
                        type="range"
                        min="0"
                        max="90"
                        step="1"
                        value={params.approachAngle}
                        onChange={(e) =>
                            setParams({ ...params, approachAngle: Number(e.target.value) })
                        }
                        className="w-full h-2 bg-[#535C91]/30 rounded-lg appearance-none cursor-pointer accent-[#9290C3]"
                    />
                    <div className="flex justify-between text-xs text-[#9290C3]/60 mt-1">
                        <span>0° (horizontal)</span>
                        <span>90° (vertical)</span>
                    </div>
                </div>

                {/* Impact Location */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-[#9290C3] mb-2">
                            Latitude
                        </label>
                        <input
                            type="number"
                            min="-90"
                            max="90"
                            step="0.1"
                            value={params.impactLocation.lat}
                            onChange={(e) =>
                                setParams({
                                    ...params,
                                    impactLocation: {
                                        ...params.impactLocation,
                                        lat: Number(e.target.value),
                                    },
                                })
                            }
                            className="w-full bg-[#070F2B] border border-[#535C91]/30 rounded-lg px-4 py-2 text-[#9290C3] focus:outline-none focus:border-[#9290C3]"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[#9290C3] mb-2">
                            Longitude
                        </label>
                        <input
                            type="number"
                            min="-180"
                            max="180"
                            step="0.1"
                            value={params.impactLocation.lon}
                            onChange={(e) =>
                                setParams({
                                    ...params,
                                    impactLocation: {
                                        ...params.impactLocation,
                                        lon: Number(e.target.value),
                                    },
                                })
                            }
                            className="w-full bg-[#070F2B] border border-[#535C91]/30 rounded-lg px-4 py-2 text-[#9290C3] focus:outline-none focus:border-[#9290C3]"
                        />
                    </div>
                </div>

                {/* Ocean/Land toggle */}
                <div className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        id="isOcean"
                        checked={params.impactLocation.isOcean}
                        onChange={(e) =>
                            setParams({
                                ...params,
                                impactLocation: {
                                    ...params.impactLocation,
                                    isOcean: e.target.checked,
                                },
                            })
                        }
                        className="w-4 h-4 accent-[#9290C3]"
                    />
                    <label htmlFor="isOcean" className="text-sm text-[#9290C3]">
                        Ocean Impact
                    </label>
                </div>

                {/* Run Simulation Button */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-[#535C91] to-[#9290C3] hover:from-[#9290C3] hover:to-[#535C91] text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Simulating...' : 'Run Simulation'}
                </button>
            </form>

            {/* Preset Scenarios */}
            <div className="border-t border-[#535C91]/30 pt-6">
                <h3 className="text-lg font-semibold text-[#9290C3] mb-3">Preset Scenarios</h3>
                <div className="space-y-2">
                    {presets.map((preset) => (
                        <button
                            key={preset.id}
                            onClick={() => onLoadPreset(preset.id)}
                            disabled={isLoading}
                            className="w-full text-left bg-[#070F2B]/50 hover:bg-[#070F2B] border border-[#535C91]/20 hover:border-[#9290C3]/50 rounded-lg p-3 transition-all duration-200 disabled:opacity-50"
                        >
                            <div className="font-medium text-[#9290C3]">{preset.name}</div>
                            <div className="text-xs text-[#9290C3]/60 mt-1">
                                {preset.description}
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}
