export * from 'isomorphic-fetch'
export * from '@whatwg-node/server'
export * from 'itty-router'
export * from 'itty-fetcher'

import  { API as BaseAPI } from '../API.js'
import { createServerAdapter } from '@whatwg-node/server'
import { createServer } from 'http'

export const API = options => {
  const api = BaseAPI(options)
  api.listen = (port, ...args) => {
    const service = createServerAdapter(api.fetch)
    const httpServer = createServer(service)
    httpServer.listen(port, ...args)
    console.log(`Listening at http://localhost:${port}`)
  }
  return api
}