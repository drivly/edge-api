export * from '@whatwg-node/server'

import { createServerAdapter } from '@whatwg-node/server'
import { createServer } from 'http'

export const server = (api, port = 3000) => {
  const service = createServerAdapter(
    (req, env, ctx) => api.fetch(req, env, ctx)
  )
  const httpServer = createServer(service)
  httpServer.listen(port)
  console.log(`Server running at http://localhost:${port}`)
}

