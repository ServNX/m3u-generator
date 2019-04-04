const fs = require('fs');
const axios = require('axios');
const io = require('./io');

const config = require('../config');

module.exports = class Parser {

    constructor(app) {
        this.app = app;
    }

    async getPlaylist() {
        if (config.m3u !== '') {
            if (config.m3u.startsWith('http')) {
                io.info('Downloading remote m3u playlist ...');
                return await axios.get(config.m3u)
                  .then(resp => {
                      return Promise.resolve(resp.data);
                  })
                  .catch(err => {
                      return Promise.reject(err.response);
                  });
            }

            // todo: validate the file exists before proceeding!
            io.info('Reading local m3u playlist ...');
            return Promise.resolve(fs.readFileSync(config.m3u, 'utf-8').toString());
        } else {
            io.error('m3u property in configuration must be set to a none empty value!');
            process.exit(1);
        }
    }

    async getXmlTv() {
        if (config.xmltv !== '') {
            if (config.xmltv.startsWith('http')) {
                io.info('Downloading remote xmltv data ...');
                return await axios.get(config.xmltv)
                  .then(resp => {
                      return Promise.resolve(resp.data);
                  })
                  .catch(err => {
                      return Promise.reject(err.response);
                  });
            }

            // todo: validate the file exists before proceeding!
            io.info('Reading local xmltv data ...');
            return Promise.resolve(fs.readFileSync(config.xmltv, 'utf-8').toString());
        } else {
            io.warning('No xmltv file specified in configuration. Continuing ...');
        }
    }

    async getLines(data) {
        return data.split('\n').splice(1);
    }
};