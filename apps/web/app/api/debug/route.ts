export function GET(req: Request) {
  console.warn('Debug endpoint hit')
  if (req.url.includes('crash')) {
    throw new Error('Crashing...')
  }
  return Response.json({ok: true})
}
