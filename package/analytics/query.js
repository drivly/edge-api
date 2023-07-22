export const queryAnalytics = async (q, env) => {
  const query = `
  SELECT 
    timestamp,
    index1 AS id,
    blob1 AS url,
    blob2 AS method,
    blob3 AS hostname,
    blob4 AS pathname,
    blob5 AS search,
    blob6 AS ip,
    blob7 AS isp,
    blob8 AS colo,
    blob9 AS country,
    blob10 AS city,
    blob11 AS postalCode,
    blob12 AS region,
    blob13 AS timezone,
    blob14 AS username,
    blob15 AS email,
    blob16 AS worker,
    blob17 AS userAgent,
    blob18 AS referer,
    blob19 AS detectionIds,
    double1 AS metroCode,
    double2 AS longitude,
    double3 AS latitude,
    double4 AS botManagementScore,
    double5 AS clientTcpRtt,
    double6 AS serviceLatency,
    double7 AS recentInteractions,
    double8 AS urlLength,
    double9 AS subdomains,
    double10 AS tokensConsumed,
    double11 AS responseStatus,
    double12 AS responseContentLength,
    _sample_interval AS sampleInterval
    
  FROM ANALYTICS
  ORDER BY timestamp DESC
  LIMIT 10
  `
  const data = await fetch(`https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/analytics_engine/sql`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${env.CLOUDFLARE_ANALYTICS_TOKEN}` },
      body: query,
  }).then(res => res.json())
  return data
}