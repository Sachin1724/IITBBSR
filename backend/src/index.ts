import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'
import jwt from '@fastify/jwt'
import socketIO from 'fastify-socket.io'
import { config } from './config'
import { connectDatabase } from './config/database'
import { authenticate } from './middleware/auth'
import { authRoutes } from './routes/auth.routes'
import { asteroidRoutes } from './routes/asteroids.routes'
import { watchlistRoutes } from './routes/watchlist.routes'
import { alertRoutes } from './routes/alerts.routes'
import { setupChatSocket } from './sockets/chat.socket'
import { startDataRefreshScheduler } from './schedulers/dataRefresh'

const fastify = Fastify({
    logger: {
        level: config.nodeEnv === 'development' ? 'info' : 'error',
    },
})

async function start() {
    try {
        // Connect to database
        await connectDatabase()

        // Register plugins
        await fastify.register(cors, {
            origin: config.cors.origin,
            credentials: true,
        })

        await fastify.register(helmet, {
            contentSecurityPolicy: false,
        })

        await fastify.register(rateLimit, {
            max: 100,
            timeWindow: '15 minutes',
        })

        await fastify.register(jwt, {
            secret: config.jwt.secret,
        })

        await fastify.register(socketIO, {
            cors: {
                origin: config.cors.origin,
                credentials: true,
            },
        })

        // Decorate fastify with authenticate method
        fastify.decorate('authenticate', authenticate)

        // Setup WebSocket
        setupChatSocket(fastify.io)

        // Health check
        fastify.get('/health', async () => {
            return { status: 'ok', timestamp: new Date().toISOString() }
        })

        // Register routes
        await fastify.register(authRoutes, { prefix: '/api/auth' })
        await fastify.register(asteroidRoutes, { prefix: '/api/asteroids' })
        await fastify.register(watchlistRoutes, { prefix: '/api/watchlist' })
        await fastify.register(alertRoutes, { prefix: '/api/alerts' })

        // Start schedulers
        startDataRefreshScheduler()

        // Start server
        await fastify.listen({ port: config.port, host: '0.0.0.0' })
        console.log(`🚀 Server running on http://localhost:${config.port}`)
    } catch (error) {
        console.error('❌ Server startup error:', error)
        process.exit(1)
    }
}

// Handle shutdown
process.on('SIGINT', async () => {
    console.log('\n⚠️  Shutting down gracefully...')
    await fastify.close()
    process.exit(0)
})

start()
