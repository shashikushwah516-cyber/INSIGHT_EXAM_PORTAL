const { spawn } = require('child_process');
const path = require('path');

console.log('\x1b[36m%s\x1b[0m', '====================================================');
console.log('\x1b[36m%s\x1b[0m', '   Insight Exam Platform - Starting Full Stack');
console.log('\x1b[36m%s\x1b[0m', '====================================================\n');

const projectRoot = path.resolve(__dirname, '..');
const clientDir = path.join(projectRoot, 'client');

// Start Express Backend Server (Port 5001)
const server = spawn('node', ['server/server.js'], {
    cwd: projectRoot,
    stdio: 'inherit',
    shell: true
});

// Start Vite React Client (Port 5173)
const client = spawn('npm', ['run', 'dev'], {
    cwd: clientDir,
    stdio: 'inherit',
    shell: true
});

const cleanup = () => {
    console.log('\nShutting down servers...');
    server.kill();
    client.kill();
    process.exit();
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);
