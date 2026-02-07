import mongoose, { Schema, Document } from 'mongoose'

export interface IHistoricalImpact extends Document {
    name: string
    date: string
    location: string
    energy: string
    impactType: string
    description: string
    coordinates?: {
        lat: number
        lon: number
    }
}

const historicalImpactSchema = new Schema<IHistoricalImpact>({
    name: { type: String, required: true },
    date: { type: String, required: true },
    location: { type: String, required: true },
    energy: { type: String, required: true },
    impactType: { type: String, required: true },
    description: { type: String, required: true },
    coordinates: {
        lat: Number,
        lon: Number,
    },
})

export const HistoricalImpact = mongoose.model<IHistoricalImpact>('HistoricalImpact', historicalImpactSchema)
