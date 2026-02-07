import axios from 'axios'
import { config } from '../config'
import { Asteroid } from '../models/Asteroid'
import { calculateRiskScore } from './risk.service'

const NASA_API_BASE = config.nasa.apiUrl
const NASA_API_KEY = config.nasa.apiKey

interface NASAAsteroid {
    id: string
    name: string
    nasa_jpl_url: string
    absolute_magnitude_h: number
    estimated_diameter: {
        kilometers: {
            estimated_diameter_min: number
            estimated_diameter_max: number
        }
    }
    is_potentially_hazardous_asteroid: boolean
    close_approach_data: Array<{
        close_approach_date: string
        close_approach_date_full: string
        relative_velocity: {
            kilometers_per_hour: string
        }
        miss_distance: {
            kilometers: string
        }
    }>
}

export class NASAService {
    async fetchNEOs(startDate?: string, endDate?: string): Promise<any[]> {
        // Fetch from NASA API
        try {
            const today = new Date()
            const start = startDate || today.toISOString().split('T')[0]
            const end = endDate || new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

            const response = await axios.get(`${NASA_API_BASE}/feed`, {
                params: {
                    start_date: start,
                    end_date: end,
                    api_key: NASA_API_KEY,
                },
            })

            const asteroids: NASAAsteroid[] = []
            const nearEarthObjects = response.data.near_earth_objects

            // Flatten the date-grouped data
            for (const date in nearEarthObjects) {
                asteroids.push(...nearEarthObjects[date])
            }

            // Normalize and calculate risk scores
            const normalizedAsteroids = asteroids.map((asteroid) => this.normalizeAsteroid(asteroid))

            // Save to database
            await this.saveAsteroids(normalizedAsteroids)

            return normalizedAsteroids
        } catch (error: any) {
            console.error('NASA API error:', error.response?.data || error.message)
            throw new Error('Failed to fetch NEO data from NASA')
        }
    }

    async getAsteroidById(id: string): Promise<any> {
        // Check database
        const dbAsteroid = await Asteroid.findOne({ asteroidId: id })
        if (dbAsteroid) {
            return dbAsteroid
        }

        // Fetch from NASA API
        try {
            const response = await axios.get(`${NASA_API_BASE}/neo/${id}`, {
                params: { api_key: NASA_API_KEY },
            })

            const normalized = this.normalizeAsteroid(response.data)

            // Save to database
            await this.saveAsteroids([normalized])

            return normalized
        } catch (error: any) {
            console.error('NASA API error:', error.response?.data || error.message)
            throw new Error('Asteroid not found')
        }
    }

    private normalizeAsteroid(asteroid: NASAAsteroid): any {
        const approach = asteroid.close_approach_data[0]
        const diameter = (asteroid.estimated_diameter.kilometers.estimated_diameter_min +
            asteroid.estimated_diameter.kilometers.estimated_diameter_max) / 2

        const velocity = parseFloat(approach.relative_velocity.kilometers_per_hour)
        const missDistance = parseFloat(approach.miss_distance.kilometers)

        const riskScore = calculateRiskScore(
            diameter * 1000,
            velocity,
            missDistance,
            asteroid.is_potentially_hazardous_asteroid
        )

        return {
            id: asteroid.id,
            name: asteroid.name,
            nasa_jpl_url: asteroid.nasa_jpl_url,
            absolute_magnitude_h: asteroid.absolute_magnitude_h,
            estimated_diameter: asteroid.estimated_diameter,
            is_potentially_hazardous_asteroid: asteroid.is_potentially_hazardous_asteroid,
            close_approach_data: asteroid.close_approach_data,
            riskScore,
        }
    }

    private async saveAsteroids(asteroids: any[]): Promise<void> {
        try {
            const bulkOps = asteroids.map((asteroid) => ({
                updateOne: {
                    filter: { asteroidId: asteroid.id },
                    update: {
                        $set: {
                            asteroidId: asteroid.id,
                            name: asteroid.name,
                            nasaJplUrl: asteroid.nasa_jpl_url,
                            absoluteMagnitude: asteroid.absolute_magnitude_h,
                            estimatedDiameter: {
                                min: asteroid.estimated_diameter.kilometers.estimated_diameter_min,
                                max: asteroid.estimated_diameter.kilometers.estimated_diameter_max,
                            },
                            isPotentiallyHazardous: asteroid.is_potentially_hazardous_asteroid,
                            closeApproachData: asteroid.close_approach_data.map((approach: any) => ({
                                date: approach.close_approach_date,
                                dateFull: approach.close_approach_date_full,
                                velocity: parseFloat(approach.relative_velocity.kilometers_per_hour),
                                missDistance: parseFloat(approach.miss_distance.kilometers),
                            })),
                            riskScore: asteroid.riskScore,
                            lastUpdated: new Date(),
                        },
                    },
                    upsert: true,
                },
            }))

            await Asteroid.bulkWrite(bulkOps)
            console.log(`✅ Saved ${asteroids.length} asteroids to database`)
        } catch (error) {
            console.error('Database save error:', error)
        }
    }
}

export const nasaService = new NASAService()
