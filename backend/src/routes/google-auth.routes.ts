import { FastifyInstance } from 'fastify'
import { User } from '../models/User'
import { config } from '../config'
import axios from 'axios'

export async function googleAuthRoutes(fastify: FastifyInstance) {
    // Initiate Google OAuth
    fastify.get('/google', async (request, reply) => {
        const redirectUri = config.google.callbackURL
        const scope = encodeURIComponent('profile email')
        const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${config.google.clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`

        return reply.redirect(googleAuthUrl)
    })

    // Google OAuth callback
    fastify.get('/google/callback', async (request, reply) => {
        try {
            const { code } = request.query as { code: string }

            if (!code) {
                return reply.code(400).send({ message: 'Authorization code not provided' })
            }

            // Exchange code for tokens
            const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
                code,
                client_id: config.google.clientId,
                client_secret: config.google.clientSecret,
                redirect_uri: config.google.callbackURL,
                grant_type: 'authorization_code',
            })

            const { access_token } = tokenResponse.data

            // Get user info from Google
            const userInfoResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
            })

            const { id: googleId, email, name, picture } = userInfoResponse.data

            // Find or create user
            let user = await User.findOne({ googleId })

            if (!user) {
                // Check if user exists with same email
                user = await User.findOne({ email })

                if (user) {
                    // Link Google account to existing user
                    user.googleId = googleId
                    user.authProvider = 'google'
                    if (picture) user.avatar = picture
                    await user.save()
                } else {
                    // Create new user
                    user = new User({
                        email,
                        name,
                        googleId,
                        authProvider: 'google',
                        avatar: picture,
                    })
                    await user.save()
                }
            }

            // Generate JWT token
            const token = fastify.jwt.sign({ userId: user._id, name: user.name, role: user.role, avatar: user.avatar }, { expiresIn: '7d' })

            // Redirect to frontend with token
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
            return reply.redirect(`${frontendUrl}/auth/callback?token=${token}`)
        } catch (error) {
            console.error('Google OAuth error:', error)
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
            return reply.redirect(`${frontendUrl}/login?error=oauth_failed`)
        }
    })
}
