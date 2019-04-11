module.exports = class Lineup {
  constructor (db) {
    this.db = db;

    // todo: check if table exists ?
    this.createTable();
  }

  createTable () {
    this.db.serialize(() => {
      this.db.run('CREATE TABLE lineup (name TEXT, number TEXT, url TEXT)');
    });
  }

  destroyTable () {
    this.db.serialize(() => {
      // this.db.run();
    });
  }

  async all () {
    this.db.all('SELECT * FROM lineup', (err, rows) => {
      if (err) return Promise.reject(err);
      return rows;
    });
  }

  async getByName (name) {
    this.db.get('SELECT * FROM lineup WHERE name=?', [name], (err, row) => {
      if (err) return Promise.reject(err);
      return row;
    });
  }

  async create (name, number, url) {
    this.db.run('INSERT INTO lineup VALUES (?,?,?)', [name, number, url], err => {
      if (err) return Promise.reject(err);
    });

    return true;
  }

  async setName (newName, oldName) {
    this.db.run(`UPDATE lineup
                 SET name = ?
                 WHERE name = ?`, [newName, oldName], err => {
      if (err) return Promise.reject(err);
    });

    return true;
  }

  async setNumber (number, name) {
    this.db.run(`UPDATE lineup
                 SET number = ?
                 WHERE name = ?`, [number, name], err => {
      if (err) return Promise.reject(err);
    });

    return true;
  }

  async setURL (url, name) {
    this.db.run(`UPDATE lineup
                 SET url = ?
                 WHERE name = ?`, [url, name], err => {
      if (err) return Promise.reject(err);
    });

    return true;
  }

};
