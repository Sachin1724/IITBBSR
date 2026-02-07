'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ExternalLink, Bookmark, Bell, MessageCircle, Info, ArrowLeft, X } from 'lucide-react'
import { asteroidAPI, type Asteroid, watchlistAPI, alertAPI } from '@/lib/api'
import { formatDistance, formatVelocity, formatDiameter, getRiskLevel, calculateRiskScore } from '@/lib/utils'
import { OrbitalView } from '@/components/visualization/OrbitalView'

export default function AsteroidDetailPage() {
    const params = useParams()
    const [asteroid, setAsteroid] = useState<Asteroid | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [isWatched, setIsWatched] = useState(false)
    const [showAlertModal, setShowAlertModal] = useState(false)
    const [alertThreshold, setAlertThreshold] = useState(50)

    useEffect(() => {
        if (params.id) {
            fetchAsteroid(params.id as string)
        }
    }, [params.id])

    useEffect(() => {
        if (asteroid) {
            checkWatchlistStatus()
        }
    }, [asteroid])

    const fetchAsteroid = async (id: string) => {
        try {
            setLoading(true)
            const response = await asteroidAPI.getById(id)
            const data = response.data

            const approach = data.close_approach_data && data.close_approach_data.length > 0
                ? data.close_approach_data[0]
                : null

            // Calculate risk score if not present
            let riskScore = data.riskScore
            if (riskScore === undefined && approach) {
                const diameterMin = data.estimated_diameter?.kilometers?.estimated_diameter_min || 0;
                const diameterMax = data.estimated_diameter?.kilometers?.estimated_diameter_max || 0;
                const avgDiameter = (diameterMin + diameterMax) / 2;

                riskScore = calculateRiskScore(
                    avgDiameter * 1000,
                    parseFloat(approach.relative_velocity.kilometers_per_hour),
                    parseFloat(approach.miss_distance.kilometers),
                    data.is_potentially_hazardous_asteroid
                )
            }

            setAsteroid({ ...data, riskScore })
        } catch (error) {
            console.error('Failed to fetch asteroid:', error)
            setError('Asteroid not found or failed to load data.')
        } finally {
            setLoading(false)
        }
    }

    const checkWatchlistStatus = async () => {
        try {
            const res = await watchlistAPI.getAll()
            if (res.data.some((item: any) => item.asteroidId === asteroid?.id)) {
                setIsWatched(true)
            }
        } catch (e) {
            console.error('Failed to check watchlist status', e)
        }
    }

    const handleToggleWatchlist = async () => {
        if (!asteroid) return
        try {
            if (isWatched) {
                await watchlistAPI.remove(asteroid.id)
                setIsWatched(false)
            } else {
                await watchlistAPI.add(asteroid.id)
                setIsWatched(true)
            }
        } catch (err) {
            console.error(err)
            alert('Failed to update watchlist')
        }
    }

    const handleCreateAlert = async () => {
        if (!asteroid) return
        try {
            await alertAPI.create({ asteroidId: asteroid.id, threshold: alertThreshold })
            setShowAlertModal(false)
            alert(`Alert set for risk score > ${alertThreshold}`)
        } catch (err) {
            console.error(err)
            alert('Failed to create alert')
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-20">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cosmic-lavender"></div>
            </div>
        )
    }

    if (!asteroid || error) {
        return (
            <div className="container mx-auto px-6 py-8 pt-24">
                <div className="glass-card p-12 text-center max-w-2xl mx-auto">
                    <h2 className="text-2xl font-bold text-white mb-2">Asteroid Not Found</h2>
                    <p className="text-cosmic-lavender/70 mb-6">{error || "The requested asteroid could not be found."}</p>
                    <a href="/dashboard" className="btn-primary inline-flex items-center">Return to Dashboard</a>
                </div>
            </div>
        )
    }

    const approach = asteroid.close_approach_data?.[0]
    const diameterMin = asteroid.estimated_diameter?.kilometers?.estimated_diameter_min || 0
    const diameterMax = asteroid.estimated_diameter?.kilometers?.estimated_diameter_max || 0
    const diameterAvg = (diameterMin + diameterMax) / 2
    const risk = getRiskLevel(asteroid.riskScore || 0)

    // Prepare data for OrbitalView
    const mappedAsteroidForView = {
        id: asteroid.id,
        name: asteroid.name,
        closeApproachDate: approach?.close_approach_date || new Date().toISOString(),
        missDistanceValue: approach ? parseFloat(approach.miss_distance.kilometers) : 0,
        velocity: approach ? parseFloat(approach.relative_velocity.kilometers_per_hour) / 3600 : 0, // km/s
        diameter: diameterAvg * 1000, // meters
        isHazardous: asteroid.is_potentially_hazardous_asteroid,
        orbitalData: asteroid.orbital_data ? {
            semiMajorAxis: parseFloat(asteroid.orbital_data.semi_major_axis),
            eccentricity: parseFloat(asteroid.orbital_data.eccentricity),
            inclination: parseFloat(asteroid.orbital_data.inclination),
            longitudeAscendingNode: parseFloat(asteroid.orbital_data.ascending_node_longitude),
            perihelionArgument: parseFloat(asteroid.orbital_data.perihelion_argument),
        } : undefined
    }

    const orbitalViewProp = [{
        ...mappedAsteroidForView,
        missDistance: mappedAsteroidForView.missDistanceValue,
    }]

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6">
            <div className="max-w-7xl mx-auto">
                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 text-cosmic-lavender hover:text-white transition-colors mb-6 group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Dashboard
                </Link>

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl md:text-5xl font-bold text-white font-[family-name:var(--font-space-grotesk)]">
                                {asteroid.name}
                            </h1>
                            {asteroid.is_potentially_hazardous_asteroid && (
                                <span className="bg-red-500/20 text-red-400 border border-red-500/50 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                    Hazardous
                                </span>
                            )}
                        </div>
                        <p className="text-cosmic-lavender/70 font-mono text-sm">SPK-ID: {asteroid.id}</p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => {
                                const diameter = asteroid.estimated_diameter?.kilometers?.estimated_diameter_max || 0.1
                                const velocity = parseInt(asteroid.close_approach_data?.[0]?.relative_velocity?.kilometers_per_hour || '72000') / 1000
                                const composition = asteroid.is_potentially_hazardous_asteroid ? 'metallic' : 'rocky'
                                const angle = 45

                                window.location.href = `/simulation?diameter=${diameter}&velocity=${velocity}&composition=${composition}&angle=${angle}&name=${encodeURIComponent(asteroid.name)}`
                            }}
                            className="btn-cosmic flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            <span className="hidden sm:inline">Simulate</span>
                        </button>
                        <button
                            onClick={handleToggleWatchlist}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${isWatched
                                ? 'bg-cosmic-nebula text-white shadow-lg shadow-cosmic-nebula/20'
                                : 'btn-secondary'
                                }`}
                        >
                            <Bookmark className={`w-4 h-4 ${isWatched ? 'fill-white' : ''}`} />
                            <span className="hidden sm:inline">{isWatched ? 'Watched' : 'Watch'}</span>
                        </button>
                        <button
                            onClick={() => setShowAlertModal(true)}
                            className="btn-secondary flex items-center gap-2"
                        >
                            <Bell className="w-4 h-4" />
                            <span className="hidden sm:inline">Alert</span>
                        </button>
                        <a
                            href={asteroid.nasa_jpl_url}
                            target="_blank"
                            rel="noreferrer"
                            className="btn-primary flex items-center gap-2"
                        >
                            <ExternalLink className="w-4 h-4" />
                            <span className="hidden sm:inline">NASA JPL</span>
                        </a>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                    {/* Left Column: 3D Visualization (5 cols) */}
                    <div className="xl:col-span-5 flex flex-col gap-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-card overflow-hidden h-[500px] relative rounded-2xl border border-cosmic-lavender/10 shadow-2xl"
                        >
                            <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                    Live Orbit View
                                </span>
                            </div>
                            <OrbitalView asteroids={orbitalViewProp} />
                        </motion.div>

                        {/* Risk Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="glass-card p-6"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-white">Impact Probability</h3>
                                <div className={`px-3 py-1 rounded-full text-xs font-bold ${risk.bgColor} ${risk.color}`}>
                                    {risk.level} RISK
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-white/5 p-3 rounded-lg">
                                    <div className="text-xs text-cosmic-lavender mb-1">Risk Score</div>
                                    <div className={`text-2xl font-bold ${risk.color}`}>{asteroid.riskScore?.toFixed(1) ?? '0.0'}</div>
                                </div>
                                <div className="bg-white/5 p-3 rounded-lg">
                                    <div className="text-xs text-cosmic-lavender mb-1">Condition Code</div>
                                    <div className="text-2xl font-bold text-white">{asteroid.orbital_data?.orbit_uncertainty || 'N/A'}</div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column: Detailed Data (7 cols) */}
                    <div className="xl:col-span-7 space-y-6">
                        {/* Dimensional & Physical */}
                        <DataSection title="Physical Characteristics" delay={0.2}>
                            <DataGrid>
                                <DataItem label="Absolute Magnitude (H)" value={asteroid.absolute_magnitude_h?.toString() ?? 'N/A'} />
                                <DataItem label="Est. Diameter (Min)" value={formatDiameter(diameterMin * 1000)} />
                                <DataItem label="Est. Diameter (Max)" value={formatDiameter(diameterMax * 1000)} />
                                <DataItem label="Est. Diameter (Avg)" value={formatDiameter(diameterAvg * 1000)} />
                                <DataItem label="Is Sentry Object" value={asteroid.is_sentry_object ? "Yes" : "No"} />
                            </DataGrid>
                        </DataSection>

                        {/* Orbital Elements */}
                        <DataSection title="Orbital Elements" delay={0.3}>
                            {asteroid.orbital_data ? (
                                <DataGrid>
                                    <DataItem label="Orbit ID" value={asteroid.orbital_data.orbit_id} />
                                    <DataItem label="Orbit Class" value={asteroid.orbital_data.orbit_class?.orbit_class_type || 'N/A'} subValue={asteroid.orbital_data.orbit_class?.orbit_class_description} />
                                    <DataItem label="Semimajor Axis" value={`${parseFloat(asteroid.orbital_data.semi_major_axis).toFixed(4)} AU`} />
                                    <DataItem label="Eccentricity" value={parseFloat(asteroid.orbital_data.eccentricity).toFixed(4)} />
                                    <DataItem label="Inclination" value={`${parseFloat(asteroid.orbital_data.inclination).toFixed(4)}°`} />
                                    <DataItem label="Orbital Period" value={`${parseFloat(asteroid.orbital_data.orbital_period).toFixed(2)} days`} />
                                    <DataItem label="Perihelion Distance" value={`${parseFloat(asteroid.orbital_data.perihelion_distance).toFixed(4)} AU`} />
                                    <DataItem label="Aphelion Distance" value={`${parseFloat(asteroid.orbital_data.aphelion_distance).toFixed(4)} AU`} />
                                    <DataItem label="Mean Anomaly" value={`${parseFloat(asteroid.orbital_data.mean_anomaly).toFixed(4)}°`} />
                                    <DataItem label="Mean Motion" value={`${parseFloat(asteroid.orbital_data.mean_motion).toFixed(4)}°/day`} />
                                    <DataItem label="First Observation" value={asteroid.orbital_data.first_observation_date} />
                                    <DataItem label="Last Observation" value={asteroid.orbital_data.last_observation_date} />
                                </DataGrid>
                            ) : (
                                <div className="text-cosmic-lavender/60 italic p-4 text-center">Orbital data not available for this object.</div>
                            )}
                        </DataSection>

                        {/* Close Approach */}
                        <DataSection title="Recent Close Approach" delay={0.4}>
                            {approach ? (
                                <DataGrid>
                                    <DataItem label="Date" value={approach.close_approach_date_full} />
                                    <DataItem label="Relative Velocity" value={formatVelocity(parseFloat(approach.relative_velocity.kilometers_per_hour))} subValue={`${parseFloat(approach.relative_velocity.kilometers_per_hour).toFixed(0)} km/h`} />
                                    <DataItem label="Miss Distance (km)" value={formatDistance(parseFloat(approach.miss_distance.kilometers))} />
                                    <DataItem label="Miss Distance (LD)" value={`${(parseFloat(approach.miss_distance.kilometers) / 384400).toFixed(2)} LD`} />
                                </DataGrid>
                            ) : (
                                <div className="text-cosmic-lavender/60 italic p-4 text-center">No close approach data available.</div>
                            )}
                        </DataSection>

                        {/* Community Chat - moved to bottom to be less intrusive in data view */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="glass-card p-6 flex flex-col md:flex-row items-center justify-between gap-4"
                        >
                            <div className="flex items-center gap-4">
                                <div className="bg-cosmic-lavender/10 p-3 rounded-full">
                                    <MessageCircle className="w-6 h-6 text-cosmic-lavender" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">Join the Discussion</h3>
                                    <p className="text-cosmic-lavender/70 text-sm">Chat about {asteroid.name} with other researchers</p>
                                </div>
                            </div>
                            <Link href="/chat" className="btn-primary whitespace-nowrap">Open Community Chat</Link>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Alert Modal */}
            {showAlertModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-card p-6 w-full max-w-sm shadow-2xl border-white/20"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-white">Set Risk Alert</h3>
                            <button onClick={() => setShowAlertModal(false)} className="text-white/50 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <p className="text-sm text-cosmic-lavender/70 mb-4">
                            Receive notifications when this asteroid's calculated risk score exceeds the threshold.
                        </p>

                        <div className="mb-6">
                            <div className="flex justify-between text-xs text-white/70 mb-2">
                                <span>Threshold</span>
                                <span className="font-bold text-cosmic-nebula">{alertThreshold}</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={alertThreshold}
                                onChange={(e) => setAlertThreshold(parseInt(e.target.value))}
                                className="w-full accent-cosmic-nebula h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="flex justify-between text-[10px] text-white/30 mt-1">
                                <span>0 (Low)</span>
                                <span>100 (Critical)</span>
                            </div>
                        </div>

                        <button
                            onClick={handleCreateAlert}
                            className="w-full btn-primary py-2.5"
                        >
                            Create Alert
                        </button>
                    </motion.div>
                </div>
            )}
        </div>
    )
}

function DataSection({ title, children, delay = 0 }: { title: string; children: React.ReactNode; delay?: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="glass-card p-6"
        >
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2 border-b border-white/10 pb-4">
                <Info className="w-4 h-4 text-cosmic-lavender" />
                {title}
            </h3>
            {children}
        </motion.div>
    )
}

function DataGrid({ children }: { children: React.ReactNode }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-8">
            {children}
        </div>
    )
}

function DataItem({ label, value, subValue }: { label: string; value: string; subValue?: string }) {
    return (
        <div className="group">
            <div className="text-xs font-semibold text-cosmic-lavender/50 uppercase tracking-wider mb-1 group-hover:text-cosmic-lavender/80 transition-colors">{label}</div>
            <div className="text-white font-mono font-medium text-sm md:text-base break-words">{value}</div>
            {subValue && <div className="text-xs text-white/40 mt-0.5">{subValue}</div>}
        </div>
    )
}
