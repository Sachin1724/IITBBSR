'use client'

import { useState, useRef, useEffect } from 'react'
import { useChat } from '@/contexts/ChatContext'
import { ChatMessage } from './ChatMessage'
import { MessageCircle, X, Send, Users } from 'lucide-react'

export function ChatPanel({ isFullPage = false }: { isFullPage?: boolean }) {
    const [isOpen, setIsOpen] = useState(isFullPage)
    const [inputMessage, setInputMessage] = useState('')
    const [activeTab, setActiveTab] = useState<'community' | 'personal'>('community')
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState<any[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const [showSearch, setShowSearch] = useState(false)

    const {
        messages,
        sendMessage,
        privateMessages,
        conversations,
        activeChat,
        sendPrivateMessage,
        startPrivateChat,
        setActiveChat,
        isConnected,
        onlineUsers
    } = useChat()

    const messagesEndRef = useRef<HTMLDivElement>(null)

    // Get currentUser from token
    const [currentUser, setCurrentUser] = useState({ name: 'User', id: '' })
    useEffect(() => {
        const token = localStorage.getItem('token')
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]))
                setCurrentUser({
                    name: payload.name || 'User',
                    id: payload.userId || payload.id
                })
            } catch (e) { }
        }
    }, [])

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, privateMessages, activeChat])

    const handleSend = () => {
        if (!inputMessage.trim() || !isConnected) return

        if (activeTab === 'community') {
            sendMessage(inputMessage)
        } else if (activeChat) {
            sendPrivateMessage(inputMessage)
        }
        setInputMessage('')
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    const handleUserSearch = async (query: string) => {
        setSearchQuery(query)
        if (query.length < 2) {
            setSearchResults([])
            return
        }
        setIsSearching(true)
        try {
            const { chatAPI } = await import('@/lib/api')
            const response = await chatAPI.searchUsers(query)
            setSearchResults(response.data)
        } catch (e) {
            console.error('Search failed', e)
        } finally {
            setIsSearching(false)
        }
    }

    const startChat = (user: any) => {
        startPrivateChat(user._id || user.id)
        setShowSearch(false)
        setSearchQuery('')
        setSearchResults([])
    }

    const panelClasses = isFullPage
        ? "w-full h-full bg-[#070F2B] flex flex-col"
        : "fixed bottom-6 right-6 w-96 h-[600px] bg-[#070F2B] border border-[#535C91]/30 rounded-xl shadow-2xl flex flex-col z-50 overflow-hidden"

    return (
        <>
            {/* Chat Toggle Button */}
            {!isOpen && !isFullPage && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 bg-gradient-to-r from-[#535C91] to-[#9290C3] text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50 flex items-center gap-2"
                >
                    <MessageCircle className="w-6 h-6" />
                </button>
            )}

            {isOpen && (
                <div className={panelClasses}>
                    {/* Header */}
                    <div className="bg-gradient-to-r from-[#1B1A55] to-[#535C91] p-4 flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <MessageCircle className="w-5 h-5 text-[#9290C3]" />
                                <h3 className="text-white font-semibold">
                                    {activeTab === 'community' ? 'Community' : (activeChat ? 'Direct Message' : 'Personal')}
                                </h3>
                            </div>
                            <div className="flex items-center gap-3">
                                {activeTab === 'community' && (
                                    <div className="flex items-center gap-1 text-sm text-[#9290C3]">
                                        <Users className="w-4 h-4" />
                                        <span>{onlineUsers}</span>
                                    </div>
                                )}
                                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
                                {!isFullPage && (
                                    <button onClick={() => setIsOpen(false)} className="text-[#9290C3] hover:text-white transition-colors">
                                        <X className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Tab Switcher */}
                        <div className="flex bg-black/20 rounded-lg p-1">
                            <button
                                onClick={() => { setActiveTab('community'); setActiveChat(null); }}
                                className={`flex-1 py-1 text-xs rounded-md transition-all ${activeTab === 'community' ? 'bg-[#535C91] text-white' : 'text-[#9290C3] hover:text-white'}`}
                            >
                                Community
                            </button>
                            <button
                                onClick={() => setActiveTab('personal')}
                                className={`flex-1 py-1 text-xs rounded-md transition-all ${activeTab === 'personal' ? 'bg-[#535C91] text-white' : 'text-[#9290C3] hover:text-white'}`}
                            >
                                Personal
                            </button>
                        </div>
                    </div>

                    {/* Chat Content */}
                    <div className="flex-1 overflow-y-auto flex flex-col relative bg-[#070F2B]">
                        {activeTab === 'community' ? (
                            <div className="flex-1 p-4 space-y-2 custom-scrollbar">
                                {messages.map((msg, index) => (
                                    <ChatMessage
                                        key={msg.id || index}
                                        userId={msg.userId}
                                        username={msg.username}
                                        message={msg.message}
                                        timestamp={msg.timestamp}
                                        isOwnMessage={msg.username === currentUser.name}
                                        asteroidMention={msg.asteroidMention}
                                        userAvatar={msg.userAvatar}
                                        userBio={msg.userBio}
                                        onInvite={() => setActiveTab('personal')}
                                    />
                                ))}
                                <div ref={messagesEndRef} />
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col">
                                {activeChat ? (
                                    /* 1-to-1 Chat View */
                                    <div className="flex-1 flex flex-col">
                                        <div className="p-2 border-b border-white/5 bg-white/5 flex items-center gap-2">
                                            <button onClick={() => setActiveChat(null)} className="p-1 hover:bg-white/10 rounded transition-colors text-white/50 hover:text-white">
                                                <Users className="w-4 h-4 rotate-180" />
                                            </button>
                                            <span className="text-sm font-medium">
                                                {activeChat.participants.find(p => p._id !== currentUser.id)?.name || 'Research Partner'}
                                            </span>
                                        </div>
                                        <div className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
                                            {privateMessages.filter(m => m.conversationId === activeChat._id).map((msg, index) => (
                                                <ChatMessage
                                                    key={msg.id || index}
                                                    username={msg.senderName}
                                                    message={msg.message}
                                                    timestamp={msg.createdAt}
                                                    isOwnMessage={msg.senderId === currentUser.id}
                                                />
                                            ))}
                                            <div ref={messagesEndRef} />
                                        </div>
                                    </div>
                                ) : (
                                    /* Personal Inbox */
                                    <div className="flex-1 flex flex-col p-4">
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="text-sm font-bold text-[#9290C3] uppercase tracking-wider">Inbox</h4>
                                            <button
                                                onClick={() => setShowSearch(!showSearch)}
                                                className="p-1.5 bg-[#535C91] hover:bg-[#9290C3] rounded-lg text-white transition-all transform hover:scale-110"
                                            >
                                                <Users className="w-4 h-4" />
                                            </button>
                                        </div>

                                        {showSearch && (
                                            <div className="mb-4 animate-in slide-in-from-top duration-300">
                                                <input
                                                    autoFocus
                                                    type="text"
                                                    placeholder="Search by username..."
                                                    value={searchQuery}
                                                    onChange={(e) => handleUserSearch(e.target.value)}
                                                    className="w-full bg-[#1B1A55] border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#9290C3]"
                                                />
                                                {searchResults.length > 0 && (
                                                    <div className="mt-2 bg-[#1B1A55] rounded-lg overflow-hidden border border-white/10">
                                                        {searchResults.map(user => (
                                                            <button
                                                                key={user._id}
                                                                onClick={() => startChat(user)}
                                                                className="w-full text-left p-3 hover:bg-white/5 transition-colors flex items-center gap-2 border-b border-white/5 last:border-0"
                                                            >
                                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold">
                                                                    {user.name.charAt(0)}
                                                                </div>
                                                                <div>
                                                                    <div className="text-sm font-medium">{user.name}</div>
                                                                    <div className="text-xs text-[#9290C3]/60">Start chatting</div>
                                                                </div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                                {isSearching && <div className="p-2 text-xs text-center text-[#9290C3]">Searching...</div>}
                                            </div>
                                        )}

                                        <div className="space-y-2">
                                            {conversations.length === 0 ? (
                                                <div className="text-center py-8 opacity-40">
                                                    <Users className="w-12 h-12 mx-auto mb-2" />
                                                    <p className="text-xs">No private chats yet.</p>
                                                </div>
                                            ) : (
                                                conversations.map(chat => {
                                                    const otherUser = chat.participants.find(p => p._id !== currentUser.id)
                                                    return (
                                                        <button
                                                            key={chat._id}
                                                            onClick={() => setActiveChat(chat)}
                                                            className="w-full text-left p-4 glass-card bg-white/5 hover:bg-white/10 transition-all group flex items-center gap-3"
                                                        >
                                                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center relative">
                                                                {otherUser?.avatar ? (
                                                                    <img src={otherUser.avatar} className="w-full h-full rounded-full" />
                                                                ) : (
                                                                    <span className="font-bold">{otherUser?.name.charAt(0)}</span>
                                                                )}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="text-sm font-bold truncate group-hover:text-white transition-colors">
                                                                    {otherUser?.name || 'Unknown Researcher'}
                                                                </div>
                                                                <div className="text-xs text-[#9290C3]/60 truncate italic">
                                                                    {chat.lastMessage || 'No messages yet'}
                                                                </div>
                                                            </div>
                                                        </button>
                                                    )
                                                })
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    {(activeTab === 'community' || activeChat) && (
                        <div className="p-4 border-t border-white/5 bg-[#070F2B]">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder={activeTab === 'community' ? "Chat with community..." : "Message safely..."}
                                    disabled={!isConnected}
                                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#9290C3]"
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!isConnected || !inputMessage.trim()}
                                    className="bg-[#535C91] hover:bg-[#9290C3] p-2 rounded-lg text-white transition-all disabled:opacity-30"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </>
    )
}

