import { decode } from 'next-auth/jwt'
import { withCookies } from 'itty-router'

export const withUser = async (req, env, ctx) => {
  withCookies(req)
  const { name, email, image } = await decode({
    token: req.cookies['__Secure-next-auth.session-token'],
    secret: env.JWT_SECRET,
  }) || {}
  req.user = { name, email, image }
}