import { decode } from 'next-auth/jwt'
import { withCookies } from 'itty-router'

export { assertUser, assertUserEmail } from '../middleware/assertUser.js'

const cookies = {}

export const withUser = async (req, env, ctx) => {
  withCookies(req)
  if (cookies[req.cookies['__Secure-next-auth.session-token']]) {
    req.user = {...cookies[req.cookies['__Secure-next-auth.session-token']], ...req.user }
  } else {
    const user = await decode({
      token: req.cookies['__Secure-next-auth.session-token'] ?? req.cookies['next-auth.session-token'],
      secret: env.JWT_SECRET,
    }) || {}
    const { name, email, picture: image } = user
    const account = email ? req.origin + '/_account' : undefined
    // const logs = email ? req.origin + '/_logs' : undefined
    req.user = { name, email, image, account, ...req.user }
    cookies[req.cookies['__Secure-next-auth.session-token']] = req.user
  }
  console.info('withUser', req.user)
}