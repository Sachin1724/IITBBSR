import cron from 'node-cron'
import { nasaService } from '../services/nasa.service'

export function startDataRefreshScheduler() {
    // Run every 6 hours
    cron.schedule('0 */6 * * *', async () => {
        console.log('🔄 Running scheduled NASA data refresh...')
        try {
            await nasaService.fetchNEOs()
            console.log('✅ Data refresh completed')
        } catch (error) {
            console.error('❌ Data refresh failed:', error)
        }
    })

    console.log('✅ Data refresh scheduler started (runs every 6 hours)')
}
