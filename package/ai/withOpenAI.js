import OpenAI from 'openai'

export const withOpenAI = (req, env, ctx) => {
  env.openai = new OpenAI({ apiKey: env.OPENAI_API_KEY })
}

export const withAIGateway = ({ account, gateway }) => (req, env, ctx) => {
  env.openai = new OpenAI({ 
    apiKey: env.OPENAI_API_KEY,
    baseURL: `https://gateway.ai.cloudflare.com/v1/${account ?? env.AI_GATEWAY_ACCOUNT}/${gateway ?? env.AI_GATEWAY_NAME}/openai`
  })
}