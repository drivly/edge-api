export const withContent = async req => {
  try {
    if (req.body) {
      req.content = await req.text()
      req.content = JSON.parse(req.content)
    }
  } catch (error) { }
}