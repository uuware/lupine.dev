const cp = require('child_process');

exports.runCmd = (cmd) => {
  const child = cp.spawn(`npm run ${cmd}`, { shell: true });
  console.log(`[dev-server] Run: ${cmd}`);
  // child.stdout.on('data', (data) => {
  //   process.stdout.write(`${data}`);
  // });
  // child.stderr.on('data', (data) => {
  //   process.stdout.write(`${data}`);
  // });
  child.stdout.pipe(process.stdout);
  child.stderr.pipe(process.stderr);
};
