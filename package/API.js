import { createCors, error, Router, withParams, withContent } from 'itty-router'
import { Toucan } from 'toucan-js'
import { json } from './json.js'
import { withContext, withUrl } from './middleware/index.js'
import { isResponse } from './utils/isResponse.js'

export const API = (options = {}) => {
  const { domain, description, site, url, repo, type, from, prices, dsn, base, routes } = options
  const { preflight, corsify } = createCors({ maxAge: 86400 })
  const api = Router({ base, routes })
  api
    .all('*', preflight, withParams, withContent, withUrl, withContext)

  api.fetch = async (req, env, ctx) => {

    const sentry = new Toucan({
      dsn: env.SENTRY_DSN ?? dsn,
      request: req,
      // release: '1.0.0',
      context: ctx,
    })

    try {
      const startTime = Date.now()
      const data = await api.handle(req, env, ctx)
      const responseTime = Date.now() - startTime
      const { origin, hostname, user } = req
      user.serviceLatency = responseTime
      // const response = json(data)
      const base = domain ? `https://${domain}`.toLowerCase() : origin
      const metadata = {
        name: domain ?? hostname,
        description,
        url: url ?? base,
        login: user?.email ? undefined : `${base}/login`,
        account: user?.email ? `${base}/account` : undefined,
        signup: user?.email ? undefined : `${base}/signup`,
        subscribe: prices ? (user?.email ? undefined : `${base}/subscribe`) : undefined,
        site,
        repo,
        type,
        from,
      }
      const response = isResponse(data) ? data : 
        Array.isArray(data) 
          ? json({ api: metadata, data, user })
          : json({ api: metadata, ...data, user })
      // response.headers.set('X-Response-Time', `${responseTime}ms`)
      // TODO: add logging
      return corsify(response)
    } catch (err) {
      console.error(err)
      sentry.captureException(err)
      return corsify(error(err))
    }
  }
  return {
    all: api.all,
    get: api.get,
    post: api.post,
    put: api.put,
    patch: api.patch,
    delete: api.delete,
    options: api.options,
    head: api.head,
    handle: api.handle,
    routes: api.routes,
    fetch: api.fetch,
  }
}