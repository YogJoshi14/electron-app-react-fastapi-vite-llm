const { PythonShell } = require('python-shell');
const path = require('path');

let pyshell;

function startServer() {
  const serverExecutable = path.join(__dirname, '..', 'backend', 'run_server');
  pyshell = new PythonShell(serverExecutable, { mode: 'text' });

  pyshell.on('message', function (message) {
    console.log(message);
  });

  pyshell.on('error', function (err) {
    console.error('Python script error:', err);
  });

  pyshell.end(function (err, code) {
    if (err) throw err;
    console.log('Python script finished with code:', code);

    // Restart the server if it exited unexpectedly
    if (code !== 0) {
      startServer();
    }
  });
}

function stopServer() {
  if (pyshell) {
    pyshell.childProcess.kill();
    pyshell = null;
  }
}

module.exports = { startServer, stopServer };
