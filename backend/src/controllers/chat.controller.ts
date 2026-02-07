import { FastifyReply, FastifyRequest } from 'fastify'
import { Conversation } from '../models/Conversation'
import { PrivateMessage } from '../models/PrivateMessage'
import { User } from '../models/User'
import { AuthRequest } from '../middleware/auth'

export const chatController = {
    // Search users by name or email
    searchUsers: async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { q } = request.query as { q: string }
            if (!q) return reply.send([])

            const users = await User.find({
                $or: [
                    { name: { $regex: q, $options: 'i' } },
                    { email: { $regex: q, $options: 'i' } }
                ],
                _id: { $ne: (request as any).user.userId } // Exclude current user
            }).select('name avatar bio').limit(10)

            return reply.send(users)
        } catch (error) {
            return reply.code(500).send({ message: 'Error searching users' })
        }
    },

    // Get all conversations for current user
    getConversations: async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const userId = (request as any).user.userId
            const conversations = await Conversation.find({
                participants: userId
            })
                .populate('participants', 'name avatar bio')
                .sort({ updatedAt: -1 })

            return reply.send(conversations)
        } catch (error) {
            return reply.code(500).send({ message: 'Error fetching conversations' })
        }
    },

    // Get messages for a specific conversation
    getMessages: async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { conversationId } = request.params as { conversationId: string }
            const messages = await PrivateMessage.find({ conversationId })
                .sort({ createdAt: 1 })
                .limit(100)

            return reply.send(messages)
        } catch (error) {
            return reply.code(500).send({ message: 'Error fetching messages' })
        }
    }
}
