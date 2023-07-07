import { createDurable } from 'itty-durable'
import snakecaseKeys from 'snakecase-keys'

export class GPT extends createDurable({ autoReturn: true, autoPersist: true }) {
  constructor(state, env) {
    super(state, env)
    this.openai = fetcher({ 
      base: 'https://api.openai.com/v1' ,
      transformRequest: req => req.headers['Authorization'] = `Bearer ${env.OPENAI_API_KEY}`
    })
  }

  async chat({ model = 'gpt-3.5-turbo-0613', messages, user, system, ...input }) {
    return this.openai.post('/chat/completions', {
      model, 
      messages: messages ? snakecaseKeys(messages, { deep: true }) : system  
        ? [{ role: 'system', content: system }, { role: 'user', content: user }] 
        : [{ role: 'user', content: user }],
      ...snakecaseKeys(input, { deep: true })
    })
  } 
}