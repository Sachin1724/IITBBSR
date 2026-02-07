import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { User } from '../models/User'

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().min(1),
})

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
})

export async function authRoutes(fastify: FastifyInstance) {
    // Register
    fastify.post('/register', async (request, reply) => {
        try {
            const { email, password, name } = registerSchema.parse(request.body)

            // Check if user exists
            const existingUser = await User.findOne({ email })
            if (existingUser) {
                return reply.code(400).send({ message: 'User already exists' })
            }

            // Create user
            const user = new User({ email, password, name })
            await user.save()

            // Generate token
            const token = fastify.jwt.sign({ userId: user._id }, { expiresIn: '7d' })

            return reply.code(201).send({
                token,
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                },
            })
        } catch (error: any) {
            if (error instanceof z.ZodError) {
                return reply.code(400).send({ message: 'Validation error', errors: error.errors })
            }
            return reply.code(500).send({ message: 'Server error' })
        }
    })

    // Login
    fastify.post('/login', async (request, reply) => {
        try {
            const { email, password } = loginSchema.parse(request.body)

            // Find user
            const user = await User.findOne({ email })
            if (!user) {
                return reply.code(401).send({ message: 'Invalid credentials' })
            }

            // Check password
            const isValid = await user.comparePassword(password)
            if (!isValid) {
                return reply.code(401).send({ message: 'Invalid credentials' })
            }

            // Generate token
            const token = fastify.jwt.sign({ userId: user._id }, { expiresIn: '7d' })

            return reply.send({
                token,
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                },
            })
        } catch (error: any) {
            if (error instanceof z.ZodError) {
                return reply.code(400).send({ message: 'Validation error', errors: error.errors })
            }
            return reply.code(500).send({ message: 'Server error' })
        }
    })

    // Get profile (protected)
    fastify.get('/profile', {
        onRequest: [fastify.authenticate],
    }, async (request: any, reply) => {
        try {
            const user = await User.findById(request.user.id).select('-password')
            return reply.send({ user })
        } catch (error) {
            return reply.code(500).send({ message: 'Server error' })
        }
    })
}
