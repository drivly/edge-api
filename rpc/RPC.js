import { API, error } from '..'
// import { Parser }  from 'literal-parser'

export const RPC = functions => {
  const api = API()

  api
    .get('/', ({url, query}) => {
      const { origin } = new URL(url)
      const functionNames = Object.keys(functions)
      const links = {}
      functionNames.map(name => links[name] = `${origin}/${name}`)
      return { functionNames, links, query }
    })

    .get('/:functionName/:input+?', async ({ functionName, input, query }, env) => {
      let parsedInput

      env.name = 'testing 123'
      console.log(env)

      if (input) {
        try { parsedInput = JSON.parse(input) } catch { }
        if (!parsedInput) try { parsedInput = JSON.parse(`{${input}}`) } catch { }
        if (!parsedInput) try { parsedInput = JSON.parse(`[${input}]`) } catch { }
        if (!parsedInput) try { parsedInput = JSON.parse(`"${input}"`) } catch { }  
      }

      if (!parsedInput && Object.keys(query).length > 0) parsedInput = query.args ?? query

      const args = Array.isArray(parsedInput) ? parsedInput  : [parsedInput]

      console.log(args, parsedInput, query)

      if (typeof functions[functionName] !== 'function') {
        return error(404, `Function '${functionName}' not found`)
      }

      const results = await functions[functionName].apply(env, args)
      return { results }
    })

    .post('/:functionName', async ({ functionName, params, query, content }, env) => {
      const args = Array.isArray(content) ? content : [content]

      if (typeof functions[functionName] !== 'function') {
        return error(404, `Function '${functionName}' not found`)
      }

      const results = await functions[functionName].apply(env, args)
      return { results }
    })

  return {
    fetch: api.fetch
  }
} 