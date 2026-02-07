'use client'

import { formatDistanceToNow } from 'date-fns'

interface ChatMessageProps {
    username: string
    message: string
    timestamp: Date
    isOwnMessage?: boolean
    asteroidMention?: string
}

export function ChatMessage({
    username,
    message,
    timestamp,
    isOwnMessage = false,
    asteroidMention,
}: ChatMessageProps) {
    return (
        <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-3`}>
            <div
                className={`max-w-[75%] ${isOwnMessage
                        ? 'bg-[#535C91] text-white'
                        : 'bg-[#1B1A55] text-[#9290C3]'
                    } rounded-lg px-4 py-2 shadow-md`}
            >
                {!isOwnMessage && (
                    <div className="text-xs font-semibold text-[#9290C3] mb-1">
                        {username}
                    </div>
                )}

                <div className="text-sm break-words">
                    {message.split(/(@\d{4}[A-Z]{2}\d+)/).map((part, index) => {
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
                        return <span key={index}>{part}</span>
                    })}
                </div>

                <div className="text-xs text-gray-400 mt-1">
                    {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
                </div>
            </div>
        </div>
    )
}
