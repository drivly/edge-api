import { createCors, error, Router, withParams, withContent } from 'itty-router'
import { Toucan } from 'toucan-js'
import { json } from './json.js'
import { withContext, withUrl } from './middleware/index.js'
import { isResponse } from './utils/isResponse.js'
import { captureAnalytics } from './analytics/capture.js'

export const API = (options = {}) => {
  const { domain, description, site, url, docs, repo, type, from, prices, dsn, base, routes } = options
  const { preflight, corsify } = createCors({ maxAge: 86400 })
  const api = Router({ base, routes })
  // const _api = Router({ base })
  // _api
  //   .get('/_/:path+?', async (req, env, ctx) => {}) // TODO: add Monaco-based UI to visualize/edit JSON and YAML data
  //   .get('/_logs', async (req, env, ctx) => {}) // TODO: query recent logs
  //   .get('/_logs/:id', async (req, env, ctx) => {}) // TODO: query specific log

  api
    .all('*', preflight, withParams, withContent, withUrl, withContext)
    // TODO: add `_` routes for internal use on a seperate router
    // .get('/_logs', withUser, assertUser, withDB, async (req, env, ctx) => {
    // TODO: add /login, /logout, /signup, /account, /profile routes
    // TODO: add OpenAPI routes
    // TODO: add Docs UI from OpenAPI routes

  

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
      const { origin, hostname, user, query } = req
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
        docs,
        repo,
        type,
        from,
      }
      const debug = query?._debug == '' ? { cf: req.cf, headers: Object.fromEntries(req.headers), cookies: req.cookies, languages: req.languages } : undefined
      const response = isResponse(data) ? data : 
        query?._raw == '' ? json(data) : Array.isArray(data) 
          ? json({ api: metadata, data, user, ...debug })
          : json({ api: metadata, ...data, user, ...debug })
      // response.headers.set('X-Response-Time', `${responseTime}ms`)
      ctx.waitUntil(captureAnalytics(req, env, ctx, response))
      // TODO: add request logging
      // TODO: add complete request/response logging if configured
      // TODO: change cors to be optional
      // TODO: add open telemetry if configured
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
    // TODO: add queue handler
    // queue: (queue, env, ctx) => {},
    // TODO: add cron handler
    // scheduled: (event, env, ctx) => {},
    // TODO: add tail handler
    // tail: (events, env, ctx) => {}
    // TODO: add email handler
    // email: (message, env, ctx) => {},
  }
}