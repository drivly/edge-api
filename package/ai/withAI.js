import { AI } from 'ai-functions'

export const withAI = options => (req, env, ctx) => {
  const { ai, gpt, list, openai } = AI(options)
  env.ai = ai
  env.gpt = gpt
  env.list = list
  env.openai = openai
}

export const withAIGateway = ({ account, gateway, ...options }) => (req, env, ctx) => {
  const { ai, gpt, list, openai } = AI({
    apiKey: env.OPENAI_API_KEY,
    baseURL: `https://gateway.ai.cloudflare.com/v1/${account ?? env.AI_GATEWAY_ACCOUNT}/${gateway ?? env.AI_GATEWAY_NAME}/openai`,
    ...options
  })
  env.ai = ai
  env.gpt = gpt
  env.list = list
  env.openai = openai
}