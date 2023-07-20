import { decode } from 'next-auth/jwt'
import { error, withCookies } from 'itty-router'

const cookies = {}

export const withUser = async (req, env, ctx) => {
  withCookies(req)
  if (cookies[req.cookies['__Secure-next-auth.session-token']]) {
    req.user = {...cookies[req.cookies['__Secure-next-auth.session-token']], ...req.user }
  } else {
    const user = await decode({
      token: req.cookies['__Secure-next-auth.session-token'],
      secret: env.JWT_SECRET,
    }) || {}
    const { name, email, picture: image } = user
    const account = req.origin + '/_account'
    const logs = req.origin + '/_logs'
    req.user = { name, email, image, account, logs, ...req.user }
    cookies[req.cookies['__Secure-next-auth.session-token']] = req.user
  }
  console.info('withUser', req.user)
}

export const assertUser = (req, env, ctx) => {
  if (!req.user?.email) {
    return error(401, { message: 'Unauthorized' })
  }
}

export const assertUserEmail = email => (req, env, ctx) => {
  if (!req.user) {
    return error(401, { message: 'Unauthorized' })
  }
  if (typeof email === 'string') {
    if (req.user.email !== email) {
      return error(401, { message: 'Unauthorized' })
    }
  } else if (Array.isArray(email)) {
    if (!email.includes(req.user.email)) {
      return error(401, { message: 'Unauthorized' })
    }
  } else if (email instanceof RegExp) {
    if (!email.test(req.user.email)) {
      return error(401, { message: 'Unauthorized' })
    }
  } else {
    return error(500, { message: 'Invalid assertUserEmail email value' })
  }
}