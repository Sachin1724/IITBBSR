'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { KeyRound, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { authAPI } from '@/lib/api'
import { ViewPasswordToggle } from '@/components/auth/ViewPasswordToggle'

export default function ResetPasswordPage() {
    const router = useRouter()
    const [step, setStep] = useState<'request' | 'reset' | 'success'>('request')
    const [email, setEmail] = useState('')
    const [otp, setOtp] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleRequestOTP = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            await authAPI.forgotPassword(email)
            setStep('reset')
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to send OTP')
        } finally {
            setLoading(false)
        }
    }

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            await authAPI.resetPassword({ email, otp, newPassword })
            setStep('success')
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to reset password')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="glass-card p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gradient mb-2 font-[family-name:var(--font-space-grotesk)]">
                            {step === 'request' ? 'Forgot Password' : step === 'reset' ? 'Reset Password' : 'Success'}
                        </h1>
                        <p className="text-white/70">
                            {step === 'request'
                                ? 'Enter your email to receive a reset OTP'
                                : step === 'reset'
                                    ? 'Enter the OTP sent to your email and your new password'
                                    : 'Your password has been reset successfully'}
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    {step === 'request' && (
                        <form onSubmit={handleRequestOTP} className="space-y-4">
                            <div>
                                <label className="block text-white/70 text-sm mb-2 text-left">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input-cosmic"
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary w-full flex items-center justify-center space-x-2"
                            >
                                {loading ? (
                                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                                ) : (
                                    <>
                                        <Mail className="w-4 h-4" />
                                        <span>Send OTP</span>
                                    </>
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={() => router.push('/login')}
                                className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm mx-auto mt-4"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to Login
                            </button>
                        </form>
                    )}

                    {step === 'reset' && (
                        <form onSubmit={handleResetPassword} className="space-y-4">
                            <div>
                                <label className="block text-white/70 text-sm mb-2 text-left">OTP (6 Digits)</label>
                                <input
                                    type="text"
                                    maxLength={6}
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className="input-cosmic text-center tracking-[0.5em] text-xl font-bold"
                                    placeholder="000000"
                                    required
                                />
                            </div>
                            <div className="relative">
                                <label className="block text-white/70 text-sm mb-2 text-left">New Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="input-cosmic pr-12"
                                        placeholder="••••••••"
                                        required
                                    />
                                    <ViewPasswordToggle
                                        show={showPassword}
                                        onToggle={() => setShowPassword(!showPassword)}
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary w-full flex items-center justify-center space-x-2"
                            >
                                {loading ? (
                                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                                ) : (
                                    <>
                                        <KeyRound className="w-4 h-4" />
                                        <span>Reset Password</span>
                                    </>
                                )}
                            </button>
                        </form>
                    )}

                    {step === 'success' && (
                        <div className="text-center space-y-6">
                            <div className="flex justify-center">
                                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
                                    <CheckCircle2 className="w-10 h-10 text-green-500" />
                                </div>
                            </div>
                            <button
                                onClick={() => router.push('/login')}
                                className="btn-primary w-full"
                            >
                                Go to Login
                            </button>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    )
}


