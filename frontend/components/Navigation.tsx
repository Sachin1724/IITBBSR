'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { IoSparkles, IoBookmark, IoHome, IoPerson, IoLogIn, IoTime, IoShield, IoChatbubbles, IoMenu, IoClose } from 'react-icons/io5'
import { NavBar } from '@/components/ui/tubelight-navbar'
import { motion, AnimatePresence } from 'framer-motion'

export default function Navigation() {
    const [isMounted, setIsMounted] = useState(false)
    const pathname = usePathname()
    const [isAdmin, setIsAdmin] = useState(false)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
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
            { name: 'Dashboard', url: '/dashboard', icon: IoHome },
            { name: 'Simulation', url: '/simulation', icon: IoSparkles },
            { name: 'Community', url: '/chat', icon: IoChatbubbles },
            { name: 'Watchlist', url: '/watchlist', icon: IoBookmark },
            { name: 'History', url: '/history', icon: IoTime }
        )

        if (isAdmin) {
            navItems.push({ name: 'Admin', url: '/admin', icon: IoShield })
        }

        navItems.push({ name: 'Profile', url: '/profile', icon: IoPerson })
    } else {
        navItems.push({ name: 'Login', url: '/login', icon: IoLogIn })
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
                    <Link href="/" className="fixed top-6 left-6 z-50 flex items-center space-x-2 group">
                        <div className="relative">
                            <IoSparkles className="w-6 h-6 text-cosmic-lavender group-hover:text-white transition-colors icon-glow" />
                            <div className="absolute inset-0 blur-lg bg-cosmic-lavender/30 group-hover:bg-cosmic-lavender/50 transition-all" />
                        </div>
                        <span className="text-xl font-bold text-white font-[family-name:var(--font-space-grotesk)] hidden md:block">
                            Cosmic Watch
                        </span>
                    </Link>

                    {/* Mobile Menu Toggle Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50 md:hidden p-2 rounded-lg glass-card hover:bg-white/10 transition-all"
                        aria-label="Toggle menu"
                    >
                        {isMobileMenuOpen ? (
                            <IoClose className="w-5 h-5 sm:w-6 sm:h-6 text-white icon-glow" />
                        ) : (
                            <IoMenu className="w-5 h-5 sm:w-6 sm:h-6 text-white icon-glow" />
                        )}
                    </button>

                    {/* Mobile Sidebar Overlay */}
                    <AnimatePresence>
                        {isMobileMenuOpen && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                            />
                        )}
                    </AnimatePresence>

                    {/* Mobile Sidebar */}
                    <AnimatePresence>
                        {isMobileMenuOpen && (
                            <motion.div
                                initial={{ x: '100%' }}
                                animate={{ x: 0 }}
                                exit={{ x: '100%' }}
                                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                className="fixed top-0 right-0 h-full w-[80vw] max-w-[288px] glass-card z-50 md:hidden overflow-y-auto"
                            >
                                <div className="p-4 sm:p-6">
                                    {/* Sidebar Header */}
                                    <div className="flex items-center justify-between mb-6 sm:mb-8">
                                        <div className="flex items-center space-x-2">
                                            <IoSparkles className="w-5 h-5 sm:w-6 sm:h-6 text-cosmic-lavender icon-glow" />
                                            <span className="text-lg sm:text-xl font-bold text-white font-[family-name:var(--font-space-grotesk)]">
                                                Menu
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="p-1.5 sm:p-2 rounded-lg hover:bg-white/10 transition-all"
                                        >
                                            <IoClose className="w-5 h-5 sm:w-6 sm:h-6 text-white icon-glow" />
                                        </button>
                                    </div>

                                    {/* Sidebar Navigation Items */}
                                    <nav className="space-y-1.5 sm:space-y-2">
                                        {navItems.map((item) => {
                                            const Icon = item.icon
                                            const isActive = pathname === item.url
                                            return (
                                                <Link
                                                    key={item.name}
                                                    href={item.url}
                                                    onClick={() => setIsMobileMenuOpen(false)}
                                                    className={`flex items-center space-x-2.5 sm:space-x-3 px-3 py-2.5 sm:px-4 sm:py-3 rounded-lg transition-all text-sm sm:text-base ${isActive
                                                        ? 'bg-gradient-to-r from-orange-500/20 to-orange-600/20 border border-orange-500/30 text-white'
                                                        : 'text-white/70 hover:text-white hover:bg-white/5'
                                                        }`}
                                                >
                                                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 icon-glow flex-shrink-0" />
                                                    <span className="font-medium truncate">{item.name}</span>
                                                </Link>
                                            )
                                        })}
                                    </nav>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Desktop Navigation - Hidden on Mobile */}
                    <div className="hidden md:block">
                        <NavBar items={navItems} />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

