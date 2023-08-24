# edge-api

  <!-- Version - npm -->
  <a href="https://www.npmjs.com/package/edge-api">
    <img src="https://img.shields.io/npm/v/edge-api.svg" alt="Latest version on npm" />
  </a>
  <!-- Downloads - npm -->
  <a href="https://npm-stat.com/charts.html?package=edge-api">
    <img src="https://img.shields.io/npm/dt/edge-api.svg" alt="Downloads on npm" />
  </a>
  <!-- License - MIT -->
  <a href="https://github.com/nathanclevenger/edge-api/tree/master/license">
    <img src="https://img.shields.io/github/license/nathanclevenger/edge-api.svg" alt="Project license" />
  </a>

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
