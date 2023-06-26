export const withRPC = (req, env, ctx)  => {
  req.services = req.services || {}

  const parse = true // TODO: make this configurable

  for (const [key, binding] of Object.entries(env)) {
    if (isService(binding)) {
      const proxied = proxyService(binding, {
        name: key,
        // class: classes[key], // pass in class key by default,
        headers: Object.fromEntries(req.headers),
        env,
        parse,
      })

      try {
        req[key] = req.services[key] = proxied
      } catch (err) {
        throw new StatusError(500, `Could not set service binding '${key}' on Request`)
      }
    }
  }
}

const isService = (item) => {
	return !!(item).fetch
}

const proxyService = (service, middlewareOptions = {}) => {
  const buildRequest = (functionName, args) =>
  new Request(`https://${service}/${functionName}/${JSON.stringify(args)}`, {
    // TODO: Figure out how to passadditional context like cf, user, headers, etc
    // headers: {
    //   ...headers,
    //   'x-content': JSON.stringify(content),
    // },
  })

const stubFetch = (obj, functionName, args) => {
  const theFetch = obj.fetch(buildRequest(service, functionName, args))

  return options.parse
  ? theFetch.then(res => res.json())
  : theFetch
}

return new Proxy(service, {
  get: (obj, prop) => (...args) => stubFetch(obj, prop, args)
  // get: (obj, prop) => isValidMethod(prop)
  //                     ? (...args) => stubFetch(obj, 'call', prop, args)
  //                     : stubFetch(obj, 'get-prop', prop),
  // set: (obj, prop, value) => stubFetch(obj, 'set', prop, value),
})
}
