export default {
  default: {},
  middleware: {
    external: true,
    override: {
      wrapper: "cloudflare-edge",
      converter: "edge",
      proxyExternalRequest: "fetch",
    },
  },

  "dangerous": {
    "enableCacheInterception": false
  }
}