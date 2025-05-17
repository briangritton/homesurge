const { execSync } = require('child_process');

try {
  console.log('Starting optimized build process...');
  
  // Set environment variables for modern build
  process.env.BABEL_ENV = 'production';
  process.env.NODE_ENV = 'production';
  process.env.GENERATE_SOURCEMAP = 'false';
  
  // Use our optimized build configuration
  execSync('npm run react-build', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      // Target modern browsers only
      BROWSERSLIST_ENV: 'production'
    }
  });
  
  console.log('Build completed successfully with optimized settings');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}