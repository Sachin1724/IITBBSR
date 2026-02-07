'use client'

import { motion } from 'framer-motion'
import { IoCalendar, IoLocation, IoFlash } from 'react-icons/io5'

interface HistoricalImpact {
    _id: string
    name: string
    date: string
    location: string
    energy: string
    impactType: string
    description: string
}

interface ImpactTimelineProps {
    impacts: HistoricalImpact[]
}

export function ImpactTimeline({ impacts }: ImpactTimelineProps) {
    return (
        <div className="relative border-l border-[#535C91]/30 ml-4 md:ml-8 space-y-12">
            {impacts.map((impact, index) => (
                <motion.div
                    key={impact._id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="relative pl-8 md:pl-12"
                >
                    {/* Timeline Dot */}
                    <div className="absolute left-[-5px] top-2 w-2.5 h-2.5 rounded-full bg-cosmic-lavender shadow-[0_0_10px_rgba(146,144,195,0.8)]" />

                    {/* Content Card */}
                    <div className="bg-[#1B1A55]/40 backdrop-blur-sm border border-[#535C91]/30 rounded-xl p-6 hover:bg-[#1B1A55]/60 transition-colors group">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                            <div>
                                <h3 className="text-2xl font-bold text-white group-hover:text-white transition-colors font-[family-name:var(--font-space-grotesk)]">
                                    {impact.name}
                                </h3>
                                <div className="flex flex-wrap gap-4 mt-2 text-sm text-[#9290C3]">
                                    <div className="flex items-center gap-1.5">
                                        <IoCalendar className="w-4 h-4 icon-glow" />
                                        <span>{new Date(impact.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <IoLocation className="w-4 h-4 icon-glow" />
                                        <span>{impact.location}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 bg-red-500/10 text-red-300 px-3 py-1 rounded-full text-sm font-medium border border-red-500/20 self-start">
                                <IoFlash className="w-4 h-4 icon-glow" />
                                {impact.energy}
                            </div>
                        </div>

                        <p className="text-[#9290C3]/80 leading-relaxed">
                            {impact.description}
                        </p>

                        <div className="mt-4 pt-4 border-t border-[#535C91]/20 flex justify-between items-center text-xs text-[#9290C3]/60">
                            <span className="uppercase tracking-wider">Type: {impact.impactType}</span>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    )
}

