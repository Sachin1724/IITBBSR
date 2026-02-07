'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { IoClose, IoLockClosed, IoEye, IoEyeOff } from 'react-icons/io5'
import api from '@/lib/api'

interface ChangePasswordModalProps {
    isOpen: boolean
    onClose: () => void
}

export function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
    const [formData, setFormData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    })
    const [showPassword, setShowPassword] = useState({
        old: false,
        new: false,
        confirm: false
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setSuccess('')

        if (formData.newPassword !== formData.confirmPassword) {
            setError('New passwords do not match')
            return
        }

        if (formData.newPassword.length < 6) {
            setError('Password must be at least 6 characters')
            return
        }

        setLoading(true)
        try {
            await api.post('/api/auth/change-password', {
                oldPassword: formData.oldPassword,
                newPassword: formData.newPassword
            })
            setSuccess('Password updated successfully')
            setTimeout(() => {
                onClose()
                setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' })
                setSuccess('')
            }, 2000)
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update password')
        } finally {
            setLoading(false)
        }
    }

    const toggleShow = (field: 'old' | 'new' | 'confirm') => {
        setShowPassword(prev => ({ ...prev, [field]: !prev[field] }))
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-[#1B1A55] border border-[#535C91]/30 rounded-xl max-w-md w-full overflow-hidden shadow-2xl"
                    >
                        <div className="flex items-center justify-between p-6 border-b border-[#535C91]/30 bg-[#070F2B]/50">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <IoLockClosed className="w-5 h-5 text-white icon-glow" />
                                Change Password
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-2 text-[#9290C3] hover:text-white hover:bg-[#535C91]/30 rounded-lg transition-colors"
                            >
                                <IoClose className="w-5 h-5 icon-glow" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}
                            {success && (
                                <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-2 rounded-lg text-sm">
                                    {success}
                                </div>
                            )}

                            {/* Old Password */}
                            <div>
                                <label className="block text-sm font-medium text-[#9290C3] mb-1">Old Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword.old ? 'text' : 'password'}
                                        required
                                        value={formData.oldPassword}
                                        onChange={e => setFormData({ ...formData, oldPassword: e.target.value })}
                                        className="w-full bg-[#070F2B] border border-[#535C91]/30 rounded-lg pl-3 pr-10 py-2 text-white focus:outline-none focus:border-[#9290C3]"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => toggleShow('old')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9290C3]/60 hover:text-white"
                                    >
                                        {showPassword.old ? <IoEyeOff className="w-4 h-4 icon-glow" /> : <IoEye className="w-4 h-4 icon-glow" />}
                                    </button>
                                </div>
                            </div>

                            {/* New Password */}
                            <div>
                                <label className="block text-sm font-medium text-[#9290C3] mb-1">New Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword.new ? 'text' : 'password'}
                                        required
                                        minLength={6}
                                        value={formData.newPassword}
                                        onChange={e => setFormData({ ...formData, newPassword: e.target.value })}
                                        className="w-full bg-[#070F2B] border border-[#535C91]/30 rounded-lg pl-3 pr-10 py-2 text-white focus:outline-none focus:border-[#9290C3]"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => toggleShow('new')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9290C3]/60 hover:text-white"
                                    >
                                        {showPassword.new ? <IoEyeOff className="w-4 h-4 icon-glow" /> : <IoEye className="w-4 h-4 icon-glow" />}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="block text-sm font-medium text-[#9290C3] mb-1">Confirm New Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword.confirm ? 'text' : 'password'}
                                        required
                                        minLength={6}
                                        value={formData.confirmPassword}
                                        onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        className="w-full bg-[#070F2B] border border-[#535C91]/30 rounded-lg pl-3 pr-10 py-2 text-white focus:outline-none focus:border-[#9290C3]"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => toggleShow('confirm')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9290C3]/60 hover:text-white"
                                    >
                                        {showPassword.confirm ? <IoEyeOff className="w-4 h-4 icon-glow" /> : <IoEye className="w-4 h-4 icon-glow" />}
                                    </button>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end gap-3 border-t border-[#535C91]/30">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 text-[#9290C3] hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn-primary flex items-center gap-2"
                                >
                                    {loading ? 'Updating...' : 'Update Password'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}

