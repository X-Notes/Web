const PROXY_CONFIG = [
    {
        context: [
            "/api"
        ],
        target: "https://localhost:7051",
        secure: false,
        ws: true
    },
    {
        context: [
            "/admin"
        ],
        target: "http://localhost:3333",
        secure: false,
        ws: false
    }
]

module.exports = PROXY_CONFIG;
