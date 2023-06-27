// takes the service (e.g. env.Counter) and returns an object with { get(id) } to fetch the proxied stub
export const proxyService = (durable, middlewareOptions = {}) => {
  if (!durable || !durable.idFromName) {
    throw new StatusError(500, `${middlewareOptions.name || 'That'} is not a valid Durable Object binding.`)
  }

  return {
    get: (id, options = {}) => {
      options = { ...middlewareOptions, ...options }

      const headers = options.headers || {}
      // const originalHeaders = Object.fromEntries(options.request.headers)

      try {
        if (typeof id === 'string') { // should add check for hex id string and handle appropriately
          headers['do-name'] = id
          id = durable.idFromName(id)
        }

        const stub = durable.get(id)
        const mock = typeof options.class === 'function' && new options.class()
        const isValidMethod = prop => prop !== 'fetch' && (!mock || typeof mock[prop] === 'function')

        const buildRequest = (type, prop, content) =>
          new Request(`https://itty-durable/do/${type}/${prop}`, {
            headers: {
              ...headers,
              'do-content': JSON.stringify(content),
            },
          })

        const stubFetch = (obj, type, prop, content) => {
          const theFetch = obj
                            .fetch(buildRequest(type, prop, content))
                            .then(catchErrors)

          return options.parse
          ? theFetch.then(transformResponse)
          : theFetch
        }

        return new Proxy(stub, {
          get: (obj, prop) => isValidMethod(prop)
                              ? (...args) => stubFetch(obj, 'call', prop, args)
                              : stubFetch(obj, 'get-prop', prop),
          set: (obj, prop, value) => stubFetch(obj, 'set', prop, value),
        })
      } catch (err) {
        throw new StatusError(500, err.message)
      }
    }
  }
}