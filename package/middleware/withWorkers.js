export const withWorkers = workers => (req, env, ctx) => {
  const worker = req.headers.get('cf-worker')
  const workerIp = req.headers.get('cf-connecting-ip') == '2a06:98c0:3600::103'
  if (worker && workerIp && (workers == worker || workers.includes(worker))) {
    req.user = { name: req.user?.name ?? worker, email: req.user?.email ??'cf-worker@' + worker, ...req.user }
  }
}