import mongoose, { Schema, Document } from 'mongoose'

export interface IPrivateMessage extends Document {
    conversationId: mongoose.Types.ObjectId
    senderId: mongoose.Types.ObjectId
    message: string
    createdAt: Date
}

const privateMessageSchema = new Schema<IPrivateMessage>({
    conversationId: {
        type: Schema.Types.ObjectId,
        ref: 'Conversation',
        required: true,
        index: true
    },
    senderId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

export const PrivateMessage = mongoose.model<IPrivateMessage>('PrivateMessage', privateMessageSchema)
