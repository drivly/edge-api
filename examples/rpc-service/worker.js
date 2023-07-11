import { RPC } from '../../package/rpc'

export default RPC({
  hello: (name = 'world') => {
    return { hello: name }
  },
  square: n => ({ square: n * n }),
  sum: (...args) => ({ sum: args.reduce((a, b) => a + b, 0) }),
})