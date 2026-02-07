import React from 'react'
import { IconType } from 'react-icons'
import { cn } from '@/lib/utils'

interface GlowIconProps {
    icon: IconType
    className?: string
    size?: number
    pulse?: boolean
    glowColor?: 'cosmic' | 'orange' | 'white' | 'current'
    onClick?: () => void
}

export function GlowIcon({
    icon: Icon,
    className = '',
    size = 24,
    pulse = false,
    glowColor = 'current',
    onClick
}: GlowIconProps) {
    const glowClasses = cn(
        'icon-glow transition-all duration-300',
        pulse && 'icon-glow-pulse',
        glowColor === 'cosmic' && 'text-cosmic-lavender',
        glowColor === 'orange' && 'text-orange-500',
        glowColor === 'white' && 'text-white',
        className
    )

    return (
        <Icon
            className={glowClasses}
            size={size}
            onClick={onClick}
        />
    )
}
