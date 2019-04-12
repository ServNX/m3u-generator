const chalk = require('chalk');
const {spawn, spawnSync} = require('child_process');
const inquirer = require('inquirer');

module.exports.debug = debug = (message) => console.log(chalk.blue(`[DEBUG] ${message}`));
module.exports.warning = warning = (message) => console.log(chalk.yellow(`[WARN] ${message}`));
module.exports.success = success = (message) => console.log(chalk.green(`[OK] ${message}`));
module.exports.error = error = (message) => console.log(chalk.red(`[ERROR] ${message}`));
module.exports.info = info = (message) => console.log(chalk.cyan(message));

module.exports.intro = (message) => console.log(chalk.magenta(message));
module.exports.header = (message) => {
  console.log();
  console.log(chalk.magenta('='.repeat(18 + message.length)));
  console.log(chalk.magenta(`======== ${message} ========`));
  console.log(chalk.magenta('='.repeat(18 + message.length)));
};

module.exports.dd = (...args) => {
  console.log(...args);
  process.exit(1);
};

module.exports.ask = (questions) => {
  return new Promise(async (resolve, reject) => {
    await inquirer.prompt(questions)
      .then(data => {
        return resolve(data);
      })
      .catch(err => {
        return reject(err);
      });
  });
};

module.exports.spawn = async (command, args = [], options = {}) => {
  const child = spawn(command, args, options);
  const dataBuffer = [];

  child.stdout.on('data', (data) => {
    // todo: logger and debug ?
    // debug(data.toString());
    dataBuffer.push(data);
  });

  child.stderr.on('data', (data) => {
    error(data.toString());
    process.exit(1);
  });

  child.on('exit', (code) => {
    // todo: logger and debug ?
    // console.log(`Child exited with code ${code}`);
    return dataBuffer.join('\n').toString();
  });
};

module.exports.spawnSync = (command, args = [], options = {}) => {
  const child = spawnSync(command, args, options);

  if (child.status !== null && child.status !== 0) {

    if (child.error)
      error(`error.message: ${child.error.message}`);

    if (child.stderr !== '')
      error(`stderr: ${child.stderr}`);

    error(`Exited with code ${child.status}`);
    process.exit(child.status);
  }

  return child.stdout;
};

