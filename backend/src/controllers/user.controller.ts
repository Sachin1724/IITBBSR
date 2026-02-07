import { FastifyRequest, FastifyReply } from 'fastify'
import { User, IUser } from '../models/User'
import { AuthRequest } from '../middleware/auth.middleware'

export class UserController {
    // Get current user profile
    async getProfile(req: AuthRequest, reply: FastifyReply) {
        try {
            const user = await User.findById(req.user.userId).select('-password')

            if (!user) {
                return reply.status(404).send({ message: 'User not found' })
            }

            return reply.send(user)
        } catch (error) {
            console.error('Get profile error:', error)
            return reply.status(500).send({ message: 'Internal server error' })
        }
    }

    // Update user profile
    async updateProfile(req: AuthRequest, reply: FastifyReply) {
        try {
            const { name, bio, location, organization, avatar } = req.body as Partial<IUser>

            // Validate input length
            if (bio && bio.length > 500) {
                return reply.status(400).send({ message: 'Bio must be less than 500 characters' })
            }
            if (location && location.length > 100) {
                return reply.status(400).send({ message: 'Location must be less than 100 characters' })
            }
            if (organization && organization.length > 100) {
                return reply.status(400).send({ message: 'Organization must be less than 100 characters' })
            }

            const user = await User.findByIdAndUpdate(
                req.user.userId,
                {
                    $set: {
                        name,
                        bio,
                        location,
                        organization,
                        avatar,
                    },
                },
                { new: true, runValidators: true }
            ).select('-password')

            if (!user) {
                return reply.status(404).send({ message: 'User not found' })
            }

            return reply.send(user)
        } catch (error) {
            console.error('Update profile error:', error)
            return reply.status(500).send({ message: 'Internal server error' })
        }
    }
}

export const userController = new UserController()
