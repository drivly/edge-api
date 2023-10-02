import { base62 } from '../utils/utils'
import camelcaseKeys from 'camelcase-keys'

export const withDB = (req, env, ctx) => {
  Object.keys(env).forEach(key => {
    if (!!env[key].prepare) {
      const db = env[key]
      db.init = async () => {
        const statement = `create table if not exists data (
          type text,
          id text not null,
          data text,
          createdAt datetime default current_timestamp,
          createdBy text,
          createdIn text,
          updatedAt datetime default current_timestamp,
          updatedBy text,
          updatedIn text,
          primary key (type,id)
        );`
        const initResults = await db.prepare(statement).run()
        console.log({ initResults })
      }
      db.types = async () => {
        const statement = `select distinct type from data`
        const results = await db.prepare(statement).all()
        return results.map(({ type }) => type)
      }
      db.count = async () => {
        const statement = `select count(*) from data`
        const results = await db.prepare(statement).get()
        return results['count(*)']
      }
      env[key] = new Proxy(db, {
          get: (target, prop) => {
            if (prop in target) return target[prop]
            const type = prop
            return {
              list: async ({ order = 'id', offset = 0, limit = 100 } = {}) => {
                const statement = `select * from data where type = ? order by ? limit ? offset ?`
                const { success, meta, results } = await db.prepare(statement).bind(type, order, limit, offset).all()
                const data = results.map(item => ({ _id: item.id, ...JSON.parse(item.data)}))
                return { success, data, meta: camelcaseKeys(meta) }
              },
              find: async (query, { order = 'id', offset = 0, limit = 100 } = {}) => {
                // const statement = `select * from data where type = ? ${Object.entries(query).map(([key, value]) => `and data->'$.${key}' = ${value}`)} order by ${sort} limit ${limit} offset ${offset}`
                const statement = `select * from data where type = ? ${Object.keys(query).map(key => ` and data->>'$.${key}' = ?`).join('')} order by ? limit ? offset ?`
                const { success, meta, results } = await db.prepare(statement).bind(type, ...Object.values(query).map(i => JSON.parse(i)), order, limit, offset).all()
                const data = results.map(item => ({ _id: item.id, ...JSON.parse(item.data)}))
                return { success, data, meta: camelcaseKeys(meta) }
              },
              findOne: async (query) => {
                const statement = `select * from data where type = ? ${Object.keys(query).map(key => ` and data->>'$.${key}' = ?`).join('')} limit 1`
                const results = await db.prepare(statement).bind(type, ...Object.values(query)).all()
                return results
              },
              get: async (id) => {
                const statement = `select * from data where type = ? and id = ?`
                const results = await db.prepare(statement).bind(type, id).all()
                return results
              },
              getOrCreate: async (id, data) => {
                const statement = `select * from data where type = ? and id = ?`
                const results = await db.prepare(statement).bind(type, id).all()
                if (results.results.length == 0) {
                  const createStatement = `insert into data (type, id, data) values (?, ?, ?) on conflict (type, id) do update set data = json_patch(data, ?)`
                  const createResults = await db.prepare(createStatement).bind(type, id, JSON.stringify(data), JSON.stringify(data)).run()
                  return { data, createResults }
                }
                results.results.map(item => item.data = JSON.parse(item.data))
                return results
              },
              set: async (id, data) => {
                const statement = `insert into data (type, id, data) values (?, ?, ?) on conflict (type, id) do update set data = json_patch(data, ?)`
                const results = await db.prepare(statement).bind(type, id, JSON.stringify(data), JSON.stringify(data)).run()
                return results
              },
              overwrite: async (id, data) => {
                const statement = `update data set data = ? where type = ? and id = ?`
                const results = await db.prepare(statement).bind(JSON.stringify(data), type, id).run()
                return results
              },
              delete: async (id) => {
                const statement = `delete from data where type = ? and id = ?`
                const results = await db.prepare(statement).bind(type, id).run()
                return results
              },
              insert: async (id, data) => {
                const statement = `insert into data (type, id, data) values (?, ?, ?)`
                const results = await db.prepare(statement).bind(type, id, JSON.stringify(data)).run()
                return results
              },
              insertMany: async (data, { id } = {}) => {
                const statement = `insert into data (type, id, data) values ${data.map(({ id }) => `(?, ?, ?)`).join(',')}`
                const results = await db.prepare(statement).bind(...data.flatMap(data => [type, id ? data[id] : (data._id ?? data.id ?? base62(8)), JSON.stringify(data)])).run()
                return results
              },
              upsert: async (id, data) => {
                const statement = `insert into data (type, id, data) values (?, ?, ?) on conflict (type, id) do update set data = json_patch(data, ?)`
                const results = await db.prepare(statement).bind(type, id, JSON.stringify(data), JSON.stringify(data)).run()
                return results
              },
              upsertMany: async (data, { id } = {}) => {
                const statement = `insert into data (type, id, data) values ${data.map(({ id }) => `(?, ?, ?)`).join(',')} on conflict (type, id) do update set data = excluded.data`
                const results = await db.prepare(statement).bind(...data.flatMap(data => [type, id ? data[id] : (data._id ?? data.id ?? base62(8)), JSON.stringify(data)])).run()
                return results
              },
              update: async (id, data) => {
                const statement = `update data set data = json_patch(data, ?) where type = ? and id = ?`
                const results = await db.prepare(statement).bind(JSON.stringify(data), type, id).run()
                return results
              },
              count: async (query) => {
                const statement = `select count(*) from data where type = ? ${Object.keys(query).map(key => ` and data->>'$.${key}' = ?`).join('')}`
                const results = await db.prepare(statement).bind(type, ...Object.values(query)).all()
                return results['count(*)']
              },
            }
          }
        })
      }      
  })
}

