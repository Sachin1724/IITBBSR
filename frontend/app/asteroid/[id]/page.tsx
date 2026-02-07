'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ExternalLink, Bookmark, Bell, MessageCircle } from 'lucide-react'
import { asteroidAPI, type Asteroid } from '@/lib/api'
import { formatDistance, formatVelocity, formatDiameter, getRiskLevel, calculateRiskScore } from '@/lib/utils'

export default function AsteroidDetailPage() {
    const params = useParams()
    const [asteroid, setAsteroid] = useState<Asteroid | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (params.id) {
            fetchAsteroid(params.id as string)
        }
    }, [params.id])

    const fetchAsteroid = async (id: string) => {
        try {
            const response = await asteroidAPI.getById(id)
            const data = response.data

            const approach = data.close_approach_data[0]
            const diameter = (data.estimated_diameter.kilometers.estimated_diameter_min +
                data.estimated_diameter.kilometers.estimated_diameter_max) / 2

            const riskScore = calculateRiskScore(
                diameter * 1000,
                parseFloat(approach.relative_velocity.kilometers_per_hour),
                parseFloat(approach.miss_distance.kilometers),
                data.is_potentially_hazardous_asteroid
            )

            setAsteroid({ ...data, riskScore })
        } catch (error) {
            console.error('Failed to fetch asteroid:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cosmic-lavender"></div>
            </div>
        )
    }

    if (!asteroid) {
        return (
            <div className="container mx-auto px-6 py-8">
                <div className="glass-card p-12 text-center">
                    <h2 className="text-2xl font-bold text-white mb-2">Asteroid Not Found</h2>
                    <p className="text-cosmic-lavender/70">The requested asteroid could not be found.</p>
                </div>
            </div>
        )
    }

    const approach = asteroid.close_approach_data[0]
    const diameter = (asteroid.estimated_diameter.kilometers.estimated_diameter_min +
        asteroid.estimated_diameter.kilometers.estimated_diameter_max) / 2
    const risk = getRiskLevel(asteroid.riskScore || 0)

    return (
        <div className="container mx-auto px-6 py-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-4xl font-bold text-white mb-2 font-[family-name:var(--font-space-grotesk)]">
                    {asteroid.name}
                </h1>
                <p className="text-cosmic-lavender/70">ID: {asteroid.id}</p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Risk Score */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="glass-card p-6"
                    >
                        <h2 className="text-xl font-bold text-white mb-4">Risk Assessment</h2>
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-cosmic-lavender/70">Risk Score</span>
                            <span className={`text-3xl font-bold ${risk.color}`}>{asteroid.riskScore}/100</span>
                        </div>
                        <div className="w-full h-4 bg-cosmic-dark rounded-full overflow-hidden mb-4">
                            <div
                                className={`h-full ${risk.bgColor.replace('/20', '')}`}
                                style={{ width: `${asteroid.riskScore}%` }}
                            />
                        </div>
                        <div className={`inline-block px-4 py-2 rounded-full ${risk.bgColor} ${risk.color} font-bold`}>
                            {risk.level} RISK
                        </div>
                    </motion.div>

                    {/* Orbital Data */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="glass-card p-6"
                    >
                        <h2 className="text-xl font-bold text-white mb-4">Orbital Parameters</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <DataItem label="Diameter" value={formatDiameter(diameter * 1000)} />
                            <DataItem label="Velocity" value={formatVelocity(parseFloat(approach.relative_velocity.kilometers_per_hour))} />
                            <DataItem label="Miss Distance" value={formatDistance(parseFloat(approach.miss_distance.kilometers))} />
                            <DataItem label="Close Approach" value={new Date(approach.close_approach_date).toLocaleDateString()} />
                            <DataItem label="Magnitude" value={asteroid.absolute_magnitude_h.toFixed(2)} />
                            <DataItem label="Hazardous" value={asteroid.is_potentially_hazardous_asteroid ? 'Yes' : 'No'} />
                        </div>
                    </motion.div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Actions */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="glass-card p-6"
                    >
                        <h3 className="text-lg font-bold text-white mb-4">Actions</h3>
                        <div className="space-y-3">
                            <button className="btn-primary w-full flex items-center justify-center space-x-2">
                                <Bookmark className="w-4 h-4" />
                                <span>Add to Watchlist</span>
                            </button>
                            <button className="btn-secondary w-full flex items-center justify-center space-x-2">
                                <Bell className="w-4 h-4" />
                                <span>Set Alert</span>
                            </button>
                            <a
                                href={asteroid.nasa_jpl_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-secondary w-full flex items-center justify-center space-x-2"
                            >
                                <ExternalLink className="w-4 h-4" />
                                <span>NASA JPL</span>
                            </a>
                        </div>
                    </motion.div>

                    {/* Chat Preview */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="glass-card p-6"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-white">Community Chat</h3>
                            <MessageCircle className="w-5 h-5 text-cosmic-lavender" />
                        </div>
                        <p className="text-cosmic-lavender/70 text-sm mb-4">
                            Discuss this asteroid with other enthusiasts
                        </p>
                        <button className="btn-primary w-full">Join Chat</button>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}

function DataItem({ label, value }: { label: string; value: string | number }) {
    return (
        <div>
            <p className="text-cosmic-lavender/70 text-sm mb-1">{label}</p>
            <p className="text-white font-medium">{value}</p>
        </div>
    )
}
