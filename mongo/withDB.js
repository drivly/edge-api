import * as Realm from 'realm-web'

let App
let client
let db

export const withDB = (init = {}) => async (req, env, ctx) => {
  if (!db) {
    App = new Realm.App({ id: init.appId ?? env.REALM_APPID })
    const credentials = Realm.Credentials.apiKey(env.REALM_API_KEY)
    var user = await App.logIn(credentials)
    client = user.mongoClient(init.dataSource ?? env.REALM_DATA_SOURCE ?? 'mongodb-atlas')
    db = client.db(init.database ?? env.REALM_DATABASE ?? new URL(req.url).hostname)
  }
  req.App = App
  req.db = db
}