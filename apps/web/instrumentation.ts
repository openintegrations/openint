// https://nextjs.org/docs/14/app/building-your-application/optimizing/instrumentation

export async function register() {
  if (process.env['NEXT_RUNTIME'] === 'nodejs') {
    await import('./sentry.server.config')
  }

  if (process.env['NEXT_RUNTIME'] === 'edge') {
    await import('./sentry.edge.config')
  }
}

// Note: when we upgrade to Next.js 15, we should enable https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/#errors-from-nested-react-server-components
// export const onRequestError = Sentry.captureRequestError;
