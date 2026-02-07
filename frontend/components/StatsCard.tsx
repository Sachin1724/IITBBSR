'use client'

import { motion } from 'framer-motion'

interface StatsCardProps {
    title: string
    value: number
    icon: React.ReactNode
    color: string
    delay?: number
}

export default function StatsCard({ title, value, icon, color, delay = 0 }: StatsCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay }}
            className="glass-card p-6 relative overflow-hidden group hover:scale-105 transition-transform duration-300"
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-white/70 text-sm mb-2">{title}</p>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: delay + 0.2 }}
                        className={`text-4xl font-bold text-${color}`}
                    >
                        {value}
                    </motion.p>
                </div>
                <div className={`text-${color} opacity-50 group-hover:opacity-100 transition-opacity`}>
                    {icon}
                </div>
            </div>

            {/* Animated background */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cosmic-lavender/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </motion.div>
    )
}

