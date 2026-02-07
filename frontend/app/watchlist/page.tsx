'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Bookmark, Trash2 } from 'lucide-react'
import { watchlistAPI, asteroidAPI, type Asteroid } from '@/lib/api'
import AsteroidCard from '@/components/AsteroidCard'

export default function WatchlistPage() {
    const [asteroids, setAsteroids] = useState<Asteroid[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchWatchlist()
    }, [])

    const fetchWatchlist = async () => {
        try {
            const watchlistResponse = await watchlistAPI.getAll()
            const asteroidPromises = watchlistResponse.data.map((item) =>
                asteroidAPI.getById(item.asteroidId)
            )
            const asteroidResponses = await Promise.all(asteroidPromises)
            setAsteroids(asteroidResponses.map((res) => res.data))
        } catch (error) {
            console.error('Failed to fetch watchlist:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container mx-auto px-6 py-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <div className="flex items-center space-x-3 mb-4">
                    <Bookmark className="w-8 h-8 text-cosmic-lavender" />
                    <h1 className="text-4xl font-bold text-gradient font-[family-name:var(--font-space-grotesk)]">
                        Your Watchlist
                    </h1>
                </div>
                <p className="text-cosmic-lavender/70">
                    Track your favorite asteroids and receive alerts for close approaches
                </p>
            </motion.div>

            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cosmic-lavender"></div>
                </div>
            ) : asteroids.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-card p-12 text-center"
                >
                    <Bookmark className="w-16 h-16 text-cosmic-lavender/30 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Your watchlist is empty</h3>
                    <p className="text-cosmic-lavender/70 mb-6">
                        Start adding asteroids to track their movements and receive alerts
                    </p>
                    <a href="/" className="btn-primary inline-block">
                        Browse Asteroids
                    </a>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {asteroids.map((asteroid, index) => (
                        <AsteroidCard key={asteroid.id} asteroid={asteroid} delay={index * 0.05} />
                    ))}
                </div>
            )}
        </div>
    )
}
