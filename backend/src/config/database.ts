import mongoose from 'mongoose'
import { config } from './index'

export async function connectDatabase() {
    // Safety check for production
    if (config.nodeEnv === 'production' && config.mongodb.uri.includes('localhost')) {
        console.error('❌ FATAL ERROR: Using localhost database in PRODUCTION mode.');
        console.error('⬇️  YOU MUST FIX THIS ON RENDER:');
        console.error('1. Go to your Render Dashboard -> Environment');
        console.error('2. Add MONGODB_URI with your MongoDB Atlas connection string');
        process.exit(1);
    }

    try {
        console.log(`📡 Connecting to MongoDB... (Target: ${config.mongodb.uri.includes('localhost') ? 'Localhost' : 'Atlas'})`);
        await mongoose.connect(config.mongodb.uri)
        console.log('✅ MongoDB connected successfully')
    } catch (error) {
        console.error('❌ MongoDB connection error:', error)
        process.exit(1)
    }
}

mongoose.connection.on('disconnected', () => {
    console.log('⚠️  MongoDB disconnected')
})

mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB error:', err)
})
