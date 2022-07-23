const PROXY_CONFIG = [
  {
      context: [
          "/api",
          "/hub",
      ],
      target: "https://localhost:7051",
      secure: false,
      ws: true
  }
]

module.exports = PROXY_CONFIG;