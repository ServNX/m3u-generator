'use strict';
const fs = require('fs');
const program = require('commander');
const figlet = require('figlet');
const axios = require('axios');
const xmljs = require('xml2js');
const io = require('./tools/io');
const prop = require('./tools/properties');

const config = require('./config');

function exclude (val) {
  return val.split(',');
}


program
  .version('0.1.0', '-v, --version')
  .option('--xmltv', 'Modify XLMTV Data for your new playlist')
  .option('--no-west', 'Does its best to exclude WEST Timezone')
  .option('--no-east', 'Does its best to exclude EAST Timezone')
  .option('-e, --exclude <values>', 'Exclude channels with these keywords', exclude)
  .option('-o, --output [filename]', 'Specify the filename to be placed in the output directory', null, false)
  .parse(process.argv);

io.intro(figlet.textSync('M3U Generator', {
  font: 'Big Money-se',
  horizontalLayout: 'default',
  verticalLayout: 'default',
}));

if (program.args.length <= 0) {
  io.error('Invalid Usage!');
  process.exit(1);
}

let newFileContents = ['#EXTM3U'];
let triggered = false;

const filters = program.args;

async function getPlaylist () {
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

async function getXmlTv () {
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
    io.error('xmltv property in configuration must be set to a none empty value!');
    process.exit(1);
  }

}

async function run () {
  let _xmltv;

  const _data = await getPlaylist().catch(err => {
    io.error(err);
    process.exit(1);
  });

  io.info('Validating m3u data ...');

  if (!_data) {
    io.error('Something went wrong with populating the required data. Report this bug!');
    process.exit(1);
  }

  const arr = _data.split('\n').splice(1);

  if (!arr[0].toString().startsWith('#EXTINF:')) {
    io.error('Invalid m3u file format. Missing #EXTINF:');
    process.exit(1);
  }

  if (program.xmltv) {
    _xmltv = await getXmlTv().catch(err => {
      io.error(err);
      process.exit(1);
    });

    io.info('Validating xmltv data ...');

    if (!_xmltv) {
      io.error('Something went wrong with populating the required xmltv data. Report this bug!');
      process.exit(1);
    }
  }

  let group = '';
  let channelNum = 9000;
  const groups = {};

  io.info('Generating new m3u data ...');
  for (const [index, data] of arr.entries()) {
    const line = data.toString();

    if (index === arr.length - 1 && line === '') { break; }

    if (filters.includes(prop.group(line.toLowerCase()))) {
      if (program.exclude.length > 0) {

        const ex = prop.name(line).toLowerCase().split(' ');
        const found = ex.some(r => program.exclude.indexOf(r) >= 0);

        if (found) {
          io.warning(`Excluding ${prop.name(line)}`);
          continue;
        }

      }

      if (!program.west && prop.includes(/^(WEST)\s|\s(WEST)$/g, prop.name(line))) {
        continue;
      }

      if (!program.east && prop.includes(/^(EAST)\s|\s(EAST)$/g, prop.name(line))) {
        continue;
      }

      let entry = line;
      entry = entry.replace(/USA: /g, '');

      group = prop.group(line);

      groups[group] ?
        groups[group].push(entry) :
        groups[group] = [entry];

      triggered = true;

    } else {
      if (triggered) {
        groups[group].push(line);
        triggered = false;
      }
    }

  }

  for (let key of Object.keys(groups)) {
    if (config.groups[key]) {
      channelNum = config.groups[key].chanNum;
    }

    for (let line of groups[key]) {
      let entry = line;

      if (line.toString().startsWith('#EXTINF:')) {
        channelNum = channelNum + 1;
        entry = prop.addChanNum(line, channelNum);
      }

      newFileContents.push(entry);
    }
  }

  let output = program.output ? `./output/${program.output}` : `./output/new`;
  fs.writeFileSync(`${output}.m3u`, newFileContents.join('\n'));

  if (_xmltv) {
    io.info('Generating new xmltv data ...');
    xmljs.parseString(_xmltv, (err, results) => {
      if (err) {
        io.error(err);
        process.exit(1);
      }

      // modify the xml
      // results.root.graph[0].node[0].weight = "99";

      // create a new builder object and then convert
      // our json back to xml.
      var builder = new xmljs.Builder();
      var xml = builder.buildObject(results);

      fs.writeFileSync(`${output}.xml`, xml);
    });

  }

  io.success(`${Math.floor(newFileContents.length / 2).toString()} Channels Added Successfully!`);
}

// Run the application
run();
