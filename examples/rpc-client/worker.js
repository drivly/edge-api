import { API } from '../..'
import { withRPC } from '../../rpc'

const api = API()

api
  .all('*', withRPC)
  .get('/', ({ query, RPC }) => {
    const sum = RPC.sum(1, 2, 3, 4, 5)
    const message = RPC.hello('RPC')
    return { sum, message, query }
  })

console.log(api)

export default {
  fetch: api.fetch
}
