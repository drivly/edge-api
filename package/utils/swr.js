import { Stopwatch } from './stopwatch'
import { sha256 } from './utils'

let cache

const fetched = {}

export const staleWhileRevalidate = (req, env, ctx) => {
  req.swrFetch = swrFetch(ctx)
}


export const swrFetch = ctx => async (url, { staleAfter = 1, expireAfter = 2592000, ...init} = {}) => {
  
  let { watch = new Stopwatch() } = ctx

  const hash = init?.method === 'POST' ? await sha256(init.body) : ''
  const cacheKey = new Request(url + hash)

  const cacheName = 'swr:cache'
  // const cache = caches.default
  // const cache = await caches.open(cacheName)
  if (!cache) cache = await caches.open(cacheName)

  const cachePromise = cache.match(cacheKey)
  // const cachePromise = caches.open(cacheName).then(cache => cache.match(cacheKey))
  const fetchPromise = fetch(url, init)


  let response = await Promise.race([
    cachePromise,
    fetchPromise,
  ])

  // return response ?? fetchPromise

  if (!response) {
    watch.mark('Miss')
    response = (await fetchPromise).clone()
    watch.mark('Fetched')
  } else {
    watch.mark('Hit')      
  }
  
  const age = parseInt(response.headers?.get('age'))
  console.log({age})
  if (age && age <= staleAfter) {
    watch.mark('Fresh')
  } else {
    watch.mark('Stale')
    ctx.waitUntil(
      fetchPromise.then(async res => { 
        let updatedResponse = new Response(res.body, res)
        updatedResponse.headers.append("Cache-Control", `s-maxage=${expireAfter}`)
        const cache = await caches.open(cacheName)
        return cache.put(cacheKey, updatedResponse)
      })
    )
  }

  console.log(watch.checkpoints)

  return response

}
