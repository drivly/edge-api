export const captureAnalytics = async (req, env, ctx, res) => {
  const { cf, url, method, user }  = req
  const { hostname, pathname, search } = new URL(url)
  const urlLength = url.length
  const [tld, sld, ...subdomains] = hostname.split('.').reverse()
  const [subdomain] = subdomains.reverse()
  const detectionIds = Array.isArray(req.cf?.botManagement?.detectionIds) ? req.cf?.botManagement?.detectionIds.join(',') : null
  const id = req.headers.get('cf-ray')
  const ip = req.headers.get('cf-connecting-ip')
  const referer = req.headers.get('referer')
  const worker = req.headers.get('cf-worker')
  const userAgent = req.headers.get('user-agent')
  const data = {
    'blobs': [
      url.slice(0, 4000),
      method,
      hostname,
      pathname,
      search,
      ip,
      cf?.asOrganization, 
      cf?.colo, 
      cf?.country, 
      cf?.city, 
      cf?.postalCode,
      cf?.region, 
      cf?.timezone,
      user?.name,
      user?.email ?? req.headers.get('from'),
      worker,
      userAgent,
      referer,
      detectionIds,
    ],
    'doubles': [
      cf?.metroCode, 
      cf?.longitude, 
      cf?.latitude,
      cf?.botManagement?.score,
      cf?.clientTcpRtt,
      user?.serviceLatency,
      user?.recentInteractions,
      urlLength,
      subdomains.length,
      user?.tokensConsumed,
      res?.status,
      res?.headers?.get('content-length'),
    ],
    'indexes': [
      id
    ] 
  }

  const analytics = env?.ANALYTICS ?? env?.Analytics ?? env?.analytics


  let responseDataPromise

  if (req.logBody) {
    if (req.content) console.info('requestBody', req.content)
    responseDataPromise = res?.json().then(data => console.info('responseBody', data)).catch(err => console.error(err))
  }

  try {
    await analytics?.writeDataPoint(data)
  } catch (err) {
    console.log(data)
    console.error(err)
  }

  await responseDataPromise
  
}