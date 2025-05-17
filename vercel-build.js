const { execSync } = require('child_process');

try {
  console.log('Starting build process...');
  
  // Set environment variables for build
  process.env.BABEL_ENV = 'production';
  process.env.NODE_ENV = 'production';
  
  // Use default Create React App build
  execSync('npm run react-build', { stdio: 'inherit' });
  
  console.log('Build completed successfully');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}