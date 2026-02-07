'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Save, User, MapPin, Building, FileText, Camera } from 'lucide-react'

interface UserProfile {
    name: string
    email: string
    bio?: string
    location?: string
    organization?: string
    avatar?: string
}

interface ProfileEditModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (data: Partial<UserProfile>) => Promise<void>
    currentUser: UserProfile
}

export function ProfileEditModal({ isOpen, onClose, onSave, currentUser }: ProfileEditModalProps) {
    const [formData, setFormData] = useState({
        name: currentUser.name,
        bio: currentUser.bio || '',
        location: currentUser.location || '',
        organization: currentUser.organization || '',
        avatar: currentUser.avatar || '',
    })
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            await onSave(formData)
            onClose()
        } catch (error) {
            console.error('Failed to save profile', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-[#1B1A55] border border-[#535C91]/30 rounded-xl max-w-lg w-full overflow-hidden shadow-2xl"
                    >
                        <div className="flex items-center justify-between p-6 border-b border-[#535C91]/30 bg-[#070F2B]/50">
                            <h2 className="text-xl font-bold text-white">Edit Profile</h2>
                            <button
                                onClick={onClose}
                                className="p-2 text-[#9290C3] hover:text-white hover:bg-[#535C91]/30 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                            {/* Avatar URL (simplified for now) */}
                            <div>
                                <label className="block text-sm font-medium text-[#9290C3] mb-1">
                                    Avatar URL
                                </label>
                                <div className="relative">
                                    <Camera className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9290C3]/60" />
                                    <input
                                        type="url"
                                        value={formData.avatar}
                                        onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                                        className="w-full bg-[#070F2B] border border-[#535C91]/30 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-[#9290C3]"
                                        placeholder="https://example.com/avatar.jpg"
                                    />
                                </div>
                            </div>

                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-[#9290C3] mb-1">
                                    Display Name
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9290C3]/60" />
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-[#070F2B] border border-[#535C91]/30 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-[#9290C3]"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Bio */}
                            <div>
                                <label className="block text-sm font-medium text-[#9290C3] mb-1">
                                    Bio
                                </label>
                                <div className="relative">
                                    <FileText className="absolute left-3 top-3 w-4 h-4 text-[#9290C3]/60" />
                                    <textarea
                                        value={formData.bio}
                                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                        className="w-full bg-[#070F2B] border border-[#535C91]/30 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-[#9290C3] min-h-[100px]"
                                        placeholder="Tell us about yourself..."
                                        maxLength={500}
                                    />
                                </div>
                                <div className="text-right text-xs text-[#9290C3]/60 mt-1">
                                    {formData.bio.length}/500
                                </div>
                            </div>

                            {/* Location */}
                            <div>
                                <label className="block text-sm font-medium text-[#9290C3] mb-1">
                                    Location
                                </label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9290C3]/60" />
                                    <input
                                        type="text"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        className="w-full bg-[#070F2B] border border-[#535C91]/30 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-[#9290C3]"
                                        placeholder="City, Country"
                                        maxLength={100}
                                    />
                                </div>
                            </div>

                            {/* Organization */}
                            <div>
                                <label className="block text-sm font-medium text-[#9290C3] mb-1">
                                    Organization
                                </label>
                                <div className="relative">
                                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9290C3]/60" />
                                    <input
                                        type="text"
                                        value={formData.organization}
                                        onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                                        className="w-full bg-[#070F2B] border border-[#535C91]/30 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-[#9290C3]"
                                        placeholder="Company or Institution"
                                        maxLength={100}
                                    />
                                </div>
                            </div>
                        </form>

                        <div className="p-6 border-t border-[#535C91]/30 bg-[#070F2B]/50 flex justify-end gap-3">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 text-[#9290C3] hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="btn-cosmic flex items-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
