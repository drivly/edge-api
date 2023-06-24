import * as Realm from 'realm-web'

let App
let client
let db = {}

export const DB = async ({ appId, dataSource, database, env }) => {
  if (!App) {
    App = new Realm.App({ id: appId ?? env.REALM_APPID })
    const credentials = Realm.Credentials.apiKey(env.REALM_API_KEY)
    var user = await App.logIn(credentials)
    client = user.mongoClient(dataSource ?? env.REALM_DATA_SOURCE ?? 'mongodb-atlas')
  }
  if (!db[database]) {
    db[database] = client.db(database ?? env.REALM_DATABASE ?? new URL(req.url).hostname)
  }
  return db[database]
}

export const withDB = (init = {}) => async (req, env, ctx) => {
  req.db = await DB({...init, env})
  req.App = App
}