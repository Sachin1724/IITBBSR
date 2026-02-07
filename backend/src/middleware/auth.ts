import { FastifyRequest, FastifyReply } from 'fastify'
import { User } from '../models/User'

export interface AuthRequest extends FastifyRequest {
    user?: {
        id: string
        email: string
        role: string
    }
}

export async function authenticate(request: AuthRequest, reply: FastifyReply) {
    try {
        await request.jwtVerify()

        // Attach user info to request
        const payload = request.user as any
        const user = await User.findById(payload.userId)

        if (!user) {
            return reply.code(401).send({ message: 'User not found' })
        }

        request.user = {
            id: user._id.toString(),
            email: user.email,
            role: user.role,
        }
    } catch (error) {
        return reply.code(401).send({ message: 'Invalid or expired token' })
    }
}

export function requireRole(role: string) {
    return async (request: AuthRequest, reply: FastifyReply) => {
        if (!request.user || request.user.role !== role) {
            return reply.code(403).send({ message: 'Insufficient permissions' })
        }
    }
}
