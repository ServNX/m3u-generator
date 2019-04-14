module.exports = class Channel {

  constructor (DB) {
    this.db = DB;

    this.createTable();
  }

  async createTable () {
    this.db.serialize(() => {
      this.db.run(
          `CREATE TABLE IF NOT EXISTS channels
           (
               id      INTEGER PRIMARY KEY AUTOINCREMENT,
               name    TEXT,
               number  TEXT,
               "group" TEXT,
               logo    TEXT,
               url     TEXT
           )`
      );
    });

    return true;
  }

  async destroyTable () {
    this.db.serialize(() => {
      // this.db.run();
    });

    return true;
  }

  all () {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT * FROM channels', (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });
  }

  async getById (id) {
    return this.db.get('SELECT * FROM channels WHERE id=?', [id], (err, row) => {
      if (err) return Promise.reject(err);
      return row;
    });
  }

  async getByName (name) {
    return this.db.all('SELECT * FROM channels WHERE name=?', [name], (err, rows) => {
      if (err) return Promise.reject(err);
      return rows;
    });
  }

  async create (name, number, group, logo, url) {
    this.db.run('INSERT INTO channels (name, number, "group", logo, url) VALUES (?,?,?,?,?)', [name, number, group, logo, url], err => {
      if (err) return Promise.reject(err);
    });

    return true;
  }

  async setNameWhereId (name, id) {
    this.db.run(`UPDATE channels
                 SET name = ?
                 WHERE id = ?`, [name, id], err => {
      if (err) return Promise.reject(err);
    });

    return true;
  }

  async setNumberWhereId (number, id) {
    this.db.run(`UPDATE channels
                 SET number = ?
                 WHERE id = ?`, [number, id], err => {
      if (err) return Promise.reject(err);
    });

    return true;
  }

  async setGroupWhereId (group, id) {
    this.db.run(`UPDATE channels
                 SET "group" = ?
                 WHERE id = ?`, [group, id], err => {
      if (err) return Promise.reject(err);
    });

    return true;
  }

  async setLogoWhereId (logo, id) {
    this.db.run(`UPDATE channels
                 SET logo = ?
                 WHERE id = ?`, [logo, id], err => {
      if (err) return Promise.reject(err);
    });

    return true;
  }

  async setUrlWhereId (url, id) {
    this.db.run(`UPDATE channels
                 SET url = ?
                 WHERE id = ?`, [url, id], err => {
      if (err) return Promise.reject(err);
    });

    return true;
  }

};
