'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { io, Socket } from 'socket.io-client'

interface ChatMessage {
    id: string
    userId: string
    username: string
    message: string
    timestamp: Date
    asteroidMention?: string
}

interface ChatContextType {
    messages: ChatMessage[]
    sendMessage: (message: string) => void
    isConnected: boolean
    onlineUsers: number
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: ReactNode }) {
    const [socket, setSocket] = useState<Socket | null>(null)
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [isConnected, setIsConnected] = useState(false)
    const [onlineUsers, setOnlineUsers] = useState(0)

    useEffect(() => {
        // Initialize Socket.io connection
        const socketInstance = io('http://localhost:4000', {
            transports: ['websocket'],
            autoConnect: true,
        })

        socketInstance.on('connect', () => {
            console.log('✅ Chat connected')
            setIsConnected(true)
        })

        socketInstance.on('disconnect', () => {
            console.log('❌ Chat disconnected')
            setIsConnected(false)
        })

        socketInstance.on('message', (data: ChatMessage) => {
            setMessages((prev) => [...prev.slice(-99), data]) // Keep last 100 messages
        })

        socketInstance.on('userCount', (count: number) => {
            setOnlineUsers(count)
        })

        socketInstance.on('messageHistory', (history: ChatMessage[]) => {
            setMessages(history.slice(-100))
        })

        setSocket(socketInstance)

        return () => {
            socketInstance.disconnect()
        }
    }, [])

    const sendMessage = (message: string) => {
        if (socket && isConnected) {
            // Extract asteroid mentions (e.g., @2024AB1)
            const asteroidMention = message.match(/@(\d{4}[A-Z]{2}\d+)/)?.[1]

            socket.emit('sendMessage', {
                message,
                asteroidMention,
                timestamp: new Date(),
            })
        }
    }

    return (
        <ChatContext.Provider value={{ messages, sendMessage, isConnected, onlineUsers }}>
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
