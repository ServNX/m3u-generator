'use strict';
const fs = require('fs');
const program = require('commander');
const figlet = require('figlet');
const axios = require('axios');

const io = require('./tools/io');
const prop = require('./tools/properties');

const config = require('./config');

program
  .version('0.1.0', '-v, --version')
  .option('--no-west', 'Does its best to exclude WEST Timezone')
  .option('--no-east', 'Does its best to exclude EAST Timezone')
  .option('-o, --output [filename]', 'Specify the filename to be placed in the output directory', null, false)
  .parse(process.argv);

io.info(figlet.textSync('M3U Generator', {
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

let file;
let filters;

async function getData () {
  if (config.url !== '') {
    file = config.url;
    filters = program.args;
  } else {
    file = program.args[0];
    filters = program.args.splice(1);
  }

  if (file.toString().startsWith('http')) {
    return await axios.get(file.toString())
      .then(resp => {
        return Promise.resolve(resp.data);
      })
      .catch(err => {
        return Promise.reject(err.response);
      });
  }

  return Promise.resolve(fs.readFileSync(file).toString());
}

async function run () {

  const _data = await getData().catch(err => {
    io.error(err);
    process.exit(1);
  });

  if (!_data) {
    io.error('Something went wrong with populating the required data. Report this bug!');
    process.exit(1);
  }

  const arr = _data.split('\n').splice(1);

  if (!arr[0].toString().startsWith('#EXTINF:')) {
    io.error('Invalid m3u file format. Missing #EXTINF:');
    process.exit(1);
  }

  let group = '';
  let channelNum = 9000;
  const groups = {};

  for (const [index, data] of arr.entries()) {
    const line = data.toString();

    if (index === arr.length - 1 && line === '') { break; }

    if (
      !program.noWest &&
      (prop.name(line).includes(' WEST') ||
        prop.name(line).includes('WEST '))
    )
      continue;

    if (
      !program.noWest &&
      (prop.name(line).includes(' EAST') ||
        prop.name(line).includes('EAST '))
    )
      continue;

    if (filters.includes(prop.group(line.toLowerCase()))) {
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

  let output = program.output ? `./output/${program.output}` : `./output/new.m3u`;
  fs.writeFileSync(output, newFileContents.join('\n'));

  io.success(`${Math.floor(newFileContents.length / 2).toString()} Channels Added Successfully!`);
}

// Run the application
run();
