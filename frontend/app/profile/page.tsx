'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, MapPin, Building, Calendar, Edit2, LogOut, Lock } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { ProfileEditModal } from '@/components/profile/ProfileEditModal'
import { ChangePasswordModal } from '@/components/profile/ChangePasswordModal'
import api from '@/lib/api'

interface UserProfile {
    _id: string
    name: string
    email: string
    bio?: string
    location?: string
    organization?: string
    avatar?: string
    createdAt: string
    role: string
}

export default function ProfilePage() {
    const [user, setUser] = useState<UserProfile | null>(null)
    const [loading, setLoading] = useState(true)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
    const router = useRouter()

    useEffect(() => {
        fetchProfile()
    }, [])

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token')
            if (!token) {
                console.log('No token found, redirecting to login')
                router.push('/login')
                return
            }

            const response = await api.get('/api/auth/profile')
            console.log('Profile response:', response.data)
            setUser(response.data.user || response.data)
        } catch (error: any) {
            console.error('Failed to fetch profile:', error.response?.status, error.response?.data)
            router.push('/login')
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateProfile = async (data: Partial<UserProfile>) => {
        try {
            const response = await api.put('/api/auth/profile', data)
            setUser(response.data)
        } catch (error) {
            console.error('Failed to update profile', error)
            throw error
        }
    }

    const handleLogout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.dispatchEvent(new Event('auth-change'))
        router.push('/')
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cosmic-lavender"></div>
            </div>
        )
    }

    if (!user) return null

    return (
        <div className="container mx-auto px-6 py-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto"
            >
                {/* Profile Header Card */}
                <div className="bg-[#1B1A55]/50 backdrop-blur-md border border-[#535C91]/30 rounded-2xl overflow-hidden shadow-2xl">
                    {/* Cover Banner */}
                    <div className="h-48 bg-gradient-to-r from-[#070F2B] via-[#1B1A55] to-[#535C91] relative">
                        <div className="absolute inset-0 bg-[url('/textures/stars.png')] opacity-50" />
                    </div>

                    <div className="px-8 pb-8">
                        {/* Avatar & Actions */}
                        <div className="flex justify-between items-end -mt-16 mb-6">
                            <div className="relative">
                                <div className="w-32 h-32 rounded-full border-4 border-[#070F2B] bg-[#1B1A55] overflow-hidden flex items-center justify-center shadow-xl">
                                    {user.avatar ? (
                                        <img
                                            src={user.avatar}
                                            alt={user.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <User className="w-16 h-16 text-[#9290C3]" />
                                    )}
                                </div>
                                <div className="absolute bottom-2 right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-[#1B1A55]" />
                            </div>

                            <div className="flex gap-3 mb-2">
                                <button
                                    onClick={() => setIsEditModalOpen(true)}
                                    className="btn-secondary flex items-center gap-2"
                                >
                                    <Edit2 className="w-4 h-4" />
                                    Edit Profile
                                </button>
                                <button
                                    onClick={() => setIsPasswordModalOpen(true)}
                                    className="btn-secondary flex items-center gap-2"
                                >
                                    <Lock className="w-4 h-4" />
                                    Change Password
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors flex items-center gap-2"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Logout
                                </button>
                            </div>
                        </div>

                        {/* User Info */}
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">{user.name}</h1>
                            <p className="text-[#9290C3] text-lg mb-6 max-w-2xl">
                                {user.bio || 'No bio provided yet.'}
                            </p>

                            <div className="flex flex-wrap gap-6 text-[#9290C3]/80">
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    <span>{user.location || 'Location not set'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Building className="w-4 h-4" />
                                    <span>{user.organization || 'No organization'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Additional Stats/Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                    <div className="bg-[#1B1A55]/30 backdrop-blur-sm border border-[#535C91]/20 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Account Details</h3>
                        <div className="space-y-3 text-[#9290C3]">
                            <div className="flex justify-between">
                                <span>Email</span>
                                <span className="text-white">{user.email}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Role</span>
                                <span className="capitalize text-white bg-[#535C91]/30 px-2 py-0.5 rounded text-sm">
                                    {user.role}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>User ID</span>
                                <span className="font-mono text-xs opacity-70">{user._id}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#1B1A55]/30 backdrop-blur-sm border border-[#535C91]/20 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Activity Placeholder</h3>
                        <p className="text-[#9290C3]/60 italic">
                            Activity verification and achievements will appear here.
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Edit Modal */}
            <ProfileEditModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSave={handleUpdateProfile}
                currentUser={user}
            />

            {/* Password Modal */}
            <ChangePasswordModal
                isOpen={isPasswordModalOpen}
                onClose={() => setIsPasswordModalOpen(false)}
            />
        </div>
    )
}
