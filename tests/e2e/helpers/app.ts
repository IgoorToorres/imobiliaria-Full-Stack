import type { FastifyInstance } from 'fastify'
import { buildApp } from '../../../src/http/app.js'

let instance: FastifyInstance | null = null

export async function getApp(): Promise<FastifyInstance> {
  if (!instance) {
    instance = await buildApp()
    await instance.ready()
  }
  return instance
}

export async function closeApp(): Promise<void> {
  if (instance) {
    await instance.close()
    instance = null
  }
}
