module.exports = {
  babel: {
    presets: [
      [
        '@babel/preset-env',
        {
          // Use more compatible targets, but still relatively modern
          targets: { 
            browsers: [
              ">0.2%",
              "not dead",
              "not ie <= 11",
              "not op_mini all"
            ]
          },
          // Only include polyfills when needed
          useBuiltIns: 'usage',
          corejs: 3,
          // Keep modules to ensure compatibility
          modules: 'auto'
        }
      ]
    ],
    // Minimize transformations to improve performance
    plugins: [
      ['@babel/plugin-transform-runtime', { helpers: true }]
    ]
  },
  webpack: {
    configure: (webpackConfig) => {
      // Optimize production builds
      if (webpackConfig.mode === 'production') {
        // Ensure terser doesn't transpile ES6+ features
        if (webpackConfig.optimization && webpackConfig.optimization.minimizer) {
          webpackConfig.optimization.minimizer.forEach(minimizer => {
            if (minimizer.constructor.name === 'TerserPlugin') {
              minimizer.options.terserOptions = {
                ...minimizer.options.terserOptions,
                ecma: 2020, // Use modern ECMAScript features
                safari10: false, // Don't add workarounds for Safari 10
                // Keep classnames to help with debugging
                keep_classnames: true
              };
            }
          });
        }
      }
      
      return webpackConfig;
    }
  }
};