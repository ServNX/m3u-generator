const SqlLite = require('sqlite3').verbose();
const db = new SqlLite.Database('./m3uTunerPro.db');

/* Table Classes */
const LineupTable = require('./tables/lineup');

module.exports = class DB {
  constructor (container) {
    this.container = container;

    /* Initialize Tables */
    this.lineup = new LineupTable(this);
  }

  Lineup () {
    return this.lineup;
  }

};