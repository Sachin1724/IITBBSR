export function calculateRiskScore(
    diameterMeters: number,
    velocityKmPerHour: number,
    missDistanceKm: number,
    isHazardous: boolean
): number {
    let score = 0

    // Diameter contribution (0-30 points)
    const diameterScore = Math.min(30, (diameterMeters / 1000) * 10)
    score += diameterScore

    // Velocity contribution (0-30 points)
    const velocityScore = Math.min(30, (velocityKmPerHour / 100000) * 30)
    score += velocityScore

    // Miss distance contribution (0-30 points, inverse relationship)
    const distanceScore = Math.max(0, 30 - (missDistanceKm / 10000000) * 30)
    score += distanceScore

    // Hazardous flag (0-10 points)
    if (isHazardous) {
        score += 10
    }

    return Math.min(100, Math.round(score))
}

export function getRiskLevel(score: number): 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' {
    if (score >= 75) return 'CRITICAL'
    if (score >= 50) return 'HIGH'
    if (score >= 25) return 'MODERATE'
    return 'LOW'
}
