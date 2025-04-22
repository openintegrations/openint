export function GET() {
  console.warn('Debug endpoint hit')
  return Response.json({ok: true})
}
