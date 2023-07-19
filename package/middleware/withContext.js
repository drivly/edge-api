import UAParser from 'ua-parser-js'

let recentInteractions = 0

export const withContext = (req, env, ctx) => {

  const { user } = req
  
  recentInteractions++

  req.ua = new UAParser(req.headers.get('user-agent')).getResult()

  req.user = {
    ...req.user,
    anonymous: user?.name ? undefined : true,
    ip: req.headers.get('cf-connecting-ip'),
    isp: req.cf.asOrganization,
    browser: req.ua.browser?.name ? req.ua.browser?.name + (req.ua.browser?.name ? ' on ' + req.ua.os?.name : '') : undefined,
    userAgent: req.ua.browser?.name ? undefined : req.headers.get('user-agent'),
    // city: req.cf.city,
    // region: req.cf.region,
    // timezone: req.cf.timezone,
    location: `${req.cf.city}, ${req.cf.region}, ${req.cf.country}`,
    localTime: new Date().toLocaleString('en-US', { timeZone: req.cf.timezone }),
    timezone: req.cf.timezone,
    requestId: req.headers.get('cf-ray') + '-' + req.cf.colo,
    clientLatency: req.cf.clientTcpRtt,
    recentInteractions,
    // ua: req.ua,
    // backendLatency: req.cf.timeToFirstByte,
    // cf: req.cf, 
  }

}