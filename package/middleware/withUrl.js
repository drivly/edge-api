export const withUrl = (req, env, ctx) => {
  const { origin, hostname, pathname, search } = new URL(req.url)
  const [tld, sld, ...subdomains] = hostname.split('.').reverse()
  const [subdomain] = subdomains.reverse()
  req.origin = origin
  req.hostname = hostname
  req.tld = tld
  req.sld = sld
  req.domain = sld + '.' + tld
  req.subdomain = subdomain
  req.subdomains = subdomains
  req.pathname = pathname
  req.search = search
  req.withQuery = query => req.origin + req.pathname + '?' + new URLSearchParams({ ...req.query, ...query }).toString()
}