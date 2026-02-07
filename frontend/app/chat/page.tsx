'use client'

import { motion } from 'framer-motion'
import { MessageSquare, Users, Info } from 'lucide-react'
import { ChatPanel } from '@/components/chat/ChatPanel'

export default function ChatPage() {
    return (
        <div className="max-w-7xl mx-auto px-6 py-12 h-[calc(100vh-100px)] flex flex-col">
            <header className="mb-8 shrink-0">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 bg-cosmic-lavender/10 rounded-xl">
                        <MessageSquare className="w-6 h-6 text-gradient" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold text-gradient font-[family-name:var(--font-space-grotesk)]">
                            Research Community
                        </h1>
                        <p className="text-white/70">Real-time collaboration for NEO researchers</p>
                    </div>
                </div>
            </header>

            <div className="flex-1 min-h-0 flex gap-6">
                {/* Main Chat Area */}
                <div className="flex-1 glass-card overflow-hidden flex flex-col relative">
                    <ChatPanel isFullPage />
                </div>

                {/* Sidebar Info - Hidden on mobile */}
                <div className="hidden lg:flex w-80 flex-col gap-6">
                    <div className="glass-card p-6">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Info className="w-5 h-5 text-white" />
                            Channel Info
                        </h2>
                        <div className="space-y-4 text-sm text-white/70">
                            <p>
                                Welcome to the general research channel. Use this space to discuss current asteroid trajectories and potential impact scenarios.
                            </p>
                            <div className="pt-4 border-t border-white/10">
                                <h3 className="text-white font-medium mb-2">Guidelines</h3>
                                <ul className="list-disc list-inside space-y-1">
                                    <li>Be respectful to others</li>
                                    <li>Share verified data only</li>
                                    <li>Keep discussions on topic</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card p-6 flex-1">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Users className="w-5 h-5 text-white" />
                            Online Researchers
                        </h2>
                        <div className="text-center py-8 text-white/50 text-sm">
                            Real-time presence list coming soon...
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}


