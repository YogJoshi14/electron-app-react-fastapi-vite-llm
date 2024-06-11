const { spawn } = require('child_process');
const path = require('path');

let serverProcess;

function startServer() {
  const serverExecutable = path.join(__dirname, '..', 'backend', 'dist', 'run_server');

  serverProcess = spawn(serverExecutable, [], { detached: true });

  serverProcess.stdout.on('data', (data) => {
    console.log(`Server stdout: ${data}`);
  });

  serverProcess.stderr.on('data', (data) => {
    console.error(`Server stderr: ${data}`);
  });

  serverProcess.on('close', (code) => {
    console.log(`Server process exited with code ${code}`);

    // Restart the server if it exited unexpectedly
    if (code !== 0) {
      startServer();
    }
  });
}

function stopServer() {
  if (serverProcess) {
    serverProcess.kill();
    serverProcess = null;
  }
}

module.exports = { startServer, stopServer };
