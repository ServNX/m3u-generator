const path = require('path');

module.exports.appPath = (...args) => {
  return path.resolve(process.cwd(), ...args);
};
