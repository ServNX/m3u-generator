const SqlLite = require('sqlite3').verbose();
const ChannelsTable = require('../db/tables/channels');

module.exports = class DB {

  constructor (container) {
    this.container = container;
    this.db = new SqlLite.Database('./db/m3uTunerPro.db');

    /* Tables */
    this.channelsTable = new ChannelsTable(this.db);
  }

  /* Table Getters */
  get channels () {
    return this.channelsTable;
  };

  /* DB Methods */
  tableExists (table) {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM sqlite_master WHERE name = ? and type = ?', [table, 'table'], (err, row) => {
        if (err) reject(err);

        if (!row) resolve(false);

        resolve(true);
      });
    });
  }
};
