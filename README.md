# edge-api

Simplified Edge API Router with JWT Auth, Logging, and Database.  

```javascript
import { API, error } from 'edge-api'

const api = API()

api
  // .all('*', withUser, withDB({ database: 'API' }))
  .get('/', () => ({ hello: 'api' }))
  .get('/:resource', ({ resource }) => ({ resource }))
  .get('/:resource/:id+', ({ resource, id }) => ({ resource, id }))
  .all('*', () => error(404))

export default api
```
