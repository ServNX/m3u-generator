const fs = require('fs-extra');
const axios = require('axios');

const io = require('../tools/io');
const prop = require('../tools/properties');
const path = require('../tools/paths');

module.exports = class M3uParser {

  constructor (container) {
    this.app = container.App;
    this.config = container.Config;
    this.db = container.DB;

    this.rawData = null;

    this.groups = {};
  }

  async run () {
    if (this.config.m3u !== '') {

      const channels = await this.db.channels.all()
        .catch(err => {
          io.error(err);
          process.exit(1);
        });

      if (channels.length <= 0 || this.app.refresh) {

        if (this.config.m3u.startsWith('http')) {
          this.rawData = await this.downloadRemotePlaylist();
        } else {
          if (!fs.exists(this.config.m3u)) {
            io.error(`${this.config.m3u} Not Found!`);
            process.exit(1);
          }

          io.info('Reading local m3u playlist ...');
          this.rawData = fs.readFileSync(this.config.m3u, 'utf-8').toString();
        }

        await this.processData();
        return await this.createNewPlaylist();
      }

    } else {
      io.error('m3u property in configuration must be set to a none empty value!');
      process.exit(1);
    }

  }

  async downloadRemotePlaylist () {
    io.info('Downloading remote m3u playlist ...');
    return await axios.get(this.config.m3u)
      .then(async resp => {
        const results = resp.data.toString();
        let data = results.split('\n');

        if (results.startsWith('#EXTM3U')) {
          data = data.splice(1);
        }

        if (!data[0].toString().startsWith('#EXTINF:')) {
          io.error('Invalid m3u file format. Missing #EXTINF:');
          process.exit(1);
        }

        return data;
      })
      .catch(err => {
        return Promise.reject(err);
      });
  }

  async processData () {
    let group = '';
    let triggered = false;

    for (const [index, value] of this.rawData.entries()) {
      const line = value.toString();

      if (index === this.rawData.length - 1 && line === '') {
        break;
      }

      if (line.startsWith('#EXTINF:')) {
        if (this.groupInConfig(prop.groupTitle(line))) {
          const name = prop.tvgName(line);

          if (this.isExcluded(name.toLowerCase())) continue;
          if (!this.config.west && prop.isWest(name)) continue;
          if (!this.config.east && prop.isEast(name)) continue;

          /* set the group so that on the next iteration, the url can be added under this line */
          group = prop.groupTitle(line);
          this.pushToGroup(line, group);
          triggered = true;
        }
      } else if (triggered) {
        this.pushUrlToGroup(group, line);
        triggered = false;
      }

    }

    return true;
  }

  pushToGroup (line, group) {
    let entry = line.trim();

    entry = this.replacer(group, entry);

    this.groups[group] ?
      this.groups[group].push(entry) :
      this.groups[group] = [entry];
  }

  pushUrlToGroup (group, line) {
    this.groups[group].push(line.trim());
  }

  replacer (group, entry) {
    if (this.config.groups[group]['replace']) {
      const replaceObj = this.config.groups[group]['replace'];

      for (let re of Object.keys(replaceObj)) {
        let searchFor = re;

        if (re.startsWith('r/')) {
          searchFor = new RegExp(re.split('/')[1], 'g');
        }

        const replaceWith = replaceObj[re];

        entry = entry.replace(searchFor, replaceWith).trim();
      }
    }

    return entry;
  }

  async createNewPlaylist () {
    if (this.groups.length <= 0) {
      io.error('No groups were added!');
      process.exit(1);
    }

    const output = this.config.output.m3u;
    let newFileContents = ['#EXTM3U'];

    let chanNum = this.config.minChannelNum;

    for (let key of Object.keys(this.groups)) {
      let name = null;
      let logo = null;
      let chno = null;
      let url = null;

      for (let line of this.groups[key]) {
        let entry = line;

        if (line.startsWith('#EXTINF:')) {
          chno = chanNum++;
          name = prop.tvgName(entry);
          logo = prop.tvgLogo(entry);
          entry = prop.setChno(line, chno);
        } else {
          url = line;
          this.db.channels
            .create(name, chno, key, logo, url)
            .catch(err => {
              io.error(err);
              process.exit(1);
            });
        }

        newFileContents.push(entry);
      }

      const len = this.groups[key].length;
      chanNum = (chanNum - len / 2 + 1000);
    }

    fs.writeFileSync(output, newFileContents.join('\n'));

    io.success(`${Math.floor(newFileContents.length / 2).toString()} Channels Added Successfully!`);

    return newFileContents;
  }

  isExcluded (name) {
    const excludes = this.config.excludes;

    if (excludes.length > 0) {
      for (let ex of excludes) {
        if (prop.hasKeyword(ex.toLowerCase(), name.toLowerCase())) {
          return true;
        }
      }
    }

    return false;
  }

  groupInConfig (group) {
    return Object.keys(this.config.groups).includes(group);
  }

};
