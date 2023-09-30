export const withContent = async req => {
  if (req.body)
    req.content = await req.json().catch()
}