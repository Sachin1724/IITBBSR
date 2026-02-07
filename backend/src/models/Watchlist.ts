import mongoose, { Schema, Document } from 'mongoose'

export interface IWatchlist extends Document {
    userId: mongoose.Types.ObjectId
    asteroidId: string
    createdAt: Date
}

const watchlistSchema = new Schema<IWatchlist>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    asteroidId: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
})

// Compound index to prevent duplicates
watchlistSchema.index({ userId: 1, asteroidId: 1 }, { unique: true })

export const Watchlist = mongoose.model<IWatchlist>('Watchlist', watchlistSchema)
