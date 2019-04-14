'use strict';
const fs = require('fs-extra');
const figlet = require('figlet');
const paths = require('./tools/paths');
const io = require('./tools/io');

const container = require('./container/createContainer')();
const app = container.App;
const httpServer = container.HttpServer;
const config = container.Config;
const db = container.DB;
const m3u = container.M3uParser;

// todo: add logger
// todo: add debug option and make use of it
// todo: add better output to console

io.intro(figlet.textSync('M3U Pro', {
  font: 'Big Money-se',
  horizontalLayout: 'default',
  verticalLayout: 'default',
}));

async function run () {
  httpServer.start();

  await m3u.run()
    .catch(err => {
      io.error(err);
      process.exit(1);
    });
}

// Run the application
run();
