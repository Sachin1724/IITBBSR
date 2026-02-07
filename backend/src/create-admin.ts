
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { User } from './models/User'

dotenv.config()

async function promoteToAdmin() {
    const email = process.argv[2]
    if (!email) {
        console.error('Usage: ts-node src/create-admin.ts <email>')
        process.exit(1)
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI!)
        console.log('Connected to MongoDB')

        const user = await User.findOne({ email })
        if (!user) {
            console.error(`User with email ${email} not found`)
            process.exit(1)
        }

        user.role = 'admin'
        await user.save()

        console.log(`Successfully promoted ${user.name} (${user.email}) to admin!`)
        console.log('Please log out and log back in for changes to take effect.')
    } catch (error) {
        console.error('Error:', error)
    } finally {
        await mongoose.disconnect()
    }
}

promoteToAdmin()
