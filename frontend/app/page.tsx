'use client'

import Hero from '@/components/ui/animated-shader-hero'
import { Shield, Globe, Zap } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function LandingPage() {
    const router = useRouter()
    const [isAuthenticated, setIsAuthenticated] = useState(false)

    useEffect(() => {
        const checkAuth = () => {
            const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
            setIsAuthenticated(!!token)
        }

        checkAuth()

        // Listen for auth changes
        const handleAuthChange = () => checkAuth()
        window.addEventListener('storage', handleAuthChange)
        window.addEventListener('auth-change', handleAuthChange)

        return () => {
            window.removeEventListener('storage', handleAuthChange)
            window.removeEventListener('auth-change', handleAuthChange)
        }
    }, [])

    return (
        <div className="min-h-screen bg-cosmic-deep">
            <Hero
                trustBadge={{
                    text: "Powered by NASA NeoWs API",
                    icons: [<Shield key="shield" className="w-4 h-4" />, <Globe key="globe" className="w-4 h-4" />, <Zap key="zap" className="w-4 h-4" />]
                }}
                headline={{
                    line1: "Monitor Near-Earth",
                    line2: "Objects in Real-Time"
                }}
                subtitle="Advanced orbital tracking and impact risk assessment for planetary defense. Join the community to stay informed and help protect our planet."
                buttons={{
                    primary: {
                        text: isAuthenticated ? "View Dashboard" : "Login",
                        onClick: () => router.push(isAuthenticated ? '/dashboard' : '/login')
                    },
                    secondary: {
                        text: "Explore Simulation",
                        onClick: () => router.push('/simulation')
                    }
                }}
            />
        </div>
    )
}
