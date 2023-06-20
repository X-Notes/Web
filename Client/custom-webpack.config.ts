const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
import * as webpack from 'webpack';

export default (config: webpack.Configuration) => {
    config?.plugins?.push(new MonacoWebpackPlugin());
    // Remove the existing css loader rule
    const cssRuleIdx = config?.module?.rules?.findIndex((rule: any) =>
        rule.test?.toString().includes(':css')
    );
    if (cssRuleIdx !== -1) {
        config?.module?.rules?.splice(cssRuleIdx!, 1);
    }
    config?.module?.rules?.push(
        {
            test: /\.css$/,
            use: ['style-loader', 'css-loader'],
        },
        {
            test: /\.ttf$/,
            use: ['file-loader'],
        }
    );
    return config;
};
