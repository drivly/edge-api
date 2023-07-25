export const withUrl = workers => (req, env, ctx) => {
  const worker = req.headers.get('cf-worker')
  if (worker && (workers == worker || workers.includes(worker))) {
    req.user = { name: worker, email: 'cf-worker@' + worker, ...req.user }
  }
}