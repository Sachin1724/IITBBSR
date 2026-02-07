'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { IoWarning, IoTrendingUp, IoCalendar, IoSearch, IoGlobe, IoList } from 'react-icons/io5'
import { asteroidAPI, type Asteroid } from '@/lib/api'
import { calculateRiskScore } from '@/lib/utils'
import AsteroidCard from '@/components/AsteroidCard'
import StatsCard from '@/components/StatsCard'
import { OrbitalView } from '@/components/visualization/OrbitalView'

export default function DashboardPage() {
    const [asteroids, setAsteroids] = useState<Asteroid[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [viewMode, setViewMode] = useState<'list' | 'orbital'>('list')

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

    // Transform asteroids for orbital view
    const orbitalAsteroids = asteroids.map((a) => ({
        id: a.id,
        name: a.name,
        closeApproachDate: a.close_approach_data[0].close_approach_date,
        missDistance: parseFloat(a.close_approach_data[0].miss_distance.kilometers) / 384400,
        velocity: parseFloat(a.close_approach_data[0].relative_velocity.kilometers_per_hour) / 3600,
        diameter:
            ((a.estimated_diameter.kilometers.estimated_diameter_min +
                a.estimated_diameter.kilometers.estimated_diameter_max) /
                2) * 1000,
        isHazardous: a.is_potentially_hazardous_asteroid,
    }))

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
        <div className="min-h-screen bg-cosmic-deep pt-20">
            <div className="container mx-auto px-6 py-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-8"
                >
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 font-doto">
                        Asteroid Tracker
                    </h1>
                    <p className="text-cosmic-lavender/70 text-lg">
                        Live data stream of potential hazards and close approaches
                    </p>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatsCard
                        title="Total Tracked"
                        value={stats.total}
                        icon={<IoTrendingUp className="w-6 h-6 icon-glow" />}
                        color="cosmic-lavender"
                        delay={0}
                    />
                    <StatsCard
                        title="Potentially Hazardous"
                        value={stats.hazardous}
                        icon={<IoWarning className="w-6 h-6 icon-glow" />}
                        color="red-400"
                        delay={0.1}
                    />
                    <StatsCard
                        title="High Risk"
                        value={stats.highRisk}
                        icon={<IoWarning className="w-6 h-6 icon-glow" />}
                        color="orange-400"
                        delay={0.2}
                    />
                    <StatsCard
                        title="Approaching (7 days)"
                        value={stats.approaching}
                        icon={<IoCalendar className="w-6 h-6 icon-glow" />}
                        color="yellow-400"
                        delay={0.3}
                    />
                </div>

                {/* View Toggle */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="mb-6 flex items-center gap-4"
                >
                    <div className="flex bg-[#1B1A55] rounded-lg p-1 border border-[#535C91]/30">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${viewMode === 'list'
                                ? 'bg-[#535C91] text-white'
                                : 'text-[#9290C3] hover:text-white'
                                }`}
                        >
                            <IoList className="w-4 h-4 icon-glow" />
                            <span>List View</span>
                        </button>
                        <button
                            onClick={() => setViewMode('orbital')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${viewMode === 'orbital'
                                ? 'bg-[#535C91] text-white'
                                : 'text-[#9290C3] hover:text-white'
                                }`}
                        >
                            <IoGlobe className="w-4 h-4 icon-glow" />
                            <span>Orbital View</span>
                        </button>
                    </div>

                    {viewMode === 'list' && (
                        <div className="flex-1 relative">
                            <IoSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-cosmic-lavender/50 w-5 h-5 icon-glow" />
                            <input
                                type="text"
                                placeholder="Search asteroids by name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="input-cosmic pl-12 w-full"
                            />
                        </div>
                    )}
                </motion.div>

                {/* Content */}
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cosmic-lavender"></div>
                    </div>
                ) : viewMode === 'orbital' ? (
                    <OrbitalView asteroids={orbitalAsteroids} />
                ) : (
                    <>
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filteredAsteroids.map((asteroid, index) => (
                                <AsteroidCard key={asteroid.id} asteroid={asteroid} delay={index * 0.05} />
                            ))}
                        </div>

                        {filteredAsteroids.length === 0 && (
                            <div className="text-center py-16">
                                <p className="text-cosmic-lavender/50 text-lg">No asteroids found</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
