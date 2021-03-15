const fs = require('fs');
const net = require('net');
const child_process = require('child_process');
const appRoot = require('app-root-path')
const findPort = require('find-free-port-sync');
const Inliner = require('inliner')
const npmRun = require('npm-run')

const host = '127.0.0.1';
const path = '/';
//const version = new Date().toLocaleDateString('af'); // yyyy-mm-dd
const out_file = appRoot + `/dist/index.html`;

const inliner_config = {
  //nocompress: true,
};

async function main() {

  console.log(`bundle app ...`)
  npmRun.spawnSync(
    'rollup', ['-c'], {
    stdio: 'inherit', // show output
    detached: false,
    windowsHide: true,
  });
  console.log(`bundle app done`)

  const port = findPort({ start: 8080 });
  //await sleep(50);

  const server_cmd = 'sirv';
  //const server_args = `public/ --port ${port} --host ${host} --quiet`.split(' ');
  const server_args = `public/ --port ${port} --host ${host}`.split(' ');

  const server_process = npmRun.spawn(
    server_cmd, server_args, {
    stdio: 'inherit', // show output
    detached: false,
    windowsHide: true,
  });

  console.log(`started http server with PID ${server_process.pid}`)

  /*
  server_process.on('close', (code) => {
    console.log(`server_process exited with code ${code}`);
  });

  server_process.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });

  server_process.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });
  */

  // we could also parse output from `eleventy --serve`
  for (let retry = 0; retry < 100; retry++) {
    const ping_res = await tcp_ping(host, port, 500);
    if (ping_res.status == 'error') {
      if (ping_res.error.errno != -111) { // -111 = error.code 'ECONNREFUSED'
        console.dir(ping_res);
      }
    }
    else if (ping_res.status == 'ok') {
      console.log('started http server')
      break;
    }
    //console.log('.');
    await sleep(500);
  }

  const url = `http://${host}:${port}${path}`;

  if (inliner_config.nocompress) {
    inliner_config.compressCSS = false
    inliner_config.compressJS = false
    inliner_config.collapseWhitespace = false
  }

  console.log(`run inliner`);
  const inliner = new Inliner(url, inliner_config, async (error, html) => {
    console.log(`stop http server`);
    server_process.kill();
    if (error) {
      const message = Inliner.errors[error.code] || error.message
      console.error(message)
      if (inliner_config.debug) console.error(error.stack)
      process.exit(1)
    }
    //console.log('html = ' + html.slice(0, 100) + ' ....')
    console.log(`write html to ${out_file}`);
    fs.writeFileSync(out_file, html, 'utf8');
    console.log(`done`);
  })
}

// https://github.com/apaszke/tcp-ping/blob/master/ping.js
function tcp_ping(address, port, timeout = 1000) {
  return new Promise((resolve, reject) => {
    try {
      const s = new net.Socket();
      s.connect(port, address, _ => {
        s.destroy();
        resolve({ status: 'ok' });
      });
      s.on('error', error => {
        s.destroy();
        resolve({ status: 'error', error });
      });
      s.setTimeout(timeout, _ => {
        s.destroy();
        resolve({ status: 'timeout' });
      });
    } catch (error) {
      reject({ status: 'error', error })
    }
  });
};

function sleep(t = 0) {
  return new Promise((resolve, reject) => {
    setTimeout(_ => resolve(), t);
  });
};

main();
