import { decode } from 'next-auth/jwt'
import { withCookies } from 'itty-router'

const cookies = {}

export const withUser = async (req, env, ctx) => {
  withCookies(req)
  if (cookies[req.cookies['__Secure-next-auth.session-token']]) {
    req.user = cookies[req.cookies['__Secure-next-auth.session-token']]
  } else {
    const { name, email, image } = await decode({
      token: req.cookies['__Secure-next-auth.session-token'],
      secret: env.JWT_SECRET,
    }) || {}
    req.user = { name, email, image }
    cookies[req.cookies['__Secure-next-auth.session-token']] = req.user
  }
  console.info('withUser', req.user)
}