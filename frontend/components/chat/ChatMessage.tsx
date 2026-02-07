'use client'

import { formatDistanceToNow } from 'date-fns'
import { IoPerson, IoChatbubbleEllipses, IoBookmark } from 'react-icons/io5'
import { useChat } from '@/contexts/ChatContext'
import { watchlistAPI } from '@/lib/api'
import Link from 'next/link'

interface ChatMessageProps {
    userId?: string
    username: string
    userAvatar?: string
    userBio?: string
    message: string
    timestamp: Date
    isOwnMessage?: boolean
    asteroidMention?: string
    onInvite?: () => void
    isGrouped?: boolean // WhatsApp-style grouping
}

export function ChatMessage({
    userId,
    username,
    userAvatar,
    userBio,
    message,
    timestamp,
    isOwnMessage = false,
    onInvite,
    isGrouped = false,
}: ChatMessageProps) {
    const { startPrivateChat } = useChat()

    const handleAddToWatchlist = async (e: React.MouseEvent, asteroidId: string) => {
        e.preventDefault()
        e.stopPropagation()
        try {
            await watchlistAPI.add(asteroidId)
            // Optional: Toast notification here
            // alert(`Asteroid ${asteroidId} added to watchlist! 🌠`) 
            // Alert might be annoying, just log or use a toast if available.
            // Given I can't add a toast hook easily right now, I'll log it.
            console.log(`Asteroid ${asteroidId} added to watchlist! 🌠`)
        } catch (err) {
            console.error(err)
        }
    }

    const handleInvite = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (userId) {
            startPrivateChat(userId)
            if (onInvite) onInvite()
        }
    }

    const renderMessageContent = () => {
        // Regex to split by mentions or asteroid IDs
        // Pattern for Asteroid ID: (ID: 2000433)
        // Pattern for Mentions: @2024AB1
        const parts = message.split(/(@\d{4}[A-Z]{2}\d+|\(ID: \d+\))/)

        return parts.map((part, index) => {
            if (part.match(/^@\d{4}[A-Z]{2}\d+$/)) {
                return (
                    <span
                        key={index}
                        className="text-blue-400 font-semibold cursor-pointer hover:underline"
                    >
                        {part}
                    </span>
                )
            }
            if (part.match(/^\(ID: \d+\)$/)) {
                const id = part.match(/\d+/)?.[0]
                if (id) {
                    return (
                        <span key={index} className="inline-flex items-center gap-1 mx-1 bg-white/10 px-2 py-0.5 rounded-full text-xs align-middle">
                            <Link href={`/asteroid/${id}`} className="text-[#F9E400] font-bold hover:underline">
                                {id}
                            </Link>
                            <button
                                onClick={(e) => handleAddToWatchlist(e, id)}
                                className="hover:text-[#F9E400] transition-colors p-0.5"
                                title="Add to Watchlist"
                            >
                                <IoBookmark className="w-3 h-3 icon-glow" />
                            </button>
                        </span>
                    )
                }
            }
            return <span key={index}>{part}</span>
        })
    }

    return (
        <div className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'} ${isGrouped ? 'mb-1' : 'mb-4'} items-end`}>
            {/* Avatar with Tooltip - only show if not grouped */}
            {!isGrouped ? (
                <div className="relative group shrink-0">
                    <div className="w-8 h-8 rounded-full border border-[#535C91]/30 bg-[#1B1A55] overflow-hidden flex items-center justify-center">
                        {userAvatar ? (
                            <img src={userAvatar} alt={username} className="w-full h-full object-cover" />
                        ) : (
                            <IoPerson className="w-4 h-4 text-[#9290C3] icon-glow" />
                        )}
                    </div>

                    {/* Profile Tooltip */}
                    {!isOwnMessage && onInvite && (
                        <div className="absolute bottom-full left-0 mb-2 w-48 bg-[#070F2B] border border-[#535C91]/50 rounded-lg p-3 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto z-50">
                            <div className="font-bold text-white text-sm mb-1">{username}</div>
                            {userBio && (
                                <div className="text-xs text-[#9290C3] line-clamp-2 mb-3">{userBio}</div>
                            )}
                            {!userBio && (
                                <div className="text-xs text-[#9290C3]/60 italic mb-3">Researcher at Cosmic Watch</div>
                            )}

                            <button
                                onClick={handleInvite}
                                className="w-full flex items-center justify-center gap-2 bg-[#535C91] hover:bg-[#9290C3] text-white py-1.5 rounded text-xs font-semibold transition-all transform active:scale-95"
                            >
                                <IoChatbubbleEllipses className="w-3 h-3 icon-glow" />
                                Send Invite
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                // Placeholder to maintain spacing when grouped
                <div className="w-8 shrink-0"></div>
            )}

            {/* Message Bubble */}
            <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'} max-w-[70%]`}>
                {!isOwnMessage && !isGrouped && (
                    <span className="text-xs text-[#9290C3]/60 mb-1 ml-1">{username}</span>
                )}

                <div
                    className={`px-4 py-2 rounded-2xl ${isOwnMessage
                        ? 'bg-[#535C91] text-white rounded-br-none'
                        : 'bg-[#1B1A55] text-[#9290C3] rounded-bl-none'
                        } shadow-md`}
                >
                    <div className="text-sm break-words">
                        {renderMessageContent()}
                    </div>
                </div>

                {!isGrouped && (
                    <span className="text-[10px] text-[#9290C3]/40 mt-1 mx-1">
                        {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
                    </span>
                )}
            </div>
        </div>
    )
}

