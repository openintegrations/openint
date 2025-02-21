export function contextFromRequest(_req: Request) {
  return {viewer: {role: 'system' as const}}
}
