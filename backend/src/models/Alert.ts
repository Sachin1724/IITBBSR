import mongoose, { Schema, Document } from 'mongoose'

export interface IAlert extends Document {
    userId: mongoose.Types.ObjectId
    asteroidId: string
    threshold: number
    enabled: boolean
    createdAt: Date
}

const alertSchema = new Schema<IAlert>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    asteroidId: {
        type: String,
        required: true,
    },
    threshold: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
    },
    enabled: {
        type: Boolean,
        default: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
})

export const Alert = mongoose.model<IAlert>('Alert', alertSchema)
