export const captureAnalytics = async (req, env, ctc) => {
  const { cf, id, ip }  = req
  env?.analytics?.writeDataPoint({
    'blobs': [ 
      cf?.colo, 
      cf?.country, 
      cf?.city, 
      cf?.postalCode,
      cf?.region, 
      cf?.timezone
    ],
    'doubles': [
      cf?.clientTcpRtt,
      cf?.metroCode, 
      cf?.longitude, 
      cf?.latitude,
      cf?.botManagement?.score,
    ],
    'indexes': [
      ip
    ] 
  })
}