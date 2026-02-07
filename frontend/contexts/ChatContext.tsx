'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { io, Socket } from 'socket.io-client'

interface ChatMessage {
    id: string
    userId: string
    username: string
    userAvatar?: string
    userBio?: string
    message: string
    timestamp: Date
    asteroidMention?: string
}

interface PrivateMessage {
    id: string
    conversationId: string
    senderId: string
    senderName: string
    message: string
    createdAt: Date
}

interface Conversation {
    _id: string
    participants: any[]
    lastMessage?: string
    updatedAt: Date
}

interface ChatContextType {
    messages: ChatMessage[]
    privateMessages: PrivateMessage[]
    conversations: Conversation[]
    activeChat: Conversation | null
    sendMessage: (message: string) => void
    sendPrivateMessage: (message: string, conversationId?: string) => void
    startPrivateChat: (participantId: string) => void
    setActiveChat: (chat: Conversation | null) => void
    isConnected: boolean
    onlineUsers: number
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: ReactNode }) {
    const [socket, setSocket] = useState<Socket | null>(null)
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [privateMessages, setPrivateMessages] = useState<PrivateMessage[]>([])
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [activeChat, setActiveChat] = useState<Conversation | null>(null)
    const [isConnected, setIsConnected] = useState(false)
    const [onlineUsers, setOnlineUsers] = useState(0)

    useEffect(() => {
        const socketInstance = io('http://localhost:4000', {
            transports: ['websocket'],
            autoConnect: true,
        })

        socketInstance.on('connect', () => {
            console.log('✅ Chat connected')
            setIsConnected(true)

            // Join global community room
            socketInstance.emit('join-asteroid', 'global')

            // Join personal room if logged in
            const token = localStorage.getItem('token')
            if (token) {
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]))
                    console.log('Joining user room:', payload.userId || payload.id)
                    socketInstance.emit('join-user-room', payload.userId || payload.id)
                } catch (e) {
                    console.error('Socket connect error:', e)
                }
            }
        })

        socketInstance.on('disconnect', () => {
            console.log('❌ Chat disconnected')
            setIsConnected(false)
        })

        socketInstance.on('new-message', (data: any) => {
            console.log('New community message:', data)
            // Map backend fields to frontend expectations
            const mappedMsg: ChatMessage = {
                id: data.id || data._id,
                userId: data.userId,
                username: data.userName,
                userAvatar: data.userAvatar,
                userBio: data.userBio,
                message: data.message,
                timestamp: new Date(data.createdAt || Date.now())
            }
            setMessages((prev) => [...prev.slice(-99), mappedMsg])
        })

        socketInstance.on('new-private-message', (data: PrivateMessage) => {
            setPrivateMessages((prev) => [...prev, data])
            // Update last message in conversation list
            setConversations(prev => prev.map(c =>
                c._id === data.conversationId ? { ...c, lastMessage: data.message, updatedAt: data.createdAt } : c
            ))
        })

        socketInstance.on('private-chat-started', (conversation: Conversation) => {
            setConversations(prev => {
                if (prev.find(c => c._id === conversation._id)) return prev
                return [conversation, ...prev]
            })
            setActiveChat(conversation)
            socketInstance.emit('join-private-chat', conversation._id)
        })

        socketInstance.on('new-conversation', (conversation: Conversation) => {
            setConversations(prev => [conversation, ...prev])
        })

        socketInstance.on('userCount', (count: number) => {
            setOnlineUsers(count)
        })

        socketInstance.on('chat-history', (history: any[]) => {
            const mappedHistory = history.map(data => ({
                id: data.id || data._id,
                userId: data.userId,
                username: data.userName,
                message: data.message,
                timestamp: new Date(data.createdAt),
                userAvatar: data.userAvatar,
                userBio: data.userBio
            }))
            setMessages(mappedHistory)
        })

        // Fetch initial conversations
        const fetchInitialData = async () => {
            const token = localStorage.getItem('token')
            if (token) {
                try {
                    const { chatAPI } = await import('@/lib/api')
                    const response = await chatAPI.getConversations()
                    setConversations(response.data)
                } catch (e) {
                    console.error('Failed to fetch initial conversations', e)
                }
            }
        }
        fetchInitialData()

        setSocket(socketInstance)

        return () => {
            socketInstance.disconnect()
        }
    }, [])

    useEffect(() => {
        if (activeChat) {
            // Load messages for active chat if needed
            // For now they come via socket
        }
    }, [activeChat])

    const sendMessage = (message: string) => {
        if (socket && isConnected) {
            const token = localStorage.getItem('token')
            if (!token) return

            const payload = JSON.parse(atob(token.split('.')[1]))
            const asteroidMention = message.match(/@(\d{4}[A-Z]{2}\d+)/)?.[1]

            console.log('Sending community message to global room')
            socket.emit('send-message', {
                asteroidId: 'global',
                userId: payload.userId || payload.id,
                userName: payload.name || 'Anonymous',
                message,
                asteroidMention,
                timestamp: new Date(),
            })
        }
    }

    const sendPrivateMessage = (message: string, conversationId?: string) => {
        if (socket && isConnected) {
            const targetId = conversationId || activeChat?._id
            if (!targetId) return

            const token = localStorage.getItem('token')
            if (!token) return
            const payload = JSON.parse(atob(token.split('.')[1]))

            socket.emit('send-private-message', {
                conversationId: targetId,
                senderId: payload.userId || payload.id,
                senderName: payload.name || 'Anonymous',
                message
            })
        }
    }

    const startPrivateChat = (participantId: string) => {
        if (socket && isConnected) {
            const token = localStorage.getItem('token')
            if (!token) return
            const payload = JSON.parse(atob(token.split('.')[1]))
            const currentUserId = payload.userId || payload.id

            socket.emit('start-private-chat', {
                participantIds: [currentUserId, participantId]
            })
        }
    }

    return (
        <ChatContext.Provider value={{
            messages,
            privateMessages,
            conversations,
            activeChat,
            sendMessage,
            sendPrivateMessage,
            startPrivateChat,
            setActiveChat,
            isConnected,
            onlineUsers
        }}>
            {children}
        </ChatContext.Provider>
    )
}


export function useChat() {
    const context = useContext(ChatContext)
    if (!context) {
        throw new Error('useChat must be used within ChatProvider')
    }
    return context
}
