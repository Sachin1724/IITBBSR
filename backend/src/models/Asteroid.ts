import mongoose, { Schema, Document } from 'mongoose'

export interface IAsteroid extends Document {
    asteroidId: string
    name: string
    nasaJplUrl: string
    absoluteMagnitude: number
    estimatedDiameter: {
        min: number
        max: number
    }
    isPotentiallyHazardous: boolean
    closeApproachData: Array<{
        date: string
        dateFull: string
        velocity: number
        missDistance: number
    }>
    riskScore: number
    lastUpdated: Date
    orbitalData?: {
        semiMajorAxis?: number
        eccentricity?: number
        inclination?: number
        longitudeAscendingNode?: number
        perihelionArgument?: number
        meanAnomaly?: number
        epoch?: number
        period?: number
    }
}

const asteroidSchema = new Schema<IAsteroid>({
    asteroidId: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    nasaJplUrl: {
        type: String,
        required: true,
    },
    absoluteMagnitude: {
        type: Number,
        required: true,
    },
    estimatedDiameter: {
        min: { type: Number, required: true },
        max: { type: Number, required: true },
    },
    isPotentiallyHazardous: {
        type: Boolean,
        required: true,
    },
    closeApproachData: [{
        date: String,
        dateFull: String,
        velocity: Number,
        missDistance: Number,
    }],
    riskScore: {
        type: Number,
        default: 0,
    },
    lastUpdated: {
        type: Date,
        default: Date.now,
    },
    orbitalData: {
        semiMajorAxis: Number,
        eccentricity: Number,
        inclination: Number,
        longitudeAscendingNode: Number,
        perihelionArgument: Number,
        meanAnomaly: Number,
        epoch: Number,
        period: Number,
    },
})

export const Asteroid = mongoose.model<IAsteroid>('Asteroid', asteroidSchema)
