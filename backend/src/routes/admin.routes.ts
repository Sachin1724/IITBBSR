import { FastifyInstance } from 'fastify'
import { adminController } from '../controllers/admin.controller'
import { authenticate, requireAdmin } from '../middleware/auth'

export async function adminRoutes(fastify: FastifyInstance) {
    // Apply authentication and admin check to all routes in this plugin
    fastify.addHook('preHandler', async (request, reply) => {
        await authenticate(request as any, reply)
        await requireAdmin(request as any, reply)
    })

    fastify.get('/stats', adminController.getStats as any)
    fastify.get('/users', adminController.getUsers as any)
    fastify.post('/reset-password', adminController.resetPassword as any)
    fastify.put('/update-role', adminController.updateRole as any)
}
