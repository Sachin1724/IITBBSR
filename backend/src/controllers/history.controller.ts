import { FastifyRequest, FastifyReply } from 'fastify'
import { HistoricalImpact } from '../models/HistoricalImpact'
import historicalData from '../data/historical-impacts.json'

export class HistoryController {
    // Get all historical impacts
    async getAll(req: FastifyRequest, reply: FastifyReply) {
        try {
            const impacts = await HistoricalImpact.find().sort({ date: -1 })
            return reply.send(impacts)
        } catch (error) {
            console.error('Get history error:', error)
            return reply.status(500).send({ message: 'Internal server error' })
        }
    }

    // Seed database if empty
    async seedDatabase() {
        try {
            const count = await HistoricalImpact.countDocuments()
            if (count === 0) {
                console.log('🌱 Seeding historical impact data...')
                await HistoricalImpact.insertMany(historicalData)
                console.log('✅ Historical data seeded')
            }
        } catch (error) {
            console.error('Seeding error:', error)
        }
    }
}

export const historyController = new HistoryController()
