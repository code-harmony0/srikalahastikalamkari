import readline from 'readline';
import { spawn } from 'child_process';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n🚀 Deployment Manager\n');
console.log('1) Deploy to Staging (Vercel)');
console.log('2) Deploy to Production (Hostinger)');
console.log('0) Cancel\n');

rl.question('Select a deployment option (1-2): ', (answer) => {
  rl.close();
  
  if (answer === '1') {
    console.log('\nDeploying to Staging (Vercel)...');
    runCommand('npx', ['vercel']);
  } else if (answer === '2') {
    console.log('\nDeploying to Production (Hostinger) via GitHub Actions...');
    console.log('Pushing latest code and triggering deployment...\n');
    runCommand('bash', ['-c', 'git push origin main && gh workflow run hostinger-deploy.yml --ref main && echo "\n✅ Deployment triggered successfully! Check your GitHub Actions tab to see the progress."']);
  } else {
    console.log('\nDeployment cancelled.');
  }
});

function runCommand(command, args) {
  const child = spawn(command, args, { stdio: 'inherit' });
  child.on('error', error => {
    console.error(`❌ Error: ${error.message}`);
  });
  child.on('exit', code => {
    if (code !== 0) {
      console.log(`\n⚠️ Process exited with code ${code}`);
    }
    process.exit(code);
  });
}
