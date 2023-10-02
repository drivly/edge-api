import { parseObject } from 'query-types'

export const withQueryTypes = (req) => {
    req.query = parseObject(req.query)
}