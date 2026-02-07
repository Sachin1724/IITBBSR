'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
    Users,
    Shield,
    Activity,
    Search,
    RefreshCw,
    MoreVertical,
    Key,
    ShieldAlert,
    UserCircle
} from 'lucide-react'
import { adminAPI } from '@/lib/api'

interface UserData {
    _id: string
    name: string
    email: string
    role: 'user' | 'admin'
    lastLogin?: string
    createdAt: string
}

interface Stats {
    totalUsers: number
    activeUsersLast24h: number
    adminCount: number
}

export default function AdminPage() {
    const router = useRouter()
    const [stats, setStats] = useState<Stats | null>(null)
    const [users, setUsers] = useState<UserData[]>([])
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
    const [newPassword, setNewPassword] = useState('')
    const [resetLoading, setResetLoading] = useState(false)

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) {
            router.push('/login')
            return
        }

        // Simple client-side role check (backend also protects this)
        try {
            const payload = JSON.parse(atob(token.split('.')[1]))
            if (payload.role !== 'admin') {
                router.push('/')
                return
            }
        } catch (e) {
            router.push('/login')
            return
        }

        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            const [statsRes, usersRes] = await Promise.all([
                adminAPI.getStats(),
                adminAPI.getUsers(search)
            ])
            setStats(statsRes.data)
            setUsers(usersRes.data)
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch admin data')
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        fetchData()
    }

    const handleResetPassword = async () => {
        if (!selectedUser || !newPassword) return
        setResetLoading(true)
        try {
            await adminAPI.resetPassword({
                userId: selectedUser._id,
                newPassword
            })
            alert('Password reset successfully')
            setSelectedUser(null)
            setNewPassword('')
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to reset password')
        } finally {
            setResetLoading(false)
        }
    }

    if (loading && !stats) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cosmic-lavender"></div>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto px-6 py-12">
            <header className="mb-12">
                <h1 className="text-4xl font-bold text-gradient mb-2 font-[family-name:var(--font-space-grotesk)]">
                    Admin Dashboard
                </h1>
                <p className="text-cosmic-lavender/70">System oversight and user management</p>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <StatsCard
                    label="Total Users"
                    value={stats?.totalUsers || 0}
                    icon={<Users className="w-6 h-6" />}
                    color="text-blue-400"
                />
                <StatsCard
                    label="Active (24h)"
                    value={stats?.activeUsersLast24h || 0}
                    icon={<Activity className="w-6 h-6" />}
                    color="text-green-400"
                />
                <StatsCard
                    label="Administrators"
                    value={stats?.adminCount || 0}
                    icon={<Shield className="w-6 h-6" />}
                    color="text-purple-400"
                />
            </div>

            {/* User Management Section */}
            <div className="glass-card overflow-hidden">
                <div className="p-6 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <UserCircle className="w-5 h-5 text-cosmic-lavender" />
                        User Management
                    </h2>

                    <form onSubmit={handleSearch} className="relative max-w-md w-full">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name or email..."
                            className="input-cosmic pr-10"
                        />
                        <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2">
                            <Search className="w-4 h-4 text-cosmic-lavender/50 hover:text-white" />
                        </button>
                    </form>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/5 text-cosmic-lavender/70 text-sm uppercase tracking-wider">
                                <th className="px-6 py-4 font-medium">User</th>
                                <th className="px-6 py-4 font-medium">Role</th>
                                <th className="px-6 py-4 font-medium">Joined</th>
                                <th className="px-6 py-4 font-medium">Last Login</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {users.map((user) => (
                                <tr key={user._id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-medium">{user.name}</div>
                                        <div className="text-xs text-cosmic-lavender/50">{user.email}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.role === 'admin'
                                                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                                : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-cosmic-lavender/70">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-cosmic-lavender/70">
                                        {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => setSelectedUser(user)}
                                            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-cosmic-lavender"
                                        >
                                            <MoreVertical className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Password Reset Modal */}
            {selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-card p-8 max-w-md w-full shadow-2xl border-white/20"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-red-500/10 rounded-xl">
                                <ShieldAlert className="w-6 h-6 text-red-500" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">Manage User</h3>
                                <p className="text-sm text-cosmic-lavender/60">{selectedUser.name}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-cosmic-lavender/70">
                                    Direct Password Reset
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Enter new password"
                                        className="input-cosmic pr-10"
                                    />
                                    <Key className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cosmic-lavender/30" />
                                </div>
                                <p className="text-[10px] text-cosmic-lavender/50 mt-1">
                                    Warning: This will change the user's password immediately.
                                </p>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => {
                                        setSelectedUser(null)
                                        setNewPassword('')
                                    }}
                                    className="btn-secondary flex-1"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleResetPassword}
                                    disabled={resetLoading || !newPassword}
                                    className="btn-primary flex-1 bg-red-600 hover:bg-red-500"
                                >
                                    {resetLoading ? 'Resetting...' : 'Update Password'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    )
}

function StatsCard({ label, value, icon, color }: { label: string, value: number, icon: React.ReactNode, color: string }) {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="glass-card p-6 flex items-center justify-between"
        >
            <div>
                <p className="text-cosmic-lavender/60 text-sm font-medium uppercase tracking-wider mb-1">{label}</p>
                <p className="text-3xl font-bold">{value.toLocaleString()}</p>
            </div>
            <div className={`p-4 bg-white/5 rounded-2xl ${color}`}>
                {icon}
            </div>
        </motion.div>
    )
}
