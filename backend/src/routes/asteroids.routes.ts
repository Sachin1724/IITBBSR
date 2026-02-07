import { FastifyInstance } from 'fastify'
import { nasaService } from '../services/nasa.service'
import { Asteroid } from '../models/Asteroid'

export async function asteroidRoutes(fastify: FastifyInstance) {
    // Get all asteroids
    fastify.get('/', async (request, reply) => {
        try {
            const { startDate, endDate } = request.query as any
            const asteroids = await nasaService.fetchNEOs(startDate, endDate)
            return reply.send(asteroids)
        } catch (error: any) {
            return reply.code(500).send({ message: error.message })
        }
    })

    // Get asteroid by ID
    fastify.get('/:id', async (request, reply) => {
        try {
            const { id } = request.params as any
            const asteroid = await nasaService.getAsteroidById(id)
            return reply.send(asteroid)
        } catch (error: any) {
            return reply.code(404).send({ message: error.message })
        }
    })

    // Search asteroids
    fastify.get('/search', async (request, reply) => {
        try {
            const { q } = request.query as any
            if (!q) {
                return reply.code(400).send({ message: 'Query parameter required' })
            }

            const asteroids = await Asteroid.find({
                name: { $regex: q, $options: 'i' },
            }).limit(20)

            return reply.send(asteroids)
        } catch (error) {
            return reply.code(500).send({ message: 'Server error' })
        }
    })
}
