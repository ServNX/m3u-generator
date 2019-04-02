'use strict';
const fs = require('fs');
const program = require('commander');
const figlet = require('figlet');
const request = require('request');
const io = require('./tools/io');
const prop = require('./tools/properties');

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

let newFileContents = ['#EXTM3U'];
let triggered = false;

if (program.args.length <= 0) {
  io.error('Must specify a local or remote file as the first argument');
  process.exit(1);
}

if (program.args.length <= 1) {
  io.error('Must specify at least 1 group');
  process.exit(1);
}

const file = program.args[0];
const filters = program.args.splice(1);

async function getData () {
  if (file.toString().startsWith('http')) {
    request.get(file, (error, response, body) => {
      if (!error && response.statusCode === 200) {
        return body;
      }
    });
  } else {
    return fs.readFileSync(file).toString();
  }
}

async function run () {
  const _data = await getData().catch(err => {
    io.error(err);
    process.exit(1);
  });

  const arr = _data.split('\n').splice(1);

  if (!arr[0].toString().startsWith('#EXTINF:')) {
    io.error('Invalid m3u file format. Missing #EXTINF:');
    process.exit(1);
  }

  let group = '';
  let channelNum = 1000;
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

      channelNum = channelNum + 1;

      // #EXTINF:-1 tvg-id="AXSTV.us" tvg-name="USA: AXS TV" tvg-logo="http://www.axs.tv/ui/images/hdnet_programs/fbthumb_axstv_20140224.png" group-title="USA TV",USA: AXS TV
      // http://***.co:2086/***/***/18677
      // to
      // #EXTINF:0 channelID="x-ID.38" tvg-chno="1004" tvg-name="USA: CINEMAX" tvg-id="1004" tvg-logo="https://media.filbalad.com/Places/logos/Medium/86957_photo.jpg" group-title="USA TV",USA: CINEMAX
      // http://***.co:2086/***/***/13560

      const entry = line
        .replace(` tvg-name="`, ` tvg-chno="${channelNum}" tvg-name="`).trim();

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
    for (let line of groups[key]) {
      newFileContents.push(line);
    }
  }

  let output = program.output ? `./output/${program.output}` : `./output/new.m3u`;
  fs.writeFileSync(output, newFileContents.join('\n'));

  io.success('Completed Successfully!');
}

run();
