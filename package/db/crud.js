import { fetcher } from 'itty-fetcher'

export const CRUD = (options = {}) => {
  const db = fetcher(options)
  return {
    list: (collection, query) => db.get(`/${collection}`, query),
    get: (collection, id) => db.get(`/${collection}/${id}`),
    create: (collection, data) => db.post(`/${collection}`, data),
    update: (collection, id, data) => db.put(`/${collection}/${id}`, data),
    upsert: (collection, id, data) => db.patch(`/${collection}/${id}`, data),
    delete: (collection, id) => db.delete(`/${collection}/${id}`),
  }
}