export default {
    appType: 'custom',
    root: 'Assets',
    build: {
        manifest: true,
        outDir: '../wwwroot/about/dist',
        emptyOutDir: true,
        assetsDir: '',
        rollupOptions: {
            input: {
                main: 'Assets/main.js',
            },
            output: {
                entryFileNames: '[name].js',
                chunkFileNames: '[name].js',
                assetFileNames: '[name].[ext]'
            }
        },
    },
    server: {
        port: 5173,
        strictPort: true
    }
}
