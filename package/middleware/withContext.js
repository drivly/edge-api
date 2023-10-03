import UAParser from 'ua-parser-js'
// import languageParser from 'accept-language-parser'

let recentInteractions = 0

export const withContext = async (req, env, ctx) => {

  const { origin, user } = req

  recentInteractions++

  req.ua = new UAParser(req.headers.get('user-agent')).getResult()
  // req.languages = languageParser.parse(req.headers.get('accept-language') ?? 'en-US')

  if (typeof(env.AUTH?.fetch) == 'function') {
    const auth = await env.AUTH.fetch(req.url, { headers: req.headers, cf: req.cf }).then(res => res.json()) //.catch(err => console.error(err))
    const { name, email, image } = auth?.user
    const account = email ? req.origin + '/account' : undefined
    req.user = { name, email, image, account, ...req.user }
  }

  req.user = {
    ...req.user,
    // anonymous: req.user?.email ? undefined : true,
    // profile: req.user?.email ? origin + '/_profile' : undefined,
    // logs: req.user?.email ? origin + '/_logs' : undefined,
    ip: req.headers?.get('cf-connecting-ip'),
    isp: req.cf?.asOrganization,
    browser: req.ua?.browser?.name ? req.ua.browser?.name + (req.ua.browser?.name ? ' on ' + req.ua.os?.name : '') : undefined,
    userAgent: req.ua?.browser?.name ? undefined : req.headers.get('user-agent'),
    // city: req.cf.city,
    // region: req.cf.region,
    // timezone: req.cf.timezone,
    location: `${req.cf?.city}, ${req.cf?.region}, ${req.cf?.country}`,
    localTime: req.cf?.timezone ? new Date().toLocaleString('en-US', { timeZone: req.cf?.timezone }) : undefined,
    timeZone: req.cf?.timezone,
    requestId: req.headers.get('cf-ray') + '-' + req.cf?.colo,
    // trace: origin + '/_logs/' + req.headers.get('cf-ray'),
    clientLatency: req.cf?.clientTcpRtt,
    recentInteractions,
    // cf: req.query?._debug == '' ? req.cf : undefined,
    // headers: req.query?._debug == '' ? Object.fromEntries(req.headers) : undefined,
    // ua: req.ua,
    // backendLatency: req.cf.timeToFirstByte,
    // cf: req.cf, 
  }

}