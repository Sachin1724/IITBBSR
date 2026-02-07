import { FastifyInstance } from 'fastify'
import { chatController } from '../controllers/chat.controller'
import { authenticate } from '../middleware/auth'

export async function chatRoutes(fastify: FastifyInstance) {
    fastify.addHook('preHandler', async (request, reply) => {
        await authenticate(request as any, reply)
    })

    fastify.get('/search-users', chatController.searchUsers)
    fastify.get('/conversations', chatController.getConversations)
    fastify.get('/conversations/:conversationId/messages', chatController.getMessages)
}
