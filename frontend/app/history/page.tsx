'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { IoTime, IoCalendar } from 'react-icons/io5'
import { historyAPI } from '@/lib/api'
import { ImpactTimeline } from '@/components/history/ImpactTimeline'

interface HistoricalImpact {
    _id: string
    name: string
    date: string
    location: string
    energy: string
    impactType: string
    description: string
}

export default function HistoryPage() {
    const [impacts, setImpacts] = useState<HistoricalImpact[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchHistory()
    }, [])

    const fetchHistory = async () => {
        try {
            const response = await historyAPI.getAll()
            setImpacts(response.data)
        } catch (error) {
            console.error('Failed to fetch history:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="w-full px-0 py-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto"
            >
                <div className="text-center mb-16">
                    <h1 className="text-5xl font-bold text-gradient mb-6 font-[family-name:var(--font-space-grotesk)]">
                        Historical Impact Database
                    </h1>
                    <p className="text-xl text-[#9290C3] max-w-2xl mx-auto">
                        Explore significant asteroid impact events throughout Earth's history, from ancient craters to modern airbursts.
                    </p>
                </div>

                <div className="bg-[#070F2B]/50 rounded-2xl p-8 border border-[#535C91]/20">
                    <div className="flex items-center gap-4 mb-8 pb-4 border-b border-[#535C91]/30">
                        <IoTime className="w-8 h-8 text-white icon-glow" />
                        <h2 className="text-2xl font-semibold text-white">Impact Timeline</h2>
                        <div className="ml-auto flex items-center gap-2 text-sm text-[#9290C3]">
                            <IoCalendar className="w-4 h-4 icon-glow" />
                            <span>Sorted by Date (Recent First)</span>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cosmic-lavender"></div>
                        </div>
                    ) : (
                        <ImpactTimeline impacts={impacts} />
                    )}
                </div>
            </motion.div>
        </div>
    )
}


