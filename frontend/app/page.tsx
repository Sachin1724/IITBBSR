'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, TrendingUp, Calendar, Search } from 'lucide-react'
import { asteroidAPI, type Asteroid } from '@/lib/api'
import { calculateRiskScore, getRiskLevel } from '@/lib/utils'
import AsteroidCard from '@/components/AsteroidCard'
import StatsCard from '@/components/StatsCard'

export default function DashboardPage() {
    const [asteroids, setAsteroids] = useState<Asteroid[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        fetchAsteroids()
    }, [])

    const fetchAsteroids = async () => {
        try {
            const response = await asteroidAPI.getAll()
            const asteroidsWithRisk = response.data.map((asteroid) => {
                const approach = asteroid.close_approach_data[0]
                const diameter =
                    (asteroid.estimated_diameter.kilometers.estimated_diameter_min +
                        asteroid.estimated_diameter.kilometers.estimated_diameter_max) /
                    2
                const velocity = parseFloat(approach.relative_velocity.kilometers_per_hour)
                const missDistance = parseFloat(approach.miss_distance.kilometers)

                return {
                    ...asteroid,
                    riskScore: calculateRiskScore(
                        diameter * 1000,
                        velocity,
                        missDistance,
                        asteroid.is_potentially_hazardous_asteroid
                    ),
                }
            })
            setAsteroids(asteroidsWithRisk.sort((a, b) => (b.riskScore || 0) - (a.riskScore || 0)))
        } catch (error) {
            console.error('Failed to fetch asteroids:', error)
        } finally {
            setLoading(false)
        }
    }

    const filteredAsteroids = asteroids.filter((asteroid) =>
        asteroid.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const stats = {
        total: asteroids.length,
        hazardous: asteroids.filter((a) => a.is_potentially_hazardous_asteroid).length,
        highRisk: asteroids.filter((a) => (a.riskScore || 0) >= 50).length,
        approaching: asteroids.filter((a) => {
            const approachDate = new Date(a.close_approach_data[0].close_approach_date)
            const daysUntil = (approachDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
            return daysUntil <= 7
        }).length,
    }

    return (
        <div className="container mx-auto px-6 py-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-5xl font-bold text-gradient mb-4 font-[family-name:var(--font-space-grotesk)]">
                    Near-Earth Object Dashboard
                </h1>
                <p className="text-cosmic-lavender/70 text-lg">
                    Real-time monitoring of asteroids and their trajectories
                </p>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatsCard
                    title="Total Tracked"
                    value={stats.total}
                    icon={<TrendingUp className="w-6 h-6" />}
                    color="cosmic-lavender"
                    delay={0}
                />
                <StatsCard
                    title="Potentially Hazardous"
                    value={stats.hazardous}
                    icon={<AlertTriangle className="w-6 h-6" />}
                    color="red-400"
                    delay={0.1}
                />
                <StatsCard
                    title="High Risk"
                    value={stats.highRisk}
                    icon={<AlertTriangle className="w-6 h-6" />}
                    color="orange-400"
                    delay={0.2}
                />
                <StatsCard
                    title="Approaching (7 days)"
                    value={stats.approaching}
                    icon={<Calendar className="w-6 h-6" />}
                    color="yellow-400"
                    delay={0.3}
                />
            </div>

            {/* Search */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mb-8"
            >
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-cosmic-lavender/50 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search asteroids by name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input-cosmic pl-12"
                    />
                </div>
            </motion.div>

            {/* Asteroids Grid */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cosmic-lavender"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredAsteroids.map((asteroid, index) => (
                        <AsteroidCard key={asteroid.id} asteroid={asteroid} delay={index * 0.05} />
                    ))}
                </div>
            )}

            {filteredAsteroids.length === 0 && !loading && (
                <div className="text-center py-16">
                    <p className="text-cosmic-lavender/50 text-lg">No asteroids found</p>
                </div>
            )}
        </div>
    )
}
