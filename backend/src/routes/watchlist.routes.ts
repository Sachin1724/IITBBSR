import { FastifyInstance } from 'fastify'
import { Watchlist } from '../models/Watchlist'
import { z } from 'zod'

const addWatchlistSchema = z.object({
    asteroidId: z.string(),
})

export async function watchlistRoutes(fastify: FastifyInstance) {
    // Get user's watchlist
    fastify.get('/', {
        onRequest: [fastify.authenticate],
    }, async (request: any, reply) => {
        try {
            const watchlist = await Watchlist.find({ userId: request.user.id })
            return reply.send(watchlist)
        } catch (error) {
            return reply.code(500).send({ message: 'Server error' })
        }
    })

    // Add to watchlist
    fastify.post('/', {
        onRequest: [fastify.authenticate],
    }, async (request: any, reply) => {
        try {
            const { asteroidId } = addWatchlistSchema.parse(request.body)

            const watchlistItem = new Watchlist({
                userId: request.user.id,
                asteroidId,
            })

            await watchlistItem.save()
            return reply.code(201).send(watchlistItem)
        } catch (error: any) {
            if (error.code === 11000) {
                return reply.code(400).send({ message: 'Already in watchlist' })
            }
            if (error instanceof z.ZodError) {
                return reply.code(400).send({ message: 'Validation error', errors: error.errors })
            }
            return reply.code(500).send({ message: 'Server error' })
        }
    })

    // Remove from watchlist
    fastify.delete('/:asteroidId', {
        onRequest: [fastify.authenticate],
    }, async (request: any, reply) => {
        try {
            const { asteroidId } = request.params as any
            await Watchlist.deleteOne({ userId: request.user.id, asteroidId })
            return reply.send({ message: 'Removed from watchlist' })
        } catch (error) {
            return reply.code(500).send({ message: 'Server error' })
        }
    })
}
