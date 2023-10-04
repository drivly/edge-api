import OpenAI from 'openai'

export const withOpenAI = (req, env, ctx) => {
  env.openai = new OpenAI({ apiKey: env.OPENAI_API_KEY })
}