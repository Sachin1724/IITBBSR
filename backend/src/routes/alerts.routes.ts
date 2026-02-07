import { FastifyInstance } from 'fastify'
import { Alert } from '../models/Alert'
import { z } from 'zod'

const createAlertSchema = z.object({
    asteroidId: z.string(),
    threshold: z.number().min(0).max(100),
})

const updateAlertSchema = z.object({
    threshold: z.number().min(0).max(100).optional(),
    enabled: z.boolean().optional(),
})

export async function alertRoutes(fastify: FastifyInstance) {
    // Get user's alerts
    fastify.get('/', {
        onRequest: [fastify.authenticate],
    }, async (request: any, reply) => {
        try {
            const alerts = await Alert.find({ userId: request.user.id })
            return reply.send(alerts)
        } catch (error) {
            return reply.code(500).send({ message: 'Server error' })
        }
    })

    // Create alert
    fastify.post('/', {
        onRequest: [fastify.authenticate],
    }, async (request: any, reply) => {
        try {
            const { asteroidId, threshold } = createAlertSchema.parse(request.body)

            const alert = new Alert({
                userId: request.user.id,
                asteroidId,
                threshold,
            })

            await alert.save()
            return reply.code(201).send(alert)
        } catch (error: any) {
            if (error instanceof z.ZodError) {
                return reply.code(400).send({ message: 'Validation error', errors: error.errors })
            }
            return reply.code(500).send({ message: 'Server error' })
        }
    })

    // Update alert
    fastify.put('/:id', {
        onRequest: [fastify.authenticate],
    }, async (request: any, reply) => {
        try {
            const { id } = request.params as any
            const updates = updateAlertSchema.parse(request.body)

            const alert = await Alert.findOneAndUpdate(
                { _id: id, userId: request.user.id },
                { $set: updates },
                { new: true }
            )

            if (!alert) {
                return reply.code(404).send({ message: 'Alert not found' })
            }

            return reply.send(alert)
        } catch (error: any) {
            if (error instanceof z.ZodError) {
                return reply.code(400).send({ message: 'Validation error', errors: error.errors })
            }
            return reply.code(500).send({ message: 'Server error' })
        }
    })

    // Delete alert
    fastify.delete('/:id', {
        onRequest: [fastify.authenticate],
    }, async (request: any, reply) => {
        try {
            const { id } = request.params as any
            await Alert.deleteOne({ _id: id, userId: request.user.id })
            return reply.send({ message: 'Alert deleted' })
        } catch (error) {
            return reply.code(500).send({ message: 'Server error' })
        }
    })
}
