const path = require('path');

module.exports.base = base = (...args) => {
  return path.resolve(process.cwd(), ...args);
};

module.exports.db = (...args) => base('db', ...args);
module.exports.output = (...args) => base('output', ...args);
