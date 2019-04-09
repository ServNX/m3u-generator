const os = require('os');
const path = require('path');
const fs = require('fs-extra');
const axios = require('axios');
const parser = require('xml2js');

const io = require('../tools/io');
const prop = require('../tools/properties');

module.exports = class Parser {

  constructor (app, config, m3uData) {
    this.app = app;
    this.config = config;
    this.m3uData = m3uData;

    this.output = this.app.output
      ? `${this.app.output}.xml`
      : 'new.xml';

  }

  async run () {
    switch (os.platform()) {
      case 'win32':
        const zapExists = await fs.pathExists(path.resolve(process.cwd(), 'bin', 'zap2xml.exe'));
        if (!zapExists) {
          io.info('Downloading zap2xml.exe ...');
          await this.downloadZap()
            .then(() => {
              io.success('Download Successful');
            })
            .catch(err => {
              io.error(err);
              process.exit(1);
            });
        }

        io.info('Executing zap2xml.bat ...');
        const batPath = path.resolve(process.cwd(), 'bin', 'zap2xml.bat');
        const batData = await io.spawnSync('cmd.exe', ['/c', batPath, this.config.zap.email, this.config.zap.password]);
        break;

      case 'linux':
        break;
      default:
        io.error('XMLTV Failed: Unsupported OS detected.');
        process.exit(1);
    }

    try {
      const file = path.resolve(process.cwd(), 'xmltv.xml');
      do {} while (!await fs.pathExists(file));

      await fs.remove(path.resolve(process.cwd(), 'output', this.output));

      setTimeout(async () => {
        await fs.move(path.resolve(process.cwd(), 'xmltv.xml'), path.resolve(process.cwd(), 'output', this.output));
        return await this.parseData();
      }, 2000);

    } catch (err) {
      io.error(err);
      process.exit(1);
    }

    io.success(`Successfully created ${path.resolve(process.cwd(), 'output', this.output)}`);
  }

  async downloadZap() {
    const dPath = path.resolve(process.cwd(), 'bin', 'zap2xml.exe');
    const writer = fs.createWriteStream(dPath);

    const response = await axios.get('http://m3u.servnx.com/bin/zap2xml.exe', {
      responseType: 'stream'
    });

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  }

  async parseData () {
    // const data = fs.readFileSync(path.resolve(process.cwd(), 'output', this.output), 'utf-8').toString();
    //
    // parser.parseString(data, (err, results) => {
    //   if (err) {
    //     io.error(err);
    //     process.exit(1);
    //   }
    //
    //   for (const channel of results.tv.channel) {
    //     for (const name of channel['display-name']) {
    //       for (const line of this.m3uData) {
    //         if (line.toString().startsWith('#EXTINF:')) {
    //           const likeCheck = new RegExp(name, 'gi');
    //           if (likeCheck.test(prop.tvgName(line))) {
    //             io.debug(`${prop.tvgName(line)} is like ${name}`);
    //           }
    //         }
    //       }
    //     }
    //   }
    //
    //   // create a new builder object and then convert
    //   // our json back to xml.
    //   // const builder = new parser.Builder();
    //   // const xml = builder.buildObject(results);
    //   //
    //   // fs.writeFileSync(this.output, xml);
    //   //
    //   io.success(`${this.output} written successfully!`);
    //   //
    //   // return xml;
    // });
  }
};