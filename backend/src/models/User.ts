import mongoose, { Schema, Document } from 'mongoose'
import bcrypt from 'bcrypt'

export interface IUser extends Document {
    email: string
    password: string
    name: string
    role: 'user' | 'admin'
    // Profile fields
    bio?: string
    location?: string
    organization?: string
    avatar?: string
    resetOTP?: string
    resetOTPExpires?: Date
    lastLogin?: Date
    savedAsteroids?: string[]
    createdAt: Date
    comparePassword(candidatePassword: string): Promise<boolean>
}

const userSchema = new Schema<IUser>({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    // Profile fields
    bio: {
        type: String,
        trim: true,
        maxlength: 500,
    },
    location: {
        type: String,
        trim: true,
        maxlength: 100,
    },
    organization: {
        type: String,
        trim: true,
        maxlength: 100,
    },
    avatar: {
        type: String,
        trim: true,
    },
    resetOTP: {
        type: String,
        select: false,
    },
    resetOTPExpires: {
        type: Date,
        select: false,
    },
    lastLogin: {
        type: Date,
    },
    savedAsteroids: [{
        type: String,
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
})

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next()

    try {
        const salt = await bcrypt.genSalt(10)
        this.password = await bcrypt.hash(this.password, salt)
        next()
    } catch (error: any) {
        next(error)
    }
})

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password)
}

export const User = mongoose.model<IUser>('User', userSchema)
