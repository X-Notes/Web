const PROXY_CONFIG = [
    {
        context: [
            "/api"
        ],
        target: "http://localhost:5000",
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
