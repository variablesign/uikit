import terser from '@rollup/plugin-terser';
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default [
    {
        input: './src/uikit.js',
        output: {
            file: './dist/js/uikit.min.js',
            format: 'iife',
            sourcemap: true
        },
        moduleContext: {
            './src/plugins/pikaday/1.8.2/pikaday.js': 'window'
        },
        plugins: [
            nodeResolve(),
            terser({
                toplevel: false,
                format: {
                    comments: false
                }
            })
        ]
    }
];