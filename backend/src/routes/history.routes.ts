import { FastifyInstance } from 'fastify'
import { historyController } from '../controllers/history.controller'

export async function historyRoutes(fastify: FastifyInstance) {
    fastify.get('/', historyController.getAll)
}
