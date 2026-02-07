import {
    ATMOSPHERE,
    MATERIAL_PROPERTIES,
    calculateMass,
    calculateKineticEnergy,
    calculateDragForce,
    calculateDynamicPressure,
    calculateHeatingRate,
    joulesToMegatons,
    calculateCraterDiameter,
    calculateBlastRadius,
    calculateThermalRadius,
    calculateSeismicMagnitude,
    calculateTsunamiHeight,
    calculateTsunamiRadius,
    BLAST_THRESHOLDS,
} from '../utils/physics-constants'

export interface ImpactSimulationInput {
    diameter: number // meters
    composition: 'rocky' | 'metallic' | 'carbonaceous'
    velocity: number // km/s
    approachAngle: number // degrees from horizontal (0-90)
    impactLocation: {
        lat: number
        lon: number
        isOcean?: boolean
    }
    rotation?: number // rad/s (optional)
}

export interface TrajectoryPoint {
    time: number // seconds
    altitude: number // meters
    velocity: number // m/s
    lat: number
    lon: number
    mass: number // kg (decreases due to ablation)
    temperature?: number // K
}

export interface ImpactEffects {
    craterDiameter?: number // meters
    blastRadius: {
        severe: number // meters
        moderate: number // meters
        light: number // meters
    }
    thermalRadius: number // meters
    seismicMagnitude?: number // Richter scale
    tsunamiRadius?: number // meters
    tsunamiHeight?: number // meters
}

export interface SimulationResult {
    outcome: 'burnup' | 'airburst' | 'land_impact' | 'ocean_impact'
    energyRelease: number // megatons TNT
    impactEnergy: number // joules
    impactVelocity: number // m/s
    impactEffects: ImpactEffects
    trajectory: TrajectoryPoint[]
    fragmentationAltitude?: number // meters
    airburstAltitude?: number // meters
    explanation: string[]
    survivedMass: number // kg
}

export class ImpactPhysicsService {
    /**
     * Main simulation entry point
     */
    async simulateImpact(input: ImpactSimulationInput): Promise<SimulationResult> {
        const { diameter, composition, velocity, approachAngle, impactLocation } = input

        // Calculate initial properties
        const initialMass = calculateMass(diameter, composition)
        const initialVelocity = velocity * 1000 // convert km/s to m/s
        const materialProps = MATERIAL_PROPERTIES[composition]

        // Simulate atmospheric entry
        const { trajectory, finalMass, finalVelocity, fragmentationAlt, airburstAlt } =
            this.simulateAtmosphericEntry(
                diameter,
                initialMass,
                initialVelocity,
                approachAngle,
                materialProps,
                impactLocation
            )

        // Determine outcome
        const outcome = this.determineOutcome(
            finalMass,
            initialMass,
            fragmentationAlt,
            airburstAlt,
            impactLocation.isOcean
        )

        // Calculate impact energy
        const impactEnergy = calculateKineticEnergy(finalMass, finalVelocity)
        const energyMegatons = joulesToMegatons(impactEnergy)

        // Calculate effects based on outcome
        const impactEffects = this.calculateImpactEffects(
            outcome,
            impactEnergy,
            energyMegatons,
            finalMass,
            materialProps.density,
            impactLocation.isOcean
        )

        // Generate explanation
        const explanation = this.generateExplanation(
            outcome,
            diameter,
            composition,
            initialVelocity,
            approachAngle,
            fragmentationAlt,
            airburstAlt,
            energyMegatons
        )

        return {
            outcome,
            energyRelease: energyMegatons,
            impactEnergy,
            impactVelocity: finalVelocity,
            impactEffects,
            trajectory,
            fragmentationAltitude: fragmentationAlt,
            airburstAltitude: airburstAlt,
            explanation,
            survivedMass: finalMass,
        }
    }

    /**
     * Simulate atmospheric entry with drag, heating, and fragmentation
     */
    private simulateAtmosphericEntry(
        diameter: number,
        initialMass: number,
        initialVelocity: number,
        approachAngle: number,
        materialProps: typeof MATERIAL_PROPERTIES[keyof typeof MATERIAL_PROPERTIES],
        location: { lat: number; lon: number }
    ): {
        trajectory: TrajectoryPoint[]
        finalMass: number
        finalVelocity: number
        fragmentationAlt?: number
        airburstAlt?: number
    } {
        const trajectory: TrajectoryPoint[] = []
        const timeStep = 0.1 // seconds
        const angleRad = (approachAngle * Math.PI) / 180

        let altitude = ATMOSPHERE.ENTRY_ALTITUDE
        let velocity = initialVelocity
        let mass = initialMass
        let currentDiameter = diameter
        let time = 0
        let fragmentationAlt: number | undefined
        let airburstAlt: number | undefined

        while (altitude > 0 && velocity > 0) {
            // Calculate forces
            const dragForce = calculateDragForce(
                velocity,
                altitude,
                currentDiameter,
                materialProps.dragCoefficient
            )
            const dynamicPressure = calculateDynamicPressure(velocity, altitude)

            // Check for fragmentation
            if (!fragmentationAlt && dynamicPressure > materialProps.strength) {
                fragmentationAlt = altitude
                // Fragmentation increases effective drag
                currentDiameter *= 1.5
            }

            // Calculate deceleration
            const deceleration = dragForce / mass
            const velocityChange = deceleration * timeStep

            // Calculate ablation (mass loss due to heating)
            const heatingRate = calculateHeatingRate(velocity, altitude, currentDiameter)
            const ablationRate = heatingRate * materialProps.ablationCoefficient * 1e-9
            const massLoss = ablationRate * timeStep

            // Update state
            velocity -= velocityChange
            mass -= massLoss
            altitude -= velocity * Math.sin(angleRad) * timeStep
            time += timeStep

            // Check for airburst (catastrophic fragmentation)
            if (fragmentationAlt && !airburstAlt && mass < initialMass * 0.1) {
                airburstAlt = altitude
                break // Airburst stops the simulation
            }

            // Record trajectory point
            if (trajectory.length % 10 === 0) {
                // Sample every 1 second
                trajectory.push({
                    time,
                    altitude,
                    velocity,
                    lat: location.lat,
                    lon: location.lon,
                    mass,
                })
            }

            // Safety check
            if (time > 300) break // Max 5 minutes simulation
        }

        return {
            trajectory,
            finalMass: mass,
            finalVelocity: velocity,
            fragmentationAlt,
            airburstAlt,
        }
    }

