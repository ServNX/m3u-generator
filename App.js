const app = require('commander');

module.exports = class App {
  constructor () {
    app
      .version('0.1.0', '-v, --version')
      .option('-u, --update', 'Checks for application updates')
      .option('-r, --refresh', 'Refreshes the playlist and XEPG data')
      .parse(process.argv);
  }
};
