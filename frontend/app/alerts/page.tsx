'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { IoNotifications, IoNotificationsOff, IoSettings, IoTime, IoAlertCircle, IoCheckmarkCircle } from 'react-icons/io5'

interface Alert {
    id: string
    asteroidName: string
    type: 'close_approach' | 'hazard_update' | 'new_discovery'
    message: string
    timestamp: Date
    read: boolean
    severity: 'low' | 'medium' | 'high'
}

export default function AlertsPage() {
    const [alerts, setAlerts] = useState<Alert[]>([])
    const [notificationsEnabled, setNotificationsEnabled] = useState(true)
    const [proximityThreshold, setProximityThreshold] = useState(0.05) // Lunar distances
    const [showSettings, setShowSettings] = useState(false)

    // Mock alerts for demonstration
    useEffect(() => {
        const mockAlerts: Alert[] = [
            {
                id: '1',
                asteroidName: '2024 AB1',
                type: 'close_approach',
                message: 'Close approach detected within 0.03 LD in 3 days',
                timestamp: new Date(Date.now() - 1000 * 60 * 30),
                read: false,
                severity: 'high',
            },
            {
                id: '2',
                asteroidName: '2023 XY9',
                type: 'hazard_update',
                message: 'Reclassified as potentially hazardous',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
                read: false,
                severity: 'medium',
            },
            {
                id: '3',
                asteroidName: '2024 CD5',
                type: 'new_discovery',
                message: 'New asteroid discovered, close approach in 14 days',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
                read: true,
                severity: 'low',
            },
        ]
        setAlerts(mockAlerts)
    }, [])

    const markAsRead = (id: string) => {
        setAlerts(alerts.map((alert) => (alert.id === id ? { ...alert, read: true } : alert)))
    }

    const markAllAsRead = () => {
        setAlerts(alerts.map((alert) => ({ ...alert, read: true })))
    }

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'high':
                return 'border-red-500 bg-red-500/10'
            case 'medium':
                return 'border-yellow-500 bg-yellow-500/10'
            default:
                return 'border-blue-500 bg-blue-500/10'
        }
    }

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case 'high':
                return <IoAlertCircle className="w-5 h-5 text-red-500 icon-glow" />
            case 'medium':
                return <IoAlertCircle className="w-5 h-5 text-yellow-500 icon-glow" />
            default:
                return <IoAlertCircle className="w-5 h-5 text-blue-500 icon-glow" />
        }
    }

    const unreadCount = alerts.filter((a) => !a.read).length

    return (
        <div className="w-full px-0 py-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-5xl font-bold text-gradient mb-4 font-[family-name:var(--font-space-grotesk)]">
                            Alerts & Notifications
                        </h1>
                        <p className="text-white/70 text-lg">
                            Stay informed about asteroid close approaches and updates
                        </p>
                    </div>
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className="btn-cosmic flex items-center gap-2"
                    >
                        <IoSettings className="w-5 h-5 icon-glow" />
                        Settings
                    </button>
                </div>
            </motion.div>

            {/* Settings Panel */}
            {showSettings && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mb-8 bg-[#1B1A55]/50 backdrop-blur-md border border-[#535C91]/30 rounded-xl p-6"
                >
                    <h3 className="text-xl font-semibold text-[#9290C3] mb-4">
                        Alert Configuration
                    </h3>

                    <div className="space-y-4">
                        {/* Notifications Toggle */}
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="font-medium text-[#9290C3]">
                                    Enable Notifications
                                </div>
                                <div className="text-sm text-[#9290C3]/60">
                                    Receive alerts for close approaches and updates
                                </div>
                            </div>
                            <button
                                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                                className={`relative w-14 h-7 rounded-full transition-colors ${notificationsEnabled ? 'bg-[#535C91]' : 'bg-[#535C91]/30'
                                    }`}
                            >
                                <div
                                    className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${notificationsEnabled ? 'translate-x-7' : ''
                                        }`}
                                />
                            </button>
                        </div>

                        {/* Proximity Threshold */}
                        <div>
                            <label className="block text-sm font-medium text-[#9290C3] mb-2">
                                Proximity Alert Threshold: {proximityThreshold.toFixed(3)} LD
                            </label>
                            <input
                                type="range"
                                min="0.01"
                                max="0.5"
                                step="0.01"
                                value={proximityThreshold}
                                onChange={(e) => setProximityThreshold(Number(e.target.value))}
                                className="w-full h-2 bg-[#535C91]/30 rounded-lg appearance-none cursor-pointer accent-[#9290C3]"
                            />
                            <div className="flex justify-between text-xs text-[#9290C3]/60 mt-1">
                                <span>0.01 LD (Very Close)</span>
                                <span>0.5 LD (Moderate)</span>
                            </div>
                        </div>

                        {/* Alert Frequency */}
                        <div>
                            <label className="block text-sm font-medium text-[#9290C3] mb-2">
                                Alert Frequency
                            </label>
                            <select className="w-full bg-[#070F2B] border border-[#535C91]/30 rounded-lg px-4 py-2 text-[#9290C3] focus:outline-none focus:border-[#9290C3]">
                                <option value="realtime">Real-time</option>
                                <option value="hourly">Hourly digest</option>
                                <option value="daily">Daily digest</option>
                            </select>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Alert Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-[#1B1A55]/50 backdrop-blur-md border border-[#535C91]/30 rounded-xl p-6">
                    <div className="flex items-center gap-3">
                        <IoNotifications className="w-8 h-8 text-[#9290C3] icon-glow" />
                        <div>
                            <div className="text-2xl font-bold text-white">{alerts.length}</div>
                            <div className="text-sm text-[#9290C3]/60">Total Alerts</div>
                        </div>
                    </div>
                </div>

                <div className="bg-[#1B1A55]/50 backdrop-blur-md border border-[#535C91]/30 rounded-xl p-6">
                    <div className="flex items-center gap-3">
                        <IoAlertCircle className="w-8 h-8 text-yellow-500 icon-glow" />
                        <div>
                            <div className="text-2xl font-bold text-white">{unreadCount}</div>
                            <div className="text-sm text-[#9290C3]/60">Unread</div>
                        </div>
                    </div>
                </div>

                <div className="bg-[#1B1A55]/50 backdrop-blur-md border border-[#535C91]/30 rounded-xl p-6">
                    <div className="flex items-center gap-3">
                        {notificationsEnabled ? (
                            <IoNotifications className="w-8 h-8 text-green-500 icon-glow" />
                        ) : (
                            <IoNotificationsOff className="w-8 h-8 text-red-500 icon-glow" />
                        )}
                        <div>
                            <div className="text-2xl font-bold text-white">
                                {notificationsEnabled ? 'ON' : 'OFF'}
                            </div>
                            <div className="text-sm text-[#9290C3]/60">Notifications</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            {unreadCount > 0 && (
                <div className="mb-6 flex justify-end">
                    <button
                        onClick={markAllAsRead}
                        className="text-[#9290C3] hover:text-white flex items-center gap-2 transition-colors"
                    >
                        <IoCheckmarkCircle className="w-4 h-4 icon-glow" />
                        Mark all as read
                    </button>
                </div>
            )}

            {/* Alerts List */}
            <div className="space-y-4">
                {alerts.length === 0 ? (
                    <div className="text-center py-16 bg-[#1B1A55]/30 rounded-xl">
                        <IoNotifications className="w-16 h-16 mx-auto mb-4 text-[#9290C3]/30 icon-glow" />
                        <p className="text-[#9290C3]/60 text-lg">No alerts yet</p>
                        <p className="text-[#9290C3]/40 text-sm mt-2">
                            You'll be notified when asteroids approach Earth
                        </p>
                    </div>
                ) : (
                    alerts.map((alert, index) => (
                        <motion.div
                            key={alert.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`bg-[#1B1A55]/50 backdrop-blur-md border-l-4 ${getSeverityColor(
                                alert.severity
                            )} rounded-xl p-6 ${!alert.read ? 'border-r-4' : ''}`}
                        >
                            <div className="flex items-start gap-4">
                                {getSeverityIcon(alert.severity)}
                                <div className="flex-1">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <h3 className="text-lg font-semibold text-white">
                                                {alert.asteroidName}
                                            </h3>
                                            <div className="flex items-center gap-2 text-sm text-[#9290C3]/60 mt-1">
                                                <IoTime className="w-4 h-4 icon-glow" />
                                                {alert.timestamp.toLocaleString()}
                                            </div>
                                        </div>
                                        {!alert.read && (
                                            <button
                                                onClick={() => markAsRead(alert.id)}
                                                className="text-[#9290C3] hover:text-white text-sm transition-colors"
                                            >
                                                Mark as read
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-[#9290C3]">{alert.message}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    )
}


