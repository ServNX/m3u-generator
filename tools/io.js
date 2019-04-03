const chalk = require('chalk');
const inquirer = require('inquirer');

module.exports.debug = (message) => console.log(chalk.blue(`[DEBUG] ${message}`));
module.exports.warning = (message) => console.log(chalk.yellow(`[WARN] ${message}`));
module.exports.success = (message) => console.log(chalk.green(`[OK] ${message}`));
module.exports.error = (message) => console.log(chalk.red(`[ERROR] ${message}`));
module.exports.info = (message) => console.log(chalk.cyan(message));

module.exports.intro = (message) => console.log(chalk.magenta(message));
module.exports.header = (message) => {
  console.log();
  console.log(chalk.magenta('='.repeat(18 + message.length)));
  console.log(chalk.magenta(`======== ${message} ========`));
  console.log(chalk.magenta('='.repeat(18 + message.length)));
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

