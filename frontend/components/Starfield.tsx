'use client'

import { useEffect, useRef } from 'react'

export default function Starfield() {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // Set canvas size
        const resizeCanvas = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
        }
        resizeCanvas()
        window.addEventListener('resize', resizeCanvas)

        // Create stars
        const stars: { x: number; y: number; radius: number; opacity: number; speed: number }[] = []
        const starCount = 200

        for (let i = 0; i < starCount; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 1.5,
                opacity: Math.random(),
                speed: Math.random() * 0.5 + 0.1,
            })
        }

        // Animation
        let animationFrameId: number
        const animate = () => {
            ctx.fillStyle = '#070F2B'
            ctx.fillRect(0, 0, canvas.width, canvas.height)

            stars.forEach((star) => {
                // Twinkle effect
                star.opacity += star.speed * (Math.random() > 0.5 ? 1 : -1)
                star.opacity = Math.max(0.1, Math.min(1, star.opacity))

                ctx.beginPath()
                ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
                ctx.fillStyle = `rgba(146, 144, 195, ${star.opacity})`
                ctx.fill()
            })

            animationFrameId = requestAnimationFrame(animate)
        }
        animate()

        return () => {
            window.removeEventListener('resize', resizeCanvas)
            cancelAnimationFrame(animationFrameId)
        }
    }, [])

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 -z-10 pointer-events-none"
            style={{ background: '#070F2B' }}
        />
    )
}
