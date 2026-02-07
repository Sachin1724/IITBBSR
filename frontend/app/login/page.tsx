'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { IoLogIn, IoPersonAdd } from 'react-icons/io5'
import { authAPI } from '@/lib/api'
import { ViewPasswordToggle } from '@/components/auth/ViewPasswordToggle'

export default function LoginPage() {
    const router = useRouter()
    const [isLogin, setIsLogin] = useState(true)
    const [showPassword, setShowPassword] = useState(false)
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            if (isLogin) {
                const response = await authAPI.login({
                    email: formData.email,
                    password: formData.password,
                })
                localStorage.setItem('token', response.data.token)
                window.dispatchEvent(new Event('auth-change'))
                router.push('/')
            } else {
                const response = await authAPI.register({
                    email: formData.email,
                    password: formData.password,
                    name: formData.name,
                })
                localStorage.setItem('token', response.data.token)
                window.dispatchEvent(new Event('auth-change'))
                router.push('/')
            }
        } catch (err: any) {
            console.error('Login error:', err)
            setError(err.response?.data?.message || err.message || 'Authentication failed')
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
                            {isLogin ? 'Welcome Back' : 'Join Cosmic Watch'}
                        </h1>
                        <p className="text-white/70">
                            {isLogin ? 'Sign in to your account' : 'Create your account'}
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLogin && (
                            <div>
                                <label className="block text-white/70 text-sm mb-2">Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="input-cosmic"
                                    placeholder="John Doe"
                                    required={!isLogin}
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-white/70 text-sm mb-2">Email</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="input-cosmic"
                                placeholder="you@example.com"
                                required
                            />
                        </div>

                        <div className="relative">
                            <label className="block text-white/70 text-sm mb-2">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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

                        {isLogin && (
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => router.push('/reset-password')}
                                    className="text-xs text-white/60 hover:text-white transition-colors"
                                >
                                    Forgot Password?
                                </button>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-cosmic w-full flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            ) : (
                                <>
                                    {isLogin ? <IoLogIn className="w-5 h-5 icon-glow" /> : <IoPersonAdd className="w-5 h-5 icon-glow" />}
                                    {isLogin ? 'Login' : 'Create Account'}
                                </>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-cosmic-lavender/20"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-cosmic-deep text-white/50">Or continue with</span>
                        </div>
                    </div>

                    {/* Google Sign-In Button */}
                    <button
                        type="button"
                        onClick={() => {
                            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
                            window.location.href = `${apiUrl}/api/auth/google`
                        }}
                        className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white hover:bg-gray-100 text-gray-800 font-medium rounded-lg transition-all duration-300 border border-gray-300"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Sign in with Google
                    </button>

                    {/* Toggle */}
                    <div className="mt-6 text-center">
                        <button
                            onClick={() => {
                                setIsLogin(!isLogin)
                                setError('')
                            }}
                            className="text-white hover:text-white transition-colors text-sm"
                        >
                            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
