import { fetcher } from 'itty-fetcher'
import snakecaseKeys from 'snakecase-keys'

export const withAI = (req, env, ctx) => {
  const openai = fetcher({ 
    base: 'https://api.openai.com/v1' ,
    transformRequest: req => req.headers['Authorization'] = `Bearer ${env.OPENAI_API_KEY}`
  })
  req.ai = {
    chat: ({ model = 'gpt-3.5-turbo-0613', user, system, ...input }) => openai.post('/chat/completions', {
      model, 
      messages: system  
        ? [{ role: 'system', content: system }, { role: 'user', content: user }] 
        : [{ role: 'user', content: user }],
      ...snakecaseKeys(input, { deep: true })
    }),

    embeddings: ({ model = 'text-embedding-ada-002', input}) => openai.post('/embeddings', { model, input }),
    
    function: ({
      model = 'gpt-3.5-turbo-0613'
    }) => openai.post('/chat/completions', {
      model, 
      messages: system  
        ? [{ role: 'system', content: system }, { role: 'user', content: user }] 
        : [{ role: 'user', content: user }],
      ...snakecaseKeys(input, { deep: true })
    }),
  }
}