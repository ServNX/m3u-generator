'use strict';
const figlet = require('figlet');

const container = require('./container/createContainer')();
const app = container.App;
const httpServer = container.HttpServer;
const config = container.Config;

const io = require('./tools/io');

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
