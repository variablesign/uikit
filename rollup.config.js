import terser from '@rollup/plugin-terser';

export default [
    {
        input: './src/uikit.js',
        external: ['@floating-ui/dom', 'UIkit'],
        output: {
            file: './dist/js/uikit.min.js',
            format: 'iife',
            sourcemap: true,
            globals: {
                '@floating-ui/dom': 'dom',
                'UIkit': 'UIkit'
            }
        },
        plugins: [
            terser({
                toplevel: false,
                format: {
                    comments: false
                }
            })
        ]
    }
];