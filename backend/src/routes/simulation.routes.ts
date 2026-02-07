import { FastifyInstance } from 'fastify'
import { impactPhysicsService, ImpactSimulationInput } from '../services/impact-physics.service'

export async function simulationRoutes(fastify: FastifyInstance) {
    // Run impact simulation
    fastify.post('/impact', async (request, reply) => {
        try {
            const input = request.body as ImpactSimulationInput

            // Validate input
            if (!input.diameter || input.diameter < 1 || input.diameter > 100000) {
                return reply.code(400).send({
                    message: 'Diameter must be between 1m and 100km',
                })
            }

            if (!input.velocity || input.velocity < 11 || input.velocity > 72) {
                return reply.code(400).send({
                    message: 'Velocity must be between 11 km/s and 72 km/s',
                })
            }

            if (
                !input.approachAngle ||
                input.approachAngle < 0 ||
                input.approachAngle > 90
            ) {
                return reply.code(400).send({
                    message: 'Approach angle must be between 0° and 90°',
                })
            }

            if (!['rocky', 'metallic', 'carbonaceous'].includes(input.composition)) {
                return reply.code(400).send({
                    message: 'Composition must be rocky, metallic, or carbonaceous',
                })
            }

            // Run simulation
            const result = await impactPhysicsService.simulateImpact(input)

            return reply.send({
                success: true,
                data: result,
            })
        } catch (error: any) {
            console.error('Simulation error:', error)
            return reply.code(500).send({
                message: 'Simulation failed',
                error: error.message,
            })
        }
    })

    // Get preset scenarios
    fastify.get('/presets', async (request, reply) => {
        const presets = [
            {
                id: 'chelyabinsk',
                name: 'Chelyabinsk Meteor (2013)',
                description: '20m asteroid that exploded over Russia',
                parameters: {
                    diameter: 20,
                    composition: 'rocky' as const,
                    velocity: 19,
                    approachAngle: 18,
                    impactLocation: { lat: 55.15, lon: 61.41, isOcean: false },
                },
            },
            {
                id: 'tunguska',
                name: 'Tunguska Event (1908)',
                description: '50-60m asteroid airburst over Siberia',
                parameters: {
                    diameter: 55,
                    composition: 'rocky' as const,
                    velocity: 15,
                    approachAngle: 30,
                    impactLocation: { lat: 60.886, lon: 101.894, isOcean: false },
                },
            },
            {
                id: 'chicxulub',
                name: 'Chicxulub Impact (66 MYA)',
                description: '10km asteroid that caused dinosaur extinction',
                parameters: {
                    diameter: 10000,
                    composition: 'rocky' as const,
                    velocity: 20,
                    approachAngle: 60,
                    impactLocation: { lat: 21.3, lon: -89.5, isOcean: true },
                },
            },
            {
                id: 'small_burnup',
                name: 'Small Meteor (Typical)',
                description: '5m asteroid that burns up completely',
                parameters: {
                    diameter: 5,
                    composition: 'rocky' as const,
                    velocity: 17,
                    approachAngle: 45,
                    impactLocation: { lat: 40.7, lon: -74.0, isOcean: false },
                },
            },
            {
                id: 'ocean_impact',
                name: 'Ocean Impact Scenario',
                description: '100m asteroid impacting the Pacific Ocean',
                parameters: {
                    diameter: 100,
                    composition: 'metallic' as const,
                    velocity: 25,
                    approachAngle: 45,
                    impactLocation: { lat: 0, lon: -140, isOcean: true },
                },
            },
        ]

        return reply.send({
            success: true,
            data: presets,
        })
    })

    // Validate simulation parameters
    fastify.post('/validate', async (request, reply) => {
        try {
            const input = request.body as Partial<ImpactSimulationInput>
            const errors: string[] = []

            if (input.diameter !== undefined) {
                if (input.diameter < 1 || input.diameter > 100000) {
                    errors.push('Diameter must be between 1m and 100km')
                }
            }

            if (input.velocity !== undefined) {
                if (input.velocity < 11 || input.velocity > 72) {
                    errors.push('Velocity must be between 11 km/s and 72 km/s')
                }
            }

            if (input.approachAngle !== undefined) {
                if (input.approachAngle < 0 || input.approachAngle > 90) {
                    errors.push('Approach angle must be between 0° and 90°')
                }
            }

            return reply.send({
                valid: errors.length === 0,
                errors,
            })
        } catch (error: any) {
            return reply.code(400).send({
                valid: false,
                errors: ['Invalid input format'],
            })
        }
    })
}
