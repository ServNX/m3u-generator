const App = require('commander');
const Config = require('../config');

const DB = require('../db/DB');
const HttpServer = require('../http/httpServer');
const M3uParser = require('../parsers/m3uParser');
const XmlTvParser = require('../parsers/xmlTvParser');

module.exports = (container) => {
  container.service('App', () => App);
  container.service('Config', () => Config);

  container.service('DB', c => new DB(c));
  container.service('HttpServer', c => new HttpServer(c));
  container.service('M3uParser', c => new M3uParser(c));
  container.service('XmlTvParser', c => new XmlTvParser(c));
};
