import { base62 } from '../utils/utils'

export const DB = (db) => {
  const database = {
    init: async () => {
      const statement = `create table if not exists data (
        type text,
        id text not null,
        data text,
        primary key (type,id)
      );`
      const initResults = await db.prepare(statement).run()
      console.log({ initResults })
    },
    types: async () => {
      const statement = `select distinct type from data`
      const results = await db.prepare(statement).all()
      return results.map(({ type }) => type)
    },
    count: async () => {
      const statement = `select count(*) from data`
      const results = await db.prepare(statement).get()
      return results['count(*)']
    },
  }
  return new Proxy(database, {
    get: (target, prop) => {
      if (prop in target) return target[prop]
      const type = prop
      console.log({ type })
      return {
        list: async ({ order = 'id', offset = 0, limit = 100 } = {}) => {
          const statement = `select * from data where type = ? order by ? limit ? offset ?`
          const results = await db.prepare(statement).all(type, order, limit, offset)
          return results
        },
        find: async (query, { order = 'id', offset = 0, limit = 100 } = {}) => {
          // const statement = `select * from data where type = ? ${Object.entries(query).map(([key, value]) => `and data->'$.${key}' = ${value}`)} order by ${sort} limit ${limit} offset ${offset}`
          const statement = `select * from data where type = ? ${Object.keys(query).map(key => ` and data->'$.${key}' = ?`).join('')} order by ? limit ? offset ?`
          const results = await db.prepare(statement).bind(type, ...Object.values(query), order, limit, offset).all()
          return results
        },
        findOne: async (query) => {
          const statement = `select * from data where type = ? ${Object.keys(query).map(key => ` and data->'$.${key}' = ?`).join('')} limit 1`
          const results = await db.prepare(statement).bind(type, ...Object.values(query)).get()
          return results
        },
        get: async (id) => {
          const statement = `select * from data where type = ? and id = ?`
          const results = await db.prepare(statement).get(type, id)
          return results
        },
        set: async (id, data) => {
          const statement = `update data set data = json_patch(data, ?) where type = ? and id = ?`
          const results = await db.prepare(statement).run(JSON.stringify(data), type, id)
          return results
        },
        overwrite: async (id, data) => {
          const statement = `update data set data = ? where type = ? and id = ?`
          const results = await db.prepare(statement).run(JSON.stringify(data), type, id)
          return results
        },
        delete: async (id) => {
          const statement = `delete from data where type = ? and id = ?`
          const results = await db.prepare(statement).run(type, id)
          return results
        },
        insert: async (id, data) => {
          const statement = `insert into data (type, id, data) values (?, ?, ?)`
          const results = await db.prepare(statement).run(type, id, JSON.stringify(data))
          return results
        },
        insertMany: async (data, { id } = {}) => {
          const statement = `insert into data (type, id, data) values ${data.map(({ id }) => `(?, ?, ?)`).join(',')}`
          const results = await db.prepare(statement).run(...data.flatMap(data => [type, id ? data[id] : (data._id ?? data.id ?? base62(8)), JSON.stringify(data)]))
          return results
        },
        upsert: async (id, data) => {
          const statement = `insert into data (type, id, data) values (?, ?, ?) on conflict (type, id) do update set data = json_patch(data, ?)`
          const results = await db.prepare(statement).run(type, id, JSON.stringify(data), JSON.stringify(data))
          return results
        },
        upsertMany: async (data, { id } = {}) => {
          const statement = `insert into data (type, id, data) values ${data.map(({ id }) => `(?, ?, ?)`).join(',')} on conflict (type, id) do update set data = excluded.data`
          const results = await db.prepare(statement).run(...data.flatMap(data => [type, id ? data[id] : (data._id ?? data.id ?? base62(8)), JSON.stringify(data)]))
          return results
        },
        update: async (id, data) => {
          const statement = `update data set data = json_patch(data, ?) where type = ? and id = ?`
          const results = await db.prepare(statement).run(JSON.stringify(data), type, id)
          return results
        },
        count: async (query) => {
          const statement = `select count(*) from data where type = ? ${Object.keys(query).map(key => ` and data->'$.${key}' = ?`).join('')}`
          const results = await db.prepare(statement).get(type, ...Object.values(query))
          return results['count(*)']
        },
      }
    }
  })
}
  
