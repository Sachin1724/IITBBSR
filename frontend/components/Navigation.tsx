'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Sparkles, Bookmark, Home, User, LogIn, History, Shield, MessageSquare } from 'lucide-react'
import { NavBar } from '@/components/ui/tubelight-navbar'
import { motion, AnimatePresence } from 'framer-motion'

export default function Navigation() {
    const [isMounted, setIsMounted] = useState(false)
    const pathname = usePathname()
    const [isAdmin, setIsAdmin] = useState(false)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const isHomePage = pathname === '/'
    const [isVisible, setIsVisible] = useState(!isHomePage)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    const checkAuth = () => {
        if (typeof window === 'undefined') return
        const token = localStorage.getItem('token')
        if (token) {
            setIsAuthenticated(true)
            try {
                const payload = JSON.parse(atob(token.split('.')[1]))
                setIsAdmin(payload.role === 'admin')
            } catch (e) { }
        } else {
            setIsAuthenticated(false)
            setIsAdmin(false)
        }
    }

    useEffect(() => {
        checkAuth()
        // Listen for storage events and custom auth events
        window.addEventListener('storage', checkAuth)
        window.addEventListener('auth-change', checkAuth)

        return () => {
            window.removeEventListener('storage', checkAuth)
            window.removeEventListener('auth-change', checkAuth)
        }
    }, [])

    // Re-check on navigation
    useEffect(() => {
        checkAuth()
    }, [pathname])

    useEffect(() => {
        if (!isHomePage) {
            setIsVisible(true)
            return
        }

        const handleScroll = () => {
            // Show nav when scrolled past approx 80vh
            const threshold = window.innerHeight * 0.8
            setIsVisible(window.scrollY > threshold)
        }

        window.addEventListener('scroll', handleScroll)
        handleScroll() // Check initial state
        return () => window.removeEventListener('scroll', handleScroll)
    }, [isHomePage])

    const navItems = []

    if (isAuthenticated) {
        navItems.push(
            { name: 'Dashboard', url: '/dashboard', icon: Home },
            { name: 'Simulation', url: '/simulation', icon: Sparkles },
            { name: 'Community', url: '/chat', icon: MessageSquare },
            { name: 'Watchlist', url: '/watchlist', icon: Bookmark },
            { name: 'History', url: '/history', icon: History }
        )

        if (isAdmin) {
            navItems.push({ name: 'Admin', url: '/admin', icon: Shield })
        }

        navItems.push({ name: 'Profile', url: '/profile', icon: User })
    } else {
        navItems.push({ name: 'Login', url: '/login', icon: LogIn })
    }

    if (!isMounted) return null

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    transition={{ duration: 0.3 }}
                >
                    {/* Top Left Logo */}
                    <Link href="/" className="fixed top-6 left-6 z-50 flex items-center space-x-3 group">
                        <div className="relative">
                            <Sparkles className="w-8 h-8 text-cosmic-lavender group-hover:text-white transition-colors" />
                            <div className="absolute inset-0 blur-lg bg-cosmic-lavender/30 group-hover:bg-cosmic-lavender/50 transition-all" />
                        </div>
                        <span className="text-2xl font-bold text-gradient font-[family-name:var(--font-space-grotesk)] hidden md:block">
                            Cosmic Watch
                        </span>
                    </Link>

                    <NavBar items={navItems} />
                </motion.div>
            )}
        </AnimatePresence>
    )
}
