import { describe, it, expect } from '@jest/globals'
import { impactPhysicsService } from '../services/impact-physics.service'
import {
    calculateMass,
    calculateKineticEnergy,
    joulesToMegatons,
    calculateCraterDiameter,
    getAtmosphericDensity,
} from '../utils/physics-constants'

describe('Impact Physics Service', () => {
    describe('Mass Calculation', () => {
        it('should calculate mass correctly for rocky asteroid', () => {
            const diameter = 20 // meters
            const mass = calculateMass(diameter, 'rocky')
            // Volume = (4/3) * π * r³ = (4/3) * π * 10³ ≈ 4188.79 m³
            // Mass = 4188.79 * 2500 ≈ 10,471,975 kg
            expect(mass).toBeCloseTo(10471975, -3)
        })

        it('should calculate different masses for different compositions', () => {
            const diameter = 10
            const rockyMass = calculateMass(diameter, 'rocky')
            const metallicMass = calculateMass(diameter, 'metallic')
            const carbonaceousMass = calculateMass(diameter, 'carbonaceous')

            expect(metallicMass).toBeGreaterThan(rockyMass)
            expect(rockyMass).toBeGreaterThan(carbonaceousMass)
        })
    })

    describe('Energy Calculations', () => {
        it('should calculate kinetic energy correctly', () => {
            const mass = 1000 // kg
            const velocity = 20000 // m/s
            const energy = calculateKineticEnergy(mass, velocity)
            // KE = 0.5 * 1000 * 20000² = 2 × 10¹¹ J
            expect(energy).toBe(2e11)
        })

        it('should convert joules to megatons correctly', () => {
            const joules = 4.184e15 // 1 megaton TNT
            const megatons = joulesToMegatons(joules)
            expect(megatons).toBeCloseTo(1, 2)
        })
    })

    describe('Atmospheric Model', () => {
        it('should return sea level density at altitude 0', () => {
            const density = getAtmosphericDensity(0)
            expect(density).toBeCloseTo(1.225, 3)
        })

        it('should decrease density with altitude', () => {
            const density0 = getAtmosphericDensity(0)
            const density10km = getAtmosphericDensity(10000)
            const density50km = getAtmosphericDensity(50000)

            expect(density10km).toBeLessThan(density0)
            expect(density50km).toBeLessThan(density10km)
        })
    })

    describe('Impact Simulation', () => {
        it('should simulate small asteroid burnup', async () => {
            const result = await impactPhysicsService.simulateImpact({
                diameter: 5,
                composition: 'rocky',
                velocity: 17,
                approachAngle: 45,
                impactLocation: { lat: 40, lon: -74, isOcean: false },
            })

            expect(result.outcome).toBe('burnup')
            expect(result.trajectory.length).toBeGreaterThan(0)
        })

        it('should simulate Chelyabinsk-like airburst', async () => {
            const result = await impactPhysicsService.simulateImpact({
                diameter: 20,
                composition: 'rocky',
                velocity: 19,
                approachAngle: 18,
                impactLocation: { lat: 55.15, lon: 61.41, isOcean: false },
            })

            expect(result.outcome).toBe('airburst')
            expect(result.fragmentationAltitude).toBeDefined()
            expect(result.airburstAltitude).toBeDefined()
            expect(result.energyRelease).toBeGreaterThan(0)
        })

        it('should simulate large land impact', async () => {
            const result = await impactPhysicsService.simulateImpact({
                diameter: 100,
                composition: 'rocky',
                velocity: 20,
                approachAngle: 60,
                impactLocation: { lat: 0, lon: 0, isOcean: false },
            })

            expect(result.outcome).toBe('land_impact')
            expect(result.impactEffects.craterDiameter).toBeDefined()
            expect(result.impactEffects.seismicMagnitude).toBeDefined()
            expect(result.impactEffects.blastRadius.severe).toBeGreaterThan(0)
        })

        it('should simulate ocean impact with tsunami', async () => {
            const result = await impactPhysicsService.simulateImpact({
                diameter: 100,
                composition: 'metallic',
                velocity: 25,
                approachAngle: 45,
                impactLocation: { lat: 0, lon: -140, isOcean: true },
            })

            expect(result.outcome).toBe('ocean_impact')
            expect(result.impactEffects.tsunamiHeight).toBeDefined()
            expect(result.impactEffects.tsunamiRadius).toBeDefined()
        })

        it('should generate explanation for all outcomes', async () => {
            const result = await impactPhysicsService.simulateImpact({
                diameter: 20,
                composition: 'rocky',
                velocity: 19,
                approachAngle: 18,
                impactLocation: { lat: 55, lon: 61, isOcean: false },
            })

            expect(result.explanation).toBeDefined()
            expect(result.explanation.length).toBeGreaterThan(0)
            expect(result.explanation.some((e) => e.includes('educational'))).toBe(true)
        })
    })

    describe('Crater Calculations', () => {
        it('should calculate realistic crater diameter', () => {
            // 1 megaton impact
            const energy = 4.184e15 // joules
            const density = 2500 // kg/m³
            const craterDiameter = calculateCraterDiameter(energy, density)

            // Should be in reasonable range (hundreds of meters)
            expect(craterDiameter).toBeGreaterThan(100)
            expect(craterDiameter).toBeLessThan(10000)
        })
    })
})
