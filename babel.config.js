module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        // Explicitly target modern browsers
        // This will reduce unnecessary transpilation
        targets: {
          esmodules: true
        },
        // Use modern JavaScript features directly when possible
        bugfixes: true,
        // Only include polyfills when actually needed
        useBuiltIns: 'usage',
        corejs: 3,
        // This improves tree shaking and reduces bundle size
        modules: false
      }
    ],
    '@babel/preset-react'
  ],
  // Only apply transforms that are actually needed
  plugins: [
    ['@babel/plugin-transform-runtime', { helpers: true, regenerator: false }]
  ],
  env: {
    production: {
      // Production-specific optimizations
      presets: [
        ['minify', { builtIns: false, evaluate: false, mangle: true }]
      ],
      plugins: [
        ['transform-react-remove-prop-types', { removeImport: true }]
      ]
    }
  }
};