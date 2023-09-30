export const withContent = async request => {
  if (request.body)
    request.content = await request.json().catch()
}