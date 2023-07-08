import { error, Router, withParams, withContent } from 'itty-router'
import { Toucan } from 'toucan-js'
import { instrument } from '@microlabs/otel-cf-workers'
import { json } from './json.js'
import { withUrl } from './middleware/index.js'

export const API = options => {
  const api = Router(options)
  api
    .all('*', withParams, withContent, withUrl)

  api.fetch = async (req, env, ctx) => {

    const sentry = new Toucan({
      dsn: env.SENTRY_DSN,
      request: req,
      // release: '1.0.0',
      context: ctx,
    })

    const honeycomb = {
      exporter: {
        url: 'https://api.honeycomb.io/v1/traces',
        headers: { 'x-honeycomb-team': env.HONEYCOMB_TEAM },
      },
      // service: { name: 'greetings' },
    }

    try {
      const startTime = Date.now()
      const data = env.HONEYCOMB_TEAM ? await instrument(api.handle(req, env, ctx), honeycomb) : await api.handle(req, env, ctx)
      const responseTime = Date.now() - startTime
      const response = json(data)
      // response.headers.set('X-Response-Time', `${responseTime}ms`)
      // TODO: add logging
      return response
    } catch (err) {
      console.error(err)
      sentry.captureException(err)
      return error(err)
    }
  }
  return api
}