const os = require('os');
const path = require('path');
const fs = require('fs-extra');
const axios = require('axios');
const parser = require('xml2js');

const io = require('../tools/io');
const prop = require('../tools/properties');

module.exports = class Parser {

  constructor(app, config, m3uData) {
    this.app = app;
    this.config = config;
    this.m3uData = m3uData;

    this.output = this.app.output
      ? `${this.app.output}.xml`
      : 'new.xml';

  }

  async run() {
    switch (os.platform()) {
      case 'win32':
        io.info('Executing zap2xml.bat ...');
        const bat = path.resolve(process.cwd(), 'bin', 'zap2xml.bat');
        await io.spawnSync('cmd.exe', ['/c', bat, this.config.zap.email, this.config.zap.password]);
        break;
      case 'linux':
        break;
      default:
        io.error('XMLTV Failed: Unsupported OS detected.');
        process.exit(1);
    }

    await this.cleanup();
    io.success('Successfully Generated XMLTV Data');

    /* Begin parsing the data and making the changes to map the xml to the m3u playlist */
    // todo

  }

  async parseData(data) {
    parser.parseString(data, (err, results) => {
      if (err) {
        io.error(err);
        process.exit(1);
      }

      for (const [index, line] of this.m3uData.entries()) {
        // results.tv.channel[index].$.id
      }


      // modify the xml
      io.debug(JSON.stringify(results.tv.channel[0].$.id));

      // create a new builder object and then convert
      // our json back to xml.
      const builder = new parser.Builder();
      const xml = builder.buildObject(results);

      fs.writeFileSync(this.output, xml);

      io.success(`${this.output} written successfully!`);

      return xml;
    });
  }

  async cleanup() {
    io.info('Cleaning up ...');

    try {
      const file = path.resolve(process.cwd(), 'xmltv.xml');
      const exists = await fs.pathExists(file);

      await fs.remove(path.resolve(process.cwd(), 'output', this.output));

      do {
        setTimeout(async () => {
          await fs.move(path.resolve(process.cwd(), 'xmltv.xml'), path.resolve(process.cwd(), 'output', this.output));
          return '';
        }, 2000);
      } while (!exists);

    } catch (err) {
      io.error(err);
      process.exit(1);
    }
  }

};