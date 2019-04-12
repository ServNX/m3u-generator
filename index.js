'use strict';
const figlet = require('figlet');

const container = require('./container/createContainer')();
const app = container.App;
const httpServer = container.HttpServer;
const config = container.Config;
const db = container.DB;
const m3u = container.M3uParser;

const io = require('./tools/io');

// todo: add logger
// todo: add debug option and make use of it
// todo: add better output to console

app
  .version('0.1.0', '-v, --version')
  .option('-u, --update', 'Update the playlist and XEPG data')
  .parse(process.argv);

io.intro(figlet.textSync('M3U Pro', {
  font: 'Big Money-se',
  horizontalLayout: 'default',
  verticalLayout: 'default',
}));

async function run() {
  const dataExists = await db.tableExists('channels');
  if (!dataExists) await db.channels.createTable();

  await m3u.run()
    .catch(err => {
      io.error(err);
      process.exit(1);
    });

  httpServer.start();
}

// Run the application
run();
