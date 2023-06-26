import { API } from '../..'
import { withRPC } from '../../rpc'

const api = API()

api
  .all('*', withRPC)
  .get('/', async ({ query }, { RPC }) => {
    const results = await RPC.fetch('https://test/hello/mike').then(res => res.json())
    // const sum = RPC.sum(1, 2, 3, 4, 5)
    // const message = RPC.hello('RPC')
    return { results, }//sum, message, query }
  })

export default {
  fetch: api.fetch
}
