const program = require('commander');

module.exports = class App {
  constructor () {
    program
      .version('0.1.0', '-v, --version')
      .option('-u, --update', 'Checks for application updates')
      .option('-f, --fresh', 'Refreshes the playlist and XEPG data')
      .parse(process.argv);

    this.program = program;
  }

  get app () {
    return this.program;
  }
};
