const fs = require('fs');
const axios = require('axios');

const io = require('../tools/io');
const prop = require('../tools/properties');

module.exports = class M3uParser {

  constructor (container) {
    this.app = container.App;
    this.config = container.Config;
    this.db = container.DB;
  }

  async run() {
    if (this.config.m3u !== '') {

      if (this.config.m3u.startsWith('http')) {
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

            return await this.processData(data);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      // todo: validate the file exists before proceeding!
      io.info('Reading local m3u playlist ...');
      return fs.readFileSync(this.config.m3u, 'utf-8').toString();

    } else {
      io.error('m3u property in configuration must be set to a none empty value!');
      process.exit(1);
    }

  }

  async processData (data) {
    let triggered = false;
    let group = '';

    for (const [index, value] of data.entries()) {
      const line = value.toString();

      if (index === data.length - 1 && line === '') {
        break;
      }

      const name = prop.tvgName(line);

      if (this.isGroupInConfig(line)) {
        if (this.app.search) {
          const keyword = this.app.search;
          if (prop.hasKeyword(keyword, name.toLowerCase())) {
            io.success(`Found: ${name}`);
          }
        } else {
          if (this.isExcluded(name.toLowerCase())) {
            // todo: log warnings to logger
            continue;
          }

          if (!this.config.west && prop.isWest(name)) {
            continue;
          }

          if (!this.config.east && prop.isEast(name)) {
            continue;
          }

          group = prop.groupTitle(line);

          let entry = line;

          if (this.config.groups[group]['replace']) {
            const replaceObj = this.config.groups[group]['replace'];

            for (const re of Object.keys(replaceObj)) {
              const searchFor = new RegExp(re, 'g');
              const replaceWith = replaceObj[re].toString();

              entry = entry.replace(searchFor, replaceWith);
            }
          }

          this.config.groups[group].channels ?
            this.config.groups[group].channels.push(entry) :
            this.config.groups[group].channels = [entry];

          triggered = true;
        }

      } else {
        if (triggered) {
          this.config.groups[group].channels.push(line);
          triggered = false;
        }
      }

    }

    return this.app.search ? process.exit(1) : this.createNewPlaylist(this.config.groups);
  }

  async createNewPlaylist (groups) {
    if (groups.length <= 0) {
      io.error('No channels were added!');
      process.exit(1);
    }

    const output = this.app.output ? `./output/${this.app.output}.m3u` : `./output/new.m3u`;
    let newFileContents = ['#EXTM3U'];

    let chanNum = this.config.minChannelNum;

    for (let key of Object.keys(groups)) {

      for (let line of groups[key].channels) {
        let entry = line;

        if (line.startsWith('#EXTINF:')) {
          const chno = chanNum++;
          entry = prop.setChno(line, chno);
          entry = prop.setCUID(entry, `x-ID.${chno}`);
        }

        newFileContents.push(entry);
      }

      const len = groups[key].channels.length;
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

  isGroupInConfig (line) {
    return Object.keys(this.config.groups).includes(prop.groupTitle(line));
  }

};
