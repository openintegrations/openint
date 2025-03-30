[![ELv2 License](https://img.shields.io/badge/license-ELv2-green)](https://www.elastic.co/licensing/elastic-license)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://makeapullrequest.com)
![TypeScript](https://img.shields.io/badge/language-TypeScript-blue)

# Open Integrations (V0 App)

OpenInt is an open-source integration platform as a service (iPaaS) that helps you ship product integrations in hours, not weeks.

<img src="./docs/images/banner.png"/>

We just participated [Mega Launch Week Dec 2–6](https://launchweek.dev/lw/MEGA) and introduced [OpenInt](https://openint.dev/launch-week)

- Dec 2: [OpenInt](https://openint.dev/launch-week/introducing-openint/) – Open-source iPaaS platform.

- Dec 3: [@OpenInt/Connect](https://openint.dev/launch-week/introducing-openint-connect/) – Fully featured integrations page for your app.

- Dec 4: [OpenInt Sync](https://openint.dev/launch-week/openint-sync-simplify-data-synchronization/) – Automated data syncs straight into your database.

- Dec 5: [OpenSDKs](https://openint.dev/launch-week/introducing-opensdks/) – Typesafe SDKs with an auth proxy for any API.

- Dec 6: [Orchestrate & Our Partner Program](https://openint.dev/launch-week/introducing-orchestrate-and-partner-program/) – Unified aggregator orchestration plus our partner ecosystem (initial ones are also other OSS YC companies).

We think the above makes OpenInt the LAST integration you’ll ever need. If there’s any connector missing, tell us about it, and either we or one of our partners will write it for you in 72h for $1000.

We went through Y Combinator W23 and are now fully committed to building an open ecosystem. The stack is mostly TypeScript on Cloudflare Workers with Postgres for storage—designed to be easy to run and scale on your own infra. Long term, we want to see open-source AI agents assist developers in auto-generating and maintaining integrations and SDKs, collaborating directly within the repo.

Here’s a [1-minute demo video](https://www.youtube.com/watch?v=FpG7otZZhRw) to show how fast you can launch an integration. Check out the integrations list, star our GitHub repos ([OpenInt](https://github.com/openintegrations/openint) | [OpenSDKs](https://github.com/openintegrations/openSDKs)), or hop into our Slack community (signup via https://openint.dev) to say hi.

## Usage guide (WIP)

- [Getting started code sample](./docs/samples/getting-started.ts)
- [Full next.js example](https://github.com/openintegrations/examples)

## Deployment checklist

First setup dependencies

- Postgres (recommend Vercel postgres)
- Clerk (will be made optional later)
  - Setup JWT Template -> Supabase (optionally)
    - Use `pwgen 32 -1 | pbcopy` for jwt secret
  - Enable organizations
  - (Use the development env is enough for private use )
- Nango (should be but not yet optional if oauth connections are not used)
- Inngest (optional if sync is desired)

Then deploy

- Vercel
  - In addition env vars from the previous dependencies, set up
    - `NEXT_PUBLIC_SERVER_URL` so that it is a nicer url that the unique per deployment URL that comes by default from Vercle
      - For things like magic link generation
  - Disable deployment protection is the simplest way to get Inngest branch environments to work

## Development guide

### Local https development

Some services (e.g. Clerk, certain oauth redirect / webhooks) require HTTPS, which is a challenge for local development.

One could use ngrok, but an alternative is to modify /etc/hosts along with a locally provisioned & trusted https certificate and handle SSL termination

```sh
# Hosts table modification
echo '127.0.0.1       local.openint.dev' | sudo tee -a /etc/hosts
# Provission certificate
brew install mkcert
mkcert -install # follow the installation instructions of mkcert if any
cd ~/.ssh
mkcert local.openint.dev
# Local ssl terminiation
npm install -g local-ssl-proxy
local-ssl-proxy --source 443 --target 3000 --cert ~/.ssh/local.openint.dev.pem --key ~/.ssh/local.openint.dev-key.pem
```

## Contributors

<img src="https://contributors-img.web.app/image?repo=openintegrations/openint"/>

### Random commands that are useful

```bash
pnpm --dir  kits/connect/ clean
pnpm --dir  kits/connect/ build
pnpm --dir  kits/connect/ pub
```

```bash
NEXT_PUBLIC_SERVER_URL=https://openint.dev shdotenv -q -e .env.prod pnpm --dir ./kits/sdk gen
```