export const DB = (db, { basePath } = {}) => {
  const database = {
    init: async () => {
      const statement = `create table if not exists data (
        type text,
        id text not null,
        data text,
        createdAt datetime default current_timestamp,
        createdBy text,
        createdIn text,
        updatedAt datetime default current_timestamp,
        updatedBy text,
        updatedIn text,
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
    ...db,
  }
  return new Proxy(database, {
    get: (target, prop) => {
      if (prop in target) return target[prop]
      const type = prop
      return {
        list: async ({ order = 'id', offset = 0, limit = 100 } = {}) => {
          const statement = `select * from data where type = ? order by ? limit ? offset ?`
          const { success, meta, results } = await db.prepare(statement).bind(type, order, limit, offset).all()
          const data = results.map(item => ({ _id: item.id, ...JSON.parse(item.data)}))
          return { success, data, meta: camelcaseKeys(meta) }
        },
        find: async (query, { order = 'id', offset = 0, limit = 100 } = {}) => {
          // const statement = `select * from data where type = ? ${Object.entries(query).map(([key, value]) => `and data->'$.${key}' = ${value}`)} order by ${sort} limit ${limit} offset ${offset}`
          const statement = `select * from data where type = ? ${Object.keys(query).map(key => ` and data->>'$.${key}' = ?`).join('')} order by ? limit ? offset ?`
          const { success, meta, results } = await db.prepare(statement).bind(type, ...Object.values(query).map(i => JSON.parse(i)), order, limit, offset).all()
          const data = results.map(item => ({ _id: item.id, ...JSON.parse(item.data)}))
          return { success, data, meta: camelcaseKeys(meta) }
        },
        findOne: async (query) => {
          const statement = `select * from data where type = ? ${Object.keys(query).map(key => ` and data->>'$.${key}' = ?`).join('')} limit 1`
          const results = await db.prepare(statement).bind(type, ...Object.values(query)).all()
          return results
        },
        get: async (id) => {
          const statement = `select * from data where type = ? and id = ?`
          const results = await db.prepare(statement).bind(type, id).all()
          return results
        },
        getOrCreate: async (id, data) => {
          const statement = `select * from data where type = ? and id = ?`
          const results = await db.prepare(statement).bind(type, id).all()
          if (results.results.length == 0) {
            const createStatement = `insert into data (type, id, data) values (?, ?, ?) on conflict (type, id) do update set data = json_patch(data, ?)`
            const createResults = await db.prepare(createStatement).bind(type, id, JSON.stringify(data), JSON.stringify(data)).run()
            return { data, createResults }
          }
          results.results.map(item => item.data = JSON.parse(item.data))
          return results
        },
        set: async (id, data) => {
          const statement = `insert into data (type, id, data) values (?, ?, ?) on conflict (type, id) do update set data = json_patch(data, ?)`
          const results = await db.prepare(statement).bind(type, id, JSON.stringify(data), JSON.stringify(data)).run()
          return results
        },
        overwrite: async (id, data) => {
          const statement = `update data set data = ? where type = ? and id = ?`
          const results = await db.prepare(statement).bind(JSON.stringify(data), type, id).run()
          return results
        },
        delete: async (id) => {
          const statement = `delete from data where type = ? and id = ?`
          const results = await db.prepare(statement).bind(type, id).run()
          return results
        },
        insert: async (id, data) => {
          const statement = `insert into data (type, id, data) values (?, ?, ?)`
          const results = await db.prepare(statement).bind(type, id, JSON.stringify(data)).run()
          return results
        },
        insertMany: async (data, { id } = {}) => {
          const statement = `insert into data (type, id, data) values ${data.map(({ id }) => `(?, ?, ?)`).join(',')}`
          const results = await db.prepare(statement).bind(...data.flatMap(data => [type, id ? data[id] : (data._id ?? data.id ?? base62(8)), JSON.stringify(data)])).run()
          return results
        },
        upsert: async (id, data) => {
          const statement = `insert into data (type, id, data) values (?, ?, ?) on conflict (type, id) do update set data = json_patch(data, ?)`
          const results = await db.prepare(statement).bind(type, id, JSON.stringify(data), JSON.stringify(data)).run()
          return results
        },
        upsertMany: async (data, { id } = {}) => {
          const statement = `insert into data (type, id, data) values ${data.map(({ id }) => `(?, ?, ?)`).join(',')} on conflict (type, id) do update set data = excluded.data`
          const results = await db.prepare(statement).bind(...data.flatMap(data => [type, id ? data[id] : (data._id ?? data.id ?? base62(8)), JSON.stringify(data)])).run()
          return results
        },
        update: async (id, data) => {
          const statement = `update data set data = json_patch(data, ?) where type = ? and id = ?`
          const results = await db.prepare(statement).bind(JSON.stringify(data), type, id).run()
          return results
        },
        count: async (query) => {
          const statement = `select count(*) from data where type = ? ${Object.keys(query).map(key => ` and data->>'$.${key}' = ?`).join('')}`
          const results = await db.prepare(statement).bind(type, ...Object.values(query)).all()
          return results['count(*)']
        },
      }
    }
  })
}
  
