export const withRPC = (req, env, ctx)  => {
  // for (const functionName in Object.keys(env)) {
  //   console.log(functionName)
  // }
  env = new Proxy(env, {
    get: (target, prop) => {
      console.log({target, prop})
      return target[prop]
    },
    apply: (target, thisArg, args) => {
      console.log({target, thisArg, args})
      return target.apply(thisArg, args)
    }
  })
}