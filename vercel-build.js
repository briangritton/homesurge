const { execSync } = require('child_process');

try {
  console.log('Starting build process...');
  execSync('npm run react-build', { stdio: 'inherit' });
  console.log('Build completed successfully');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}