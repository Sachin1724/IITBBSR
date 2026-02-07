import { Server as SocketIOServer } from 'socket.io'
import { ChatMessage } from '../models/ChatMessage'

export function setupChatSocket(io: SocketIOServer) {
    io.on('connection', (socket) => {
        console.log(`✅ Client connected: ${socket.id}`)

        // Join asteroid room
        socket.on('join-asteroid', async (asteroidId: string) => {
            socket.join(`asteroid:${asteroidId}`)
            console.log(`User joined room: asteroid:${asteroidId}`)

            // Send recent messages
            try {
                const messages = await ChatMessage.find({ asteroidId })
                    .sort({ createdAt: -1 })
                    .limit(50)
                    .lean()

                socket.emit('chat-history', messages.reverse())
            } catch (error) {
                console.error('Error fetching chat history:', error)
            }
        })

        // Leave asteroid room
        socket.on('leave-asteroid', (asteroidId: string) => {
            socket.leave(`asteroid:${asteroidId}`)
            console.log(`User left room: asteroid:${asteroidId}`)
        })

        // Send message
        socket.on('send-message', async (data: {
            asteroidId: string
            userId: string
            userName: string
            message: string
        }) => {
            try {
                // Save message
                const chatMessage = new ChatMessage({
                    asteroidId: data.asteroidId,
                    userId: data.userId,
                    userName: data.userName,
                    message: data.message,
                })

                await chatMessage.save()

                // Broadcast to room
                io.to(`asteroid:${data.asteroidId}`).emit('new-message', {
                    id: chatMessage._id,
                    asteroidId: chatMessage.asteroidId,
                    userId: chatMessage.userId,
                    userName: chatMessage.userName,
                    message: chatMessage.message,
                    createdAt: chatMessage.createdAt,
                })
            } catch (error) {
                console.error('Error sending message:', error)
                socket.emit('error', { message: 'Failed to send message' })
            }
        })

        socket.on('disconnect', () => {
            console.log(`❌ Client disconnected: ${socket.id}`)
        })
    })
}
