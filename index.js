'use strict';
const app = require('commander');
const httpServer = require('./http/httpServer');

const M3U = require('./classes/m3u');
const XMLTV = require('./classes/xmltv');

const figlet = require('figlet');
const io = require('./tools/io');
const config = require('./config');

// todo: add logger
// todo: add debug option and make use of it
// todo: add better output, maybe some input from users ?

app
  .version('0.1.0', '-v, --version')
  .option('-s, --search <keyword>', 'Search results that are like the search term')
  .option('-o, --output [filename]', 'Specify the filename to be placed in the output directory', null, false)
  .parse(process.argv);

io.intro(figlet.textSync('M3U Pro', {
  font: 'Big Money-se',
  horizontalLayout: 'default',
  verticalLayout: 'default',
}));

async function run() {
  const m3u = new M3U(app, config);

  await m3u.run()
    .then(async data => {
      httpServer.start(data);
    })
    .catch(err => {
      io.error(err);
      process.exit(1);
    });


}

// Run the application
run();
