'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, X, Bell } from 'lucide-react'

interface NotificationBannerProps {
    message: string
    severity: 'low' | 'medium' | 'high'
    asteroidName: string
    onDismiss: () => void
}

export function NotificationBanner({
    message,
    severity,
    asteroidName,
    onDismiss,
}: NotificationBannerProps) {
    const [isVisible, setIsVisible] = useState(true)

    useEffect(() => {
        // Auto-dismiss after 10 seconds
        const timer = setTimeout(() => {
            setIsVisible(false)
            setTimeout(onDismiss, 300)
        }, 10000)

        return () => clearTimeout(timer)
    }, [onDismiss])

    const getSeverityStyles = () => {
        switch (severity) {
            case 'high':
                return 'bg-red-500/20 border-red-500 text-red-100'
            case 'medium':
                return 'bg-yellow-500/20 border-yellow-500 text-yellow-100'
            default:
                return 'bg-blue-500/20 border-blue-500 text-blue-100'
        }
    }

    const handleDismiss = () => {
        setIsVisible(false)
        setTimeout(onDismiss, 300)
    }

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -50 }}
                    className={`fixed top-24 left-1/2 transform -translate-x-1/2 z-50 max-w-2xl w-full mx-4`}
                >
                    <div
                        className={`${getSeverityStyles()} backdrop-blur-md border-2 rounded-lg shadow-2xl p-4 flex items-center gap-4`}
                    >
                        <div className="flex-shrink-0">
                            {severity === 'high' ? (
                                <AlertCircle className="w-6 h-6 animate-pulse" />
                            ) : (
                                <Bell className="w-6 h-6" />
                            )}
                        </div>
                        <div className="flex-1">
                            <div className="font-semibold">{asteroidName}</div>
                            <div className="text-sm opacity-90">{message}</div>
                        </div>
                        <button
                            onClick={handleDismiss}
                            className="flex-shrink-0 hover:opacity-70 transition-opacity"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
