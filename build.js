const { execSync } = require('child_process');

try {
  if (process.env.RENDER) {
    console.log("Running in Render: Only building API");
    execSync('npm run build -w api', { stdio: 'inherit' });
  } else {
    console.log("Building workspaces (API and Web)");
    execSync('npm run build -w api', { stdio: 'inherit' });
    execSync('npm run build -w web', { stdio: 'inherit' });
  }
} catch (error) {
  process.exit(1);
}
