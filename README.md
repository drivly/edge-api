# edge-api

Simplified Edge API Router with JWT Auth, Logging, and Database.  

```javascript
import { API, error, withDB, withUser } from 'edge-api'

const api = API()

api
  .all('*', withUser, withDB({ database: 'API' }))
  .get('/', { hello: 'api' })
  .all('*', () => error(404)))

export default api
```