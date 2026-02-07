import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Space_Grotesk } from 'next/font/google'
import './globals.css'
import Navigation from '@/components/Navigation'
import Starfield from '@/components/Starfield'
import { ChatProvider } from '@/contexts/ChatContext'
import { ChatPanel } from '@/components/chat/ChatPanel'

const plusJakartaScans = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-plus-jakarta' })
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk' })

export const metadata: Metadata = {
    title: 'Cosmic Watch - NEO Monitoring Platform',
    description: 'Real-time Near-Earth Object monitoring and risk analysis platform',
    keywords: ['asteroids', 'NEO', 'NASA', 'space', 'astronomy'],
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className="dark">
            <body className={`${plusJakartaScans.variable} ${spaceGrotesk.variable} font-sans`}>
                <ChatProvider>
                    <Starfield />
                    <Navigation />
                    <main className="min-h-screen pt-20">
                        {children}
                    </main>
                    <ChatPanel />
                </ChatProvider>
            </body>
        </html>
    )
}
