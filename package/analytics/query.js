export const queryAnalytics = async (q, env) => {
  const query = `SELECT * FROM ANALYTICS`
  const data = await fetch(`https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/analytics_engine/sql`, {
      method: 'POST',
      headers: {
          'Authorization': `Bearer ${env.CLOUDFLARE_ANALYTICS_TOKEN}`,
      },
      body: query,
  }).then(res => res.json())
  return data
}