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
    orbital_data?: {
        orbit_id: string
        orbit_determination_date: string
        first_observation_date: string
        last_observation_date: string
        data_arc_in_days: number
        observations_used: number
        orbit_uncertainty: string
        minimum_orbit_intersection: string
        jupiter_tisserand_invariant: string
        epoch_osculation: string
        eccentricity: string
        semi_major_axis: string
        inclination: string
        ascending_node_longitude: string
        orbital_period: string
        perihelion_distance: string
        perihelion_argument: string
        aphelion_distance: string
        perihelion_time: string
        mean_anomaly: string
        mean_motion: string
        equinox: string
    }
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
            return this.mapDbToResponse(dbAsteroid)
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

    private mapDbToResponse(dbAsteroid: any): any {
        return {
            id: dbAsteroid.asteroidId,
            name: dbAsteroid.name,
            nasa_jpl_url: dbAsteroid.nasaJplUrl,
            absolute_magnitude_h: dbAsteroid.absoluteMagnitude,
            estimated_diameter: {
                kilometers: {
                    estimated_diameter_min: dbAsteroid.estimatedDiameter.min,
                    estimated_diameter_max: dbAsteroid.estimatedDiameter.max
                }
            },
            is_potentially_hazardous_asteroid: dbAsteroid.isPotentiallyHazardous,
            close_approach_data: dbAsteroid.closeApproachData.map((a: any) => ({
                close_approach_date: a.date,
                close_approach_date_full: a.dateFull,
                relative_velocity: {
                    kilometers_per_hour: a.velocity.toString()
                },
                miss_distance: {
                    kilometers: a.missDistance.toString()
                }
            })),
            orbital_data: dbAsteroid.orbitalData ? {
                orbit_id: 'N/A',
                orbit_determination_date: 'N/A',
                first_observation_date: 'N/A',
                last_observation_date: 'N/A',
                data_arc_in_days: 0,
                observations_used: 0,
                orbit_uncertainty: 'N/A',
                minimum_orbit_intersection: 'N/A',
                jupiter_tisserand_invariant: 'N/A',
                epoch_osculation: dbAsteroid.orbitalData.epoch?.toString(),
                eccentricity: dbAsteroid.orbitalData.eccentricity?.toString(),
                semi_major_axis: dbAsteroid.orbitalData.semiMajorAxis?.toString(),
                inclination: dbAsteroid.orbitalData.inclination?.toString(),
                ascending_node_longitude: dbAsteroid.orbitalData.longitudeAscendingNode?.toString(),
                orbital_period: dbAsteroid.orbitalData.period?.toString(),
                perihelion_distance: 'N/A',
                perihelion_argument: dbAsteroid.orbitalData.perihelionArgument?.toString(),
                aphelion_distance: 'N/A',
                perihelion_time: 'N/A',
                mean_anomaly: dbAsteroid.orbitalData.meanAnomaly?.toString(),
                mean_motion: 'N/A',
                equinox: 'J2000'
            } : undefined,
            riskScore: dbAsteroid.riskScore
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
                            orbitalData: asteroid.orbital_data ? {
                                semiMajorAxis: parseFloat(asteroid.orbital_data.semi_major_axis),
                                eccentricity: parseFloat(asteroid.orbital_data.eccentricity),
                                inclination: parseFloat(asteroid.orbital_data.inclination),
                                longitudeAscendingNode: parseFloat(asteroid.orbital_data.ascending_node_longitude),
                                perihelionArgument: parseFloat(asteroid.orbital_data.perihelion_argument),
                                meanAnomaly: parseFloat(asteroid.orbital_data.mean_anomaly),
                                epoch: parseFloat(asteroid.orbital_data.epoch_osculation),
                                period: parseFloat(asteroid.orbital_data.orbital_period),
                            } : undefined,
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
