'use client'

import { useState, useRef, useEffect } from 'react'
import { useChat } from '@/contexts/ChatContext'
import { ChatMessage } from './ChatMessage'
import { MessageCircle, X, Send, Users } from 'lucide-react'

export function ChatPanel() {
    const [isOpen, setIsOpen] = useState(false)
    const [inputMessage, setInputMessage] = useState('')
    const { messages, sendMessage, isConnected, onlineUsers } = useChat()
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const currentUser = 'User' // TODO: Get from auth context

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const handleSend = () => {
        if (inputMessage.trim() && isConnected) {
            sendMessage(inputMessage)
            setInputMessage('')
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    return (
        <>
            {/* Chat Toggle Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 bg-gradient-to-r from-[#535C91] to-[#9290C3] text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50 flex items-center gap-2"
                >
                    <MessageCircle className="w-6 h-6" />
                    {messages.length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {messages.length > 9 ? '9+' : messages.length}
                        </span>
                    )}
                </button>
            )}

            {/* Chat Panel */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-[#070F2B] border border-[#535C91]/30 rounded-xl shadow-2xl flex flex-col z-50">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-[#1B1A55] to-[#535C91] p-4 rounded-t-xl flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <MessageCircle className="w-5 h-5 text-[#9290C3]" />
                            <h3 className="text-white font-semibold">Community Chat</h3>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1 text-sm text-[#9290C3]">
                                <Users className="w-4 h-4" />
                                <span>{onlineUsers}</span>
                            </div>
                            <div
                                className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'
                                    }`}
                            />
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-[#9290C3] hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-2">
                        {messages.length === 0 ? (
                            <div className="text-center text-[#9290C3]/60 mt-8">
                                <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p>No messages yet. Start the conversation!</p>
                            </div>
                        ) : (
                            messages.map((msg, index) => (
                                <ChatMessage
                                    key={msg.id || index}
                                    username={msg.username}
                                    message={msg.message}
                                    timestamp={msg.timestamp}
                                    isOwnMessage={msg.username === currentUser}
                                    asteroidMention={msg.asteroidMention}
                                />
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t border-[#535C91]/30">
                        {!isConnected && (
                            <div className="text-yellow-400 text-xs mb-2 flex items-center gap-1">
                                <span className="animate-pulse">⚠️</span>
                                Connecting to chat...
                            </div>
                        )}
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Type a message... (use @2024AB1 to mention asteroids)"
                                disabled={!isConnected}
                                className="flex-1 bg-[#1B1A55] border border-[#535C91]/30 rounded-lg px-4 py-2 text-[#9290C3] placeholder-[#9290C3]/40 focus:outline-none focus:border-[#9290C3] disabled:opacity-50"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!isConnected || !inputMessage.trim()}
                                className="bg-[#535C91] hover:bg-[#9290C3] text-white p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="text-xs text-[#9290C3]/40 mt-2">
                            Tip: Mention asteroids with @asteroidID
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
