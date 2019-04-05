const fs = require('fs');
const axios = require('axios');
const parser = require('xml2js');

const io = require('../tools/io');
const prop = require('../tools/properties');

module.exports = class Parser {

    constructor (app, config) {
        this.app = app;
        this.config = config;

        this.data = null;
    }

    async download () {
        if (this.config.xmltv !== '') {
            if (this.config.xmltv.startsWith('http')) {
                io.info('Downloading remote xmltv data ...');
                return await axios.get(this.config.xmltv)
                  .then(async resp => {
                    return await this.parseData(resp.data);
                  })
                  .catch(err => {
                      return Promise.reject(err.response);
                  });
            }

            // todo: validate the file exists before proceeding!
          return fs.readFileSync(this.config.xmltv, 'utf-8').toString();
        } else {
            io.warning('No xmltv file specified in configuration. Continuing ...');
        }
    }

  async parseData(data) {
    const output = this.app.output ? `./output/${this.app.output}.xml` : `./output/new.xml`;

    parser.parseString(data, (err, results) => {
      if (err) {
        io.error(err);
        process.exit(1);
      }

      // modify the xml
      // io.debug(JSON.stringify(results.tv.channel[0].$.id));

      // create a new builder object and then convert
      // our json back to xml.
      const builder = new parser.Builder();
      const xml = builder.buildObject(results);

      fs.writeFileSync(output, xml);

      io.success(`${output} written successfully!`);
    });
  }
};