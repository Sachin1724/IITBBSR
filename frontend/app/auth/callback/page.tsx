'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function AuthCallbackPage() {
    const router = useRouter()
    const searchParams = useSearchParams()

    useEffect(() => {
        const token = searchParams.get('token')
        const error = searchParams.get('error')

        if (token) {
            // Store token
            localStorage.setItem('token', token)

            // Dispatch auth change event
            window.dispatchEvent(new Event('auth-change'))
            window.dispatchEvent(new Event('storage'))

            // Redirect to dashboard
            router.push('/dashboard')
        } else if (error) {
            // Redirect to login with error
            router.push(`/login?error=${error}`)
        } else {
            // No token or error, redirect to login
            router.push('/login')
        }
    }, [searchParams, router])

    return (
        <div className="min-h-screen bg-cosmic-deep flex items-center justify-center">
            <div className="text-white text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                <p>Completing sign in...</p>
            </div>
        </div>
    )
}
