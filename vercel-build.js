const { execSync } = require('child_process');

try {
  console.log('Starting optimized build process...');
  
  // Set environment variables for faster builds
  process.env.BABEL_ENV = 'production';
  process.env.NODE_ENV = 'production';
  process.env.GENERATE_SOURCEMAP = 'false'; // Disable sourcemaps for faster builds
  process.env.ESLint_NO_DEV_ERRORS = 'true'; // Skip ESLint in production
  
  // Use optimized build command
  execSync('GENERATE_SOURCEMAP=false npm run react-build', { stdio: 'inherit' });
  
  console.log('Build completed successfully');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}