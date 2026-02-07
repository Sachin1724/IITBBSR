import mongoose, { Schema, Document } from 'mongoose'

export interface IChatMessage extends Document {
    asteroidId: string
    userId: mongoose.Types.ObjectId
    userName: string
    message: string
    createdAt: Date
}

const chatMessageSchema = new Schema<IChatMessage>({
    asteroidId: {
        type: String,
        required: true,
        index: true,
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    userName: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
        maxlength: 500,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
})

export const ChatMessage = mongoose.model<IChatMessage>('ChatMessage', chatMessageSchema)
