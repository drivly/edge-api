import { API } from '../../package'
import { withRPC } from '../../package/rpc'

const api = API()

api
  .all('*', withRPC)
  .get('/', async ({ query, RPC }, {  }) => {
    // const results = await RPC.fetch('https://test/hello/mike').then(res => res.json())
    // const sum = RPC.sum
    const sum = RPC.sum(1, 2)
    // const message = RPC.hello('RPC')
    return { sum, }//}message, query }
  })

export default {
  fetch: api.fetch
}
