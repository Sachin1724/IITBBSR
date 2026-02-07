'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { AlertTriangle, Maximize2, Zap, Calendar, ExternalLink, Bookmark } from 'lucide-react'
import { type Asteroid } from '@/lib/api'
import { formatDistance, formatVelocity, formatDiameter, getRiskLevel } from '@/lib/utils'
import { useState } from 'react'

interface AsteroidCardProps {
    asteroid: Asteroid
    delay?: number
}

export default function AsteroidCard({ asteroid, delay = 0 }: AsteroidCardProps) {
    const [isBookmarked, setIsBookmarked] = useState(false)
    const approach = asteroid.close_approach_data[0]
    const diameter =
        (asteroid.estimated_diameter.kilometers.estimated_diameter_min +
            asteroid.estimated_diameter.kilometers.estimated_diameter_max) /
        2

    const riskScore = asteroid.riskScore || 0
    const risk = getRiskLevel(riskScore)

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="glass-card-hover p-6 relative overflow-hidden group"
        >
            {/* Risk Badge */}
            <div className="absolute top-4 right-4 flex items-center space-x-2">
                <div className={`px-3 py-1 rounded-full ${risk.bgColor} ${risk.color} text-xs font-bold`}>
                    {risk.level}
                </div>
                {asteroid.is_potentially_hazardous_asteroid && (
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                )}
            </div>

            {/* Bookmark */}
            <button
                onClick={() => setIsBookmarked(!isBookmarked)}
                className="absolute top-4 left-4 p-2 rounded-full bg-cosmic-dark/60 hover:bg-cosmic-dark transition-colors"
            >
                <Bookmark
                    className={`w-4 h-4 ${isBookmarked ? 'fill-cosmic-lavender text-cosmic-lavender' : 'text-cosmic-lavender/50'}`}
                />
            </button>

            {/* Name */}
            <div className="mt-8 mb-4">
                <h3 className="text-xl font-bold text-white mb-1 line-clamp-1">{asteroid.name}</h3>
                <p className="text-cosmic-lavender/60 text-sm">ID: {asteroid.id}</p>
            </div>

            {/* Risk Score */}
            <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-cosmic-lavender/70">Risk Score</span>
                    <span className={`text-lg font-bold ${risk.color}`}>{riskScore}/100</span>
                </div>
                <div className="w-full h-2 bg-cosmic-dark rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${riskScore}%` }}
                        transition={{ delay: delay + 0.2, duration: 0.8 }}
                        className={`h-full ${risk.bgColor.replace('/20', '')}`}
                    />
                </div>
            </div>

            {/* Details Grid */}
            <div className="space-y-3 mb-4">
                <DetailRow
                    icon={<Maximize2 className="w-4 h-4" />}
                    label="Diameter"
                    value={formatDiameter(diameter * 1000)}
                />
                <DetailRow
                    icon={<Zap className="w-4 h-4" />}
                    label="Velocity"
                    value={formatVelocity(parseFloat(approach.relative_velocity.kilometers_per_hour))}
                />
                <DetailRow
                    icon={<AlertTriangle className="w-4 h-4" />}
                    label="Miss Distance"
                    value={formatDistance(parseFloat(approach.miss_distance.kilometers))}
                />
                <DetailRow
                    icon={<Calendar className="w-4 h-4" />}
                    label="Close Approach"
                    value={new Date(approach.close_approach_date).toLocaleDateString()}
                />
            </div>

            {/* Actions */}
            <div className="flex space-x-3">
                <Link href={`/asteroid/${asteroid.id}`} className="btn-primary flex-1 text-center text-sm">
                    View Details
                </Link>
                <a
                    href={asteroid.nasa_jpl_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary p-3"
                >
                    <ExternalLink className="w-4 h-4" />
                </a>
            </div>

            {/* Glow effect on hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-cosmic-lavender/5 to-transparent" />
            </div>
        </motion.div>
    )
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2 text-cosmic-lavender/70">
                {icon}
                <span>{label}</span>
            </div>
            <span className="text-white font-medium">{value}</span>
        </div>
    )
}
