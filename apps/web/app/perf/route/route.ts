export function GET() {
  return new Response('hello ' + Date.now())
}
