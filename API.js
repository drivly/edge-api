import { error, Router, withParams, withContent } from 'itty-router'
import { json } from './json.js'

export const API = options => {
  const api = Router(options)
  api
    .all('*', withParams, withContent)

  api.fetch = async (req, env, ctx) => {
    try {
      const startTime = Date.now()
      const data = await api.handle(req, env, ctx)
      const responseTime = Date.now() - startTime
      const response = json(data)
      response.headers.set('X-Response-Time', `${responseTime}ms`)
      // TODO: add logging
      return response
    } catch (err) {
      console.error(err)
      // TODO: add Sentry support
      return error(err)
    }
  }
  return api
}