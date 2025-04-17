[![ELv2 License](https://img.shields.io/badge/license-ELv2-green)](https://www.elastic.co/licensing/elastic-license)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://makeapullrequest.com)
![TypeScript](https://img.shields.io/badge/language-TypeScript-blue)

# OpenInt

OpenInt makes integrations a joy for developers. We give SaaS developers an edge through native product integrations.

<img src="./docs/images/banner.png"/>

The simplest way to get started is by signing up at [https://openint.dev](https://openint.dev)

## Integrations Supported

Our integrations directly is hosted at [https://openint.dev/integrations](https://openint.dev/integrations)

If you need any integration, as a paid customer, let us know by pressing the "Contact Us" button within the Console and we will add it within 72 hours.

## How is OpenInt different?

1. Turnkey: Launch with our pre-approved Apps and no-code embeddable integrations connect experience.
2. Comprehensive: Access hundreds of integrations directly and thousands via aggregators like Plaid, Merge and Finch.
3. Builder’s choice: Open Source and entirely focused on authentication, developer experience and performance.

## Local https development

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

## License

The Elastic License 2.0 (ELv2) permits free use, copying, distribution, and modification, but restricts providing the software as a hosted service and altering license keys or notices.
