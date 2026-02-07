import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatDistance(km: number): string {
    if (km < 1000) {
        return `${km.toFixed(2)} km`
    }
    return `${(km / 1000).toFixed(2)}k km`
}

export function formatVelocity(kmPerHour: number): string {
    return `${kmPerHour.toFixed(2)} km/h`
}

export function formatDiameter(meters: number): string {
    if (meters < 1000) {
        return `${meters.toFixed(0)} m`
    }
    return `${(meters / 1000).toFixed(2)} km`
}

export function calculateRiskScore(
    diameter: number,
    velocity: number,
    missDistance: number,
    isHazardous: boolean
): number {
    // Risk score algorithm (0-100)
    let score = 0

    // Diameter contribution (0-30 points)
    const diameterScore = Math.min(30, (diameter / 1000) * 10)
    score += diameterScore

    // Velocity contribution (0-30 points)
    const velocityScore = Math.min(30, (velocity / 100000) * 30)
    score += velocityScore

    // Miss distance contribution (0-30 points, inverse)
    const distanceScore = Math.max(0, 30 - (missDistance / 10000000) * 30)
    score += distanceScore

    // Hazardous flag (0-10 points)
    if (isHazardous) {
        score += 10
    }

    return Math.min(100, Math.round(score))
}

export function getRiskLevel(score: number): {
    level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL'
    color: string
    bgColor: string
} {
    if (score >= 75) {
        return { level: 'CRITICAL', color: 'text-red-400', bgColor: 'bg-red-500/20' }
    } else if (score >= 50) {
        return { level: 'HIGH', color: 'text-orange-400', bgColor: 'bg-orange-500/20' }
    } else if (score >= 25) {
        return { level: 'MODERATE', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' }
    }
    return { level: 'LOW', color: 'text-green-400', bgColor: 'bg-green-500/20' }
}

