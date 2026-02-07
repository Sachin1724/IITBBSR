import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { User } from './models/User'

dotenv.config()

async function checkDatabase() {
    try {
        console.log('Connecting to MongoDB...')
        await mongoose.connect(process.env.MONGODB_URI!)
        console.log('✅ Connected to MongoDB successfully!')

        // Count users
        const userCount = await User.countDocuments()
        console.log(`\n📊 Total users in database: ${userCount}`)

        // List all users
        if (userCount > 0) {
            const users = await User.find().select('-password').limit(10)
            console.log('\n👥 Users:')
            users.forEach((user, index) => {
                console.log(`${index + 1}. ${user.email} - Role: ${user.role} - Created: ${user.createdAt}`)
            })
        } else {
            console.log('\n⚠️  No users found in database!')
            console.log('Try registering a new user through the frontend.')
        }

        await mongoose.disconnect()
        console.log('\n✅ Disconnected from MongoDB')
    } catch (error) {
        console.error('❌ Error:', error)
        process.exit(1)
    }
}

checkDatabase()
