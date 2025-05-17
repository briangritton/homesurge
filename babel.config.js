module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        // Use more compatible targets
        targets: {
          browsers: [
            ">0.2%",
            "not dead",
            "not ie <= 11",
            "not op_mini all"
          ]
        },
        // Use modern JavaScript features directly when possible
        bugfixes: true,
        // Only include polyfills when actually needed
        useBuiltIns: 'usage',
        corejs: 3,
        // Use auto to ensure compatibility
        modules: 'auto'
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