'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Sparkles, AlertCircle, Bookmark, Home, User, LogIn, History, Shield, MessageSquare } from 'lucide-react'

export default function Navigation() {
    const [isAdmin, setIsAdmin] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const [isAuthenticated, setIsAuthenticated] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20)
        }
        window.addEventListener('scroll', handleScroll)

        // Check authentication and role
        const token = localStorage.getItem('token')
        if (token) {
            setIsAuthenticated(true)
            try {
                const payload = JSON.parse(atob(token.split('.')[1]))
                setIsAdmin(payload.role === 'admin')
            } catch (e) { }
        }

        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass-card shadow-lg' : 'bg-transparent'
                }`}
        >
            <div className="container mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-3 group">
                        <div className="relative">
                            <Sparkles className="w-8 h-8 text-cosmic-lavender group-hover:text-white transition-colors" />
                            <div className="absolute inset-0 blur-lg bg-cosmic-lavender/30 group-hover:bg-cosmic-lavender/50 transition-all" />
                        </div>
                        <span className="text-2xl font-bold text-gradient font-[family-name:var(--font-space-grotesk)]">
                            Cosmic Watch
                        </span>
                    </Link>

                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center space-x-8">
                        <NavLink href="/" icon={<Home className="w-4 h-4" />}>
                            Dashboard
                        </NavLink>
                        <NavLink href="/simulation" icon={<Sparkles className="w-4 h-4" />}>
                            Simulation
                        </NavLink>
                        <NavLink href="/chat" icon={<MessageSquare className="w-4 h-4" />}>
                            Community
                        </NavLink>
                        <NavLink href="/watchlist" icon={<Bookmark className="w-4 h-4" />}>
                            Watchlist
                        </NavLink>
                        <NavLink href="/history" icon={<History className="w-4 h-4" />}>
                            History
                        </NavLink>
                    </div>

                    {/* Auth Section */}
                    <div className="flex items-center space-x-4">
                        {isAdmin && (
                            <Link href="/admin" className="p-2 text-cosmic-lavender hover:text-white transition-colors" title="Admin Dashboard">
                                <Shield className="w-5 h-5" />
                            </Link>
                        )}
                        {isAuthenticated ? (
                            <Link href="/profile" className="btn-secondary flex items-center space-x-2">
                                <User className="w-4 h-4" />
                                <span>Profile</span>
                            </Link>
                        ) : (
                            <Link href="/login" className="btn-primary flex items-center space-x-2">
                                <LogIn className="w-4 h-4" />
                                <span>Login</span>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </motion.nav>
    )
}

function NavLink({ href, icon, children }: { href: string; icon: React.ReactNode; children: React.ReactNode }) {
    return (
        <Link
            href={href}
            className="flex items-center space-x-2 text-cosmic-lavender hover:text-white transition-colors duration-300 group"
        >
            <span className="group-hover:scale-110 transition-transform">{icon}</span>
            <span>{children}</span>
        </Link>
    )
}
