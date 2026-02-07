import { FastifyInstance } from 'fastify'
import { AuthRequest, authenticate } from './middleware/auth'

declare module 'fastify' {
    interface FastifyInstance {
        authenticate: typeof authenticate
    }

    interface FastifyRequest {
        user?: {
            id: string
            email: string
            role: string
        }
    }
}
