import { Server as SocketIOServer } from 'socket.io'
import { ChatMessage } from '../models/ChatMessage'
import { Conversation } from '../models/Conversation'
import { PrivateMessage } from '../models/PrivateMessage'
import mongoose from 'mongoose'

export function setupChatSocket(io: SocketIOServer) {
    io.on('connection', (socket) => {
        console.log(`✅ Client connected: ${socket.id}`)

        // Emit user count to all clients
        io.emit('userCount', io.engine.clientsCount)

        // Join user's personal room (for notification/invites)
        socket.on('join-user-room', (userId: string) => {
            socket.join(`user:${userId}`)
            console.log(`User ${userId} joined their personal room`)
        })

        // Join asteroid room (Community)
        socket.on('join-asteroid', async (asteroidId: string) => {
            socket.join(`asteroid:${asteroidId}`)
            console.log(`User joined room: asteroid:${asteroidId}`)

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

        // Private Chat: Join conversation room
        socket.on('join-private-chat', (conversationId: string) => {
            socket.join(`chat:${conversationId}`)
            console.log(`User joined private chat room: ${conversationId}`)
        })

        // Private Chat: Start or Fetch conversation
        socket.on('start-private-chat', async (data: { participantIds: string[] }) => {
            try {
                const sortedParticipants = data.participantIds.sort()

                let conversation = await Conversation.findOne({
                    participants: { $all: sortedParticipants, $size: sortedParticipants.length }
                })

                if (!conversation) {
                    conversation = new Conversation({
                        participants: sortedParticipants
                    })
                    await conversation.save()
                }

                socket.emit('private-chat-started', conversation)

                // Notify other participant if online
                const otherParticipantId = data.participantIds.find(id => id !== socket.request.headers['user-id'])
                if (otherParticipantId) {
                    io.to(`user:${otherParticipantId}`).emit('new-conversation', conversation)
                }
            } catch (error) {
                console.error('Error starting private chat:', error)
            }
        })

        // Send Community Message
        socket.on('send-message', async (data: {
            asteroidId: string
            userId: string
            userName: string
            userAvatar?: string
            userBio?: string
            message: string
        }) => {
            try {
                // Generate ID immediately for optimistic rendering
                const tempId = new mongoose.Types.ObjectId()
                const timestamp = new Date()

                // ⚡ EMIT IMMEDIATELY - Don't wait for database
                const messagePayload = {
                    id: tempId,
                    asteroidId: data.asteroidId,
                    userId: data.userId,
                    userName: data.userName,
                    userAvatar: data.userAvatar,
                    userBio: data.userBio,
                    message: data.message,
                    createdAt: timestamp,
                }

                io.to(`asteroid:${data.asteroidId}`).emit('new-message', messagePayload)

                // 💾 Save to database asynchronously (don't await)
                setImmediate(async () => {
                    try {
                        const chatMessage = new ChatMessage({
                            _id: tempId,
                            asteroidId: data.asteroidId,
                            userId: new mongoose.Types.ObjectId(data.userId),
                            userName: data.userName,
                            message: data.message,
                            createdAt: timestamp
                        })
                        await chatMessage.save()
                    } catch (dbError) {
                        console.error('Error saving message to DB:', dbError)
                    }
                })
            } catch (error) {
                console.error('Error sending message:', error)
                socket.emit('error', { message: 'Failed to send message' })
            }
        })

        // Send Private Message
        socket.on('send-private-message', async (data: {
            conversationId: string
            senderId: string
            senderName: string
            message: string
        }) => {
            try {
                // Generate ID immediately
                const tempId = new mongoose.Types.ObjectId()
                const timestamp = new Date()

                // ⚡ EMIT IMMEDIATELY
                const messagePayload = {
                    id: tempId,
                    conversationId: data.conversationId,
                    senderId: data.senderId,
                    senderName: data.senderName,
                    message: data.message,
                    createdAt: timestamp,
                }

                io.to(`chat:${data.conversationId}`).emit('new-private-message', messagePayload)

                // 💾 Save to database asynchronously
                setImmediate(async () => {
                    try {
                        const privateMsg = new PrivateMessage({
                            _id: tempId,
                            conversationId: new mongoose.Types.ObjectId(data.conversationId),
                            senderId: new mongoose.Types.ObjectId(data.senderId),
                            message: data.message,
                            createdAt: timestamp
                        })
                        await privateMsg.save()

                        // Update conversation last message
                        await Conversation.findByIdAndUpdate(data.conversationId, {
                            lastMessage: data.message,
                            updatedAt: timestamp
                        })
                    } catch (dbError) {
                        console.error('Error saving private message to DB:', dbError)
                    }
                })
            } catch (error) {
                console.error('Error sending private message:', error)
            }
        })

        socket.on('disconnect', () => {
            console.log(`❌ Client disconnected: ${socket.id}`)
            io.emit('userCount', io.engine.clientsCount)
        })
    })
}

