export const withRPC = (req, env, ctx)  => {
  req.services = req.services || {}

  const parse = true // TODO: make this configurable
  console.log(Object.entries(env))

  for (const [key, binding] in Object.entries(env)) {
    console.log(key)
    if (isService(binding)) {
      console.log('is service', key)
      const proxied = proxyService(key, binding)

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

const proxyService = (service, handler, middlewareOptions = {}) => {
  console.log('proxy service', service)
  const buildRequest = (functionName, args) => {
    console.log(functionName, args)
    return new Request(`https://${service}/${functionName}/${JSON.stringify(args)}`, {
      // TODO: Figure out how to pass additional context like cf, user, headers, etc
      // headers: {
      //   ...headers,
      //   'x-content': JSON.stringify(content),
      // },
    })
  }
 

  const stubFetch = (obj, functionName, args) => {
    const theFetch = obj.fetch(buildRequest(functionName, args)).then(res => res.json())

    return theFetch

    // return theFetch
    
    // return options.parse
    // ? theFetch.then(res => res.json())
    // : theFetch
  }

  return new Proxy(handler, {
    get: (obj, functionName) => (...args) => {
      console.log('in proxy `get`', `https://${service}/${functionName}/${args}`)
      return obj.fetch(`https://${service}/${functionName}/${args}`).then(res => res.json())
    }
    // get: (obj, prop) => (...args) => stubFetch(obj, prop, args)
    // get: (obj, prop) => {
    //   console.log(obj, prop)
    //   return (...args) => stubFetch(obj, prop, args)
    // },
    // apply: (obj, functionName, args) => stubFetch(obj, functionName, args),
    // apply: (obj, functionName, args) => {
    //   console.log(obj, functionName, args)
    //   return stubFetch(obj, functionName, args)
    // },

    // get: (obj, prop) => isValidMethod(prop)
    //                     ? (...args) => stubFetch(obj, 'call', prop, args)
    //                     : stubFetch(obj, 'get-prop', prop),
    // set: (obj, prop, value) => stubFetch(obj, 'set', prop, value),
  })
}
