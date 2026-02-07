import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { User } from '../models/User'
import { userController } from '../controllers/user.controller'

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
        preHandler: [fastify.authenticate],
    }, userController.getProfile)

    // Update profile (protected)
    fastify.put('/profile', {
        preHandler: [fastify.authenticate],
    }, userController.updateProfile)

    // Forgot Password
    fastify.post('/forgot-password', async (request, reply) => {
        try {
            const { email } = z.object({ email: z.string().email() }).parse(request.body)
            const user = await User.findOne({ email })

            if (!user) {
                // Return 200 even if user not found for security
                return reply.send({ message: 'If an account exists, an OTP has been sent' })
            }

            // Generate 6-digit OTP
            const otp = Math.floor(100000 + Math.random() * 900000).toString()
            user.resetOTP = otp
            user.resetOTPExpires = new Date(Date.now() + 10 * 60 * 1000) // 10 mins
            await user.save()

            // In a real app, send email here. Logging for now.
            console.log(`[AUTH] OTP for ${email}: ${otp}`)

            return reply.send({ message: 'If an account exists, an OTP has been sent' })
        } catch (error: any) {
            return reply.code(500).send({ message: 'Server error' })
        }
    })

    // Reset Password
    fastify.post('/reset-password', async (request, reply) => {
        try {
            const { email, otp, newPassword } = z.object({
                email: z.string().email(),
                otp: z.string().length(6),
                newPassword: z.string().min(6),
            }).parse(request.body)

            const user = await User.findOne({
                email,
                resetOTP: otp,
                resetOTPExpires: { $gt: new Date() }
            })

            if (!user) {
                return reply.code(400).send({ message: 'Invalid or expired OTP' })
            }

            // Update password (will be hashed by pre-save hook)
            user.password = newPassword
            user.resetOTP = undefined
            user.resetOTPExpires = undefined
            await user.save()

            return reply.send({ message: 'Password reset successful' })
        } catch (error: any) {
            if (error instanceof z.ZodError) {
                return reply.code(400).send({ message: 'Validation error', errors: error.errors })
            }
            return reply.code(500).send({ message: 'Server error' })
        }
    })
}
