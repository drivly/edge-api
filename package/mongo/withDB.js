import * as Realm from 'realm-web'

let App
let client
let db = {}

export const Client = async ({ appId, dataSource, env }) => {
  if (!App) {
    App = new Realm.App({ id: appId ?? env.REALM_APPID })
    const credentials = Realm.Credentials.apiKey(env.REALM_API_KEY)
    var user = await App.logIn(credentials)
    client = user.mongoClient(dataSource ?? env.REALM_DATA_SOURCE ?? 'mongodb-atlas')
  }
  return client
}

export const DB = async ({ appId, dataSource, database, env }) => {
  if (!App) await Client({ appId, dataSource, env })
  if (!db[database]) {
    db[database] = client.db(database ?? env.REALM_DATABASE ?? new URL(req.url).hostname)
  }
  return db[database]
}

export const withDB = (init = {}) => async (req, env, ctx) => {
  req.client = await Client({...init, env})
  req.db = await DB({...init, env})
  req.App = App
}

export const withClient = (init = {}) => async (req, env, ctx) => {
  req.client = await Client({...init, env})
}