    /**
     * Determine impact outcome based on simulation results
     */
    private determineOutcome(
        finalMass: number,
        initialMass: number,
        fragmentationAlt?: number,
        airburstAlt?: number,
        isOcean?: boolean
    ): SimulationResult['outcome'] {
        const massRatio = finalMass / initialMass

        // Complete burnup
        if (massRatio < 0.01) {
            return 'burnup'
        }

        // Airburst
        if (airburstAlt !== undefined) {
            return 'airburst'
        }

        // Surface impact
        if (isOcean) {
            return 'ocean_impact'
        } else {
            return 'land_impact'
        }
    }

    /**
     * Calculate impact effects based on outcome
     */
    private calculateImpactEffects(
        outcome: SimulationResult['outcome'],
        impactEnergy: number,
        energyMegatons: number,
        mass: number,
        density: number,
        isOcean?: boolean
    ): ImpactEffects {
        const effects: ImpactEffects = {
            blastRadius: {
                severe: calculateBlastRadius(energyMegatons, BLAST_THRESHOLDS.SEVERE),
                moderate: calculateBlastRadius(energyMegatons, BLAST_THRESHOLDS.MODERATE),
                light: calculateBlastRadius(energyMegatons, BLAST_THRESHOLDS.LIGHT),
            },
            thermalRadius: calculateThermalRadius(energyMegatons),
        }

        if (outcome === 'land_impact') {
            effects.craterDiameter = calculateCraterDiameter(impactEnergy, density)
            effects.seismicMagnitude = calculateSeismicMagnitude(impactEnergy)
        }

        if (outcome === 'ocean_impact') {
            const diameter = Math.pow((6 * mass) / (Math.PI * density), 1 / 3)
            effects.tsunamiHeight = calculateTsunamiHeight(impactEnergy, diameter)
            effects.tsunamiRadius = calculateTsunamiRadius(effects.tsunamiHeight!)
            effects.seismicMagnitude = calculateSeismicMagnitude(impactEnergy)
        }

        return effects
    }

    /**
     * Generate human-readable explanation of simulation results
     */
    private generateExplanation(
        outcome: SimulationResult['outcome'],
        diameter: number,
        composition: string,
        velocity: number,
        approachAngle: number,
        fragmentationAlt?: number,
        airburstAlt?: number,
        energyMegatons?: number
    ): string[] {
        const explanation: string[] = []

        explanation.push(
            `A ${diameter}m ${composition} asteroid approaching at ${(velocity / 1000).toFixed(1)} km/s`
        )

        if (fragmentationAlt) {
            explanation.push(
                `Began fragmenting at ${(fragmentationAlt / 1000).toFixed(1)} km altitude due to atmospheric stress`
            )
        }

        switch (outcome) {
            case 'burnup':
                explanation.push(
                    'Object too small to survive atmospheric entry',
                    'Completely ablated and vaporized before reaching the surface',
                    'No significant ground effects expected'
                )
                break

            case 'airburst':
                explanation.push(
                    `Exploded in an airburst at ${(airburstAlt! / 1000).toFixed(1)} km altitude`,
                    `Released approximately ${energyMegatons!.toFixed(2)} megatons of energy`,
                    'Similar to the Tunguska (1908) or Chelyabinsk (2013) events',
                    'Shockwave and thermal effects at ground level'
                )
                break

            case 'land_impact':
                explanation.push(
                    'Survived atmospheric entry and impacted the ground',
                    `Released ${energyMegatons!.toFixed(2)} megatons of energy on impact`,
                    'Created crater, blast wave, thermal radiation, and seismic effects',
                    `Approach angle of ${approachAngle}° affected impact efficiency`
                )
                break

            case 'ocean_impact':
                explanation.push(
                    'Impacted ocean surface',
                    `Released ${energyMegatons!.toFixed(2)} megatons of energy`,
                    'Generated tsunami waves and steam explosion',
                    'Coastal areas at risk from wave propagation'
                )
                break
        }

        explanation.push(
            '⚠️ This is a simplified educational model. Real impacts involve complex physics not fully captured here.'
        )

        return explanation
    }
}

export const impactPhysicsService = new ImpactPhysicsService()
