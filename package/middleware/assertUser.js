import { error } from 'itty-router'

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