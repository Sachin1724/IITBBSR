import { FastifyReply } from 'fastify'
import { User } from '../models/User'
import { AuthRequest } from '../middleware/auth'
import bcrypt from 'bcrypt'

export class AdminController {
    // Get system stats
    async getStats(req: AuthRequest, reply: FastifyReply) {
        try {
            const totalUsers = await User.countDocuments()
            const activeUsersLast24h = await User.countDocuments({
                lastLogin: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) }
            })
            const adminCount = await User.countDocuments({ role: 'admin' })

            return reply.send({
                totalUsers,
                activeUsersLast24h,
                adminCount
            })
        } catch (error) {
            console.error('Admin stats error:', error)
            return reply.status(500).send({ message: 'Internal server error' })
        }
    }

    // Get all users with search
    async getUsers(req: AuthRequest, reply: FastifyReply) {
        try {
            const { q } = req.query as { q?: string }
            let query = {}

            if (q) {
                query = {
                    $or: [
                        { name: { $regex: q, $options: 'i' } },
                        { email: { $regex: q, $options: 'i' } }
                    ]
                }
            }

            const users = await User.find(query)
                .select('-password')
                .sort({ createdAt: -1 })

            return reply.send(users)
        } catch (error) {
            console.error('Admin get users error:', error)
            return reply.status(500).send({ message: 'Internal server error' })
        }
    }

    // Direct password reset by admin
    async resetPassword(req: AuthRequest, reply: FastifyReply) {
        try {
            const { userId, newPassword } = req.body as { userId: string, newPassword: string }

            if (!userId || !newPassword) {
                return reply.status(400).send({ message: 'User ID and new password are required' })
            }

            const user = await User.findById(userId)
            if (!user) {
                return reply.status(404).send({ message: 'User not found' })
            }

            // Update password (will be hashed by pre-save hook)
            user.password = newPassword
            await user.save()

            return reply.send({ message: 'Password reset successfully' })
        } catch (error) {
            console.error('Admin password reset error:', error)
            return reply.status(500).send({ message: 'Internal server error' })
        }
    }

    // Update user role
    async updateRole(req: AuthRequest, reply: FastifyReply) {
        try {
            const { userId, role } = req.body as { userId: string, role: 'user' | 'admin' }

            if (!['user', 'admin'].includes(role)) {
                return reply.status(400).send({ message: 'Invalid role' })
            }

            const user = await User.findByIdAndUpdate(userId, { role }, { new: true }).select('-password')
            if (!user) {
                return reply.status(404).send({ message: 'User not found' })
            }

            return reply.send(user)
        } catch (error) {
            console.error('Admin update role error:', error)
            return reply.status(500).send({ message: 'Internal server error' })
        }
    }
}

export const adminController = new AdminController()
