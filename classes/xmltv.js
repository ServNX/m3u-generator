const fs = require('fs');
const axios = require('axios/index');
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
                  .then(resp => {
                      return Promise.resolve(resp.data);
                  })
                  .catch(err => {
                      return Promise.reject(err.response);
                  });
            }

            // todo: validate the file exists before proceeding!
            io.info('Reading local xmltv data ...');
            return Promise.resolve(fs.readFileSync(this.config.xmltv, 'utf-8').toString());
        } else {
            io.warning('No xmltv file specified in configuration. Continuing ...');
        }
    }

};