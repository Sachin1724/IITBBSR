/**
 * Physics constants and models for asteroid impact simulation
 */

// Earth properties
export const EARTH = {
    RADIUS: 6371000, // meters
    MASS: 5.972e24, // kg
    SURFACE_GRAVITY: 9.81, // m/s²
    GRAVITATIONAL_CONSTANT: 6.674e-11, // N⋅m²/kg²
} as const

// Atmospheric model (simplified exponential)
export const ATMOSPHERE = {
    SEA_LEVEL_DENSITY: 1.225, // kg/m³
    SCALE_HEIGHT: 8500, // meters
    ENTRY_ALTITUDE: 120000, // meters (Kármán line)
} as const

// Material properties by composition type
export const MATERIAL_PROPERTIES = {
    rocky: {
        density: 2500, // kg/m³ (S-type asteroids)
        strength: 1e7, // Pa (tensile strength)
        dragCoefficient: 0.47,
        ablationCoefficient: 0.1,
    },
    metallic: {
        density: 7500, // kg/m³ (M-type asteroids)
        strength: 5e8, // Pa
        dragCoefficient: 0.47,
        ablationCoefficient: 0.05,
    },
    carbonaceous: {
        density: 1500, // kg/m³ (C-type asteroids)
        strength: 5e6, // Pa
        dragCoefficient: 0.47,
        ablationCoefficient: 0.15,
    },
} as const

// Impact effects scaling
export const IMPACT_SCALING = {
    TNT_JOULES: 4.184e9, // 1 ton TNT in joules
    CRATER_COEFFICIENT: 1.8,
    CRATER_EXPONENT: 0.22,
    TARGET_DENSITY: 2500, // kg/m³ (typical rock)
} as const

// Blast overpressure thresholds (psi)
export const BLAST_THRESHOLDS = {
    SEVERE: 20, // Complete destruction
    MODERATE: 5, // Severe structural damage
    LIGHT: 1, // Window breakage
} as const

/**
 * Calculate atmospheric density at given altitude
 * Uses exponential atmosphere model
 */
export function getAtmosphericDensity(altitude: number): number {
    if (altitude < 0) return ATMOSPHERE.SEA_LEVEL_DENSITY
    return ATMOSPHERE.SEA_LEVEL_DENSITY * Math.exp(-altitude / ATMOSPHERE.SCALE_HEIGHT)
}

/**
 * Calculate drag force on asteroid
 * F_drag = 0.5 * ρ * v² * C_d * A
 */
export function calculateDragForce(
    velocity: number,
    altitude: number,
    diameter: number,
    dragCoefficient: number
): number {
    const density = getAtmosphericDensity(altitude)
    const area = Math.PI * (diameter / 2) ** 2
    return 0.5 * density * velocity ** 2 * dragCoefficient * area
}

/**
 * Calculate heating rate (watts)
 * Q = 0.5 * ρ * v³ * A
 */
export function calculateHeatingRate(
    velocity: number,
    altitude: number,
    diameter: number
): number {
    const density = getAtmosphericDensity(altitude)
    const area = Math.PI * (diameter / 2) ** 2
    return 0.5 * density * velocity ** 3 * area
}

/**
 * Calculate dynamic pressure
 * P = 0.5 * ρ * v²
 */
export function calculateDynamicPressure(velocity: number, altitude: number): number {
    const density = getAtmosphericDensity(altitude)
    return 0.5 * density * velocity ** 2
}

/**
 * Calculate mass from diameter and composition
 */
export function calculateMass(diameter: number, composition: keyof typeof MATERIAL_PROPERTIES): number {
    const volume = (4 / 3) * Math.PI * (diameter / 2) ** 3
    return volume * MATERIAL_PROPERTIES[composition].density
}

/**
 * Calculate kinetic energy
 * KE = 0.5 * m * v²
 */
export function calculateKineticEnergy(mass: number, velocity: number): number {
    return 0.5 * mass * velocity ** 2
}

/**
 * Convert joules to megatons TNT
 */
export function joulesToMegatons(joules: number): number {
    return joules / (IMPACT_SCALING.TNT_JOULES * 1e6)
}

/**
 * Calculate crater diameter (meters)
 * Based on scaling laws from impact physics
 * D = 1.8 * (E/ρ)^0.22 * (ρ_target)^-0.33
 */
export function calculateCraterDiameter(energy: number, impactorDensity: number): number {
    const coefficient = IMPACT_SCALING.CRATER_COEFFICIENT
    const exponent = IMPACT_SCALING.CRATER_EXPONENT
    const targetDensity = IMPACT_SCALING.TARGET_DENSITY

    return (
        coefficient *
        Math.pow(energy / impactorDensity, exponent) *
        Math.pow(targetDensity, -0.33)
    )
}

/**
 * Calculate blast radius for given overpressure
 * Based on TNT blast scaling
 */
export function calculateBlastRadius(energyMegatons: number, overpressure: number): number {
    // Empirical formula: R = C * (E^(1/3)) / P^(1/2)
    // Where C is a scaling constant
    const scalingConstant = 1000 // meters per megaton^(1/3) per psi^(-1/2)
    return scalingConstant * Math.pow(energyMegatons, 1 / 3) / Math.sqrt(overpressure)
}

/**
 * Calculate thermal radiation radius
 * Based on fireball scaling
 */
export function calculateThermalRadius(energyMegatons: number): number {
    // Fireball radius scales as E^(1/3)
    const fireballRadius = 440 * Math.pow(energyMegatons, 1 / 3) // meters
    // Thermal effects extend ~3x fireball radius for 3rd degree burns
    return fireballRadius * 3
}

/**
 * Estimate seismic magnitude (Richter scale)
 * Based on energy-magnitude relationship
 */
export function calculateSeismicMagnitude(energyJoules: number): number {
    // log10(E) = 1.5M + 4.8
    // M = (log10(E) - 4.8) / 1.5
    return (Math.log10(energyJoules) - 4.8) / 1.5
}

/**
 * Calculate tsunami wave height for ocean impact
 * Simplified model based on impact energy and water depth
 */
export function calculateTsunamiHeight(
    energyJoules: number,
    diameter: number,
    waterDepth: number = 4000 // average ocean depth in meters
): number {
    // Simplified: wave height ~ (energy)^(1/4) / depth^(1/2)
    const baseHeight = Math.pow(energyJoules / 1e15, 0.25)
    const depthFactor = Math.sqrt(4000 / waterDepth)
    return baseHeight * depthFactor
}

/**
 * Calculate tsunami propagation radius
 */
export function calculateTsunamiRadius(waveHeight: number): number {
    // Tsunamis can travel thousands of km
    // Radius scales with wave height
    return waveHeight * 1000 * 100 // meters
}
