const App = require('commander');
const Config = require('../config');

const SqlLite = require('sqlite3').verbose();

const HttpServer = require('../http/httpServer');
const M3uParser = require('../parsers/m3uParser');
const XmlTvParser = require('../parsers/xmlTvParser');

const ChannelsTable = require('../db/tables/channels');

module.exports = (container) => {
  container.service('App', () => App);
  container.service('Config', () => Config);
  container.service('DB', () => new SqlLite.Database('./db/m3uTunerPro.db'));

  container.service('HttpServer', c => new HttpServer(c));
  container.service('M3uParser', c => new M3uParser(c));
  container.service('XmlTvParser', c => new XmlTvParser(c));

  container.service('Channels', c => new ChannelsTable(c.DB));
};
