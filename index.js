'use strict';
const fs = require('fs');
const app = require('commander');
const Parser = require('./tools/parser');

const figlet = require('figlet');
const xmljs = require('xml2js');
const io = require('./tools/io');
const prop = require('./tools/properties');
const config = require('./config');

// todo: add logger
// todo: add debug option and make use of it
// todo: add better output, maybe some input from users ?

app
  .version('0.1.0', '-v, --version')
  .option('--xmltv', 'Modify XLMTV Data for your new playlist')
  .option('-s, --search', 'Search results that are like the search term', false)
  .option('-o, --output [filename]', 'Specify the filename to be placed in the output directory', null, false)
  .parse(process.argv);

io.intro(figlet.textSync('M3U Generator', {
  font: 'Big Money-se',
  horizontalLayout: 'default',
  verticalLayout: 'default',
}));

const output = app.output ? `./output/${app.output}` : `./output/new`;
let newFileContents = ['#EXTM3U'];
let triggered = false;

async function run() {
  const parser = new Parser(app);

  await parser.getPlaylist()
    .then(async (playlist) => {

      const lines = await parser.getLines(playlist);

      if (!lines[0].toString().startsWith('#EXTINF:')) {
        io.error('Invalid m3u file format. Missing #EXTINF:');
        process.exit(1);
      }

      if (config.groups.length <= 0) {
        io.warning('No groups specified in configuration. Continuing ...');
      }

      let group = '';

      for (const [index, data] of lines.entries()) {
        const line = data.toString();

        if (index === lines.length - 1 && line === '') {
          break;
        }

        const name = prop.name(line);

        if (Object.keys(config.groups).includes(name)) {

          if (app.search) {
            io.info(`Searching for ${app.search} ...`);
            if (prop.hasKeyword(app.search.toLowerCase(), name.toLowerCase())) {
              io.success(`Found: ${name}`);
            }
          } else {
            if (config.excludes.length > 0) {

              let found = false;

              for (let ex of config.excludes) {
                io.debug(`ex: ${ex.toLowerCase()} name: ${name.toLowerCase()}`);
                found = prop.hasKeyword(ex.toLowerCase(), name.toLowerCase());
              }

              if (found) {
                // todo: add to logger
                io.warning(`Excluding: ${name}`);
                continue;
              }
            }

            if (!config.west && prop.includes(/^(WEST)\s|\s(WEST)$/g, name)) {
              continue;
            }

            if (!config.east && prop.includes(/^(EAST)\s|\s(EAST)$/g, name)) {
              continue;
            }

            let entry = line;
            // todo: add something in the config for search, replace ?
            entry = entry.replace(/USA: /g, '');

            group = prop.group(line);

            config.groups[group].channels ?
              config.groups[group].channels.push(entry) :
              config.groups[group].channels = [entry];

            triggered = true;
          }

        } else {
          if (triggered) {
            config.groups[group].channels.push(line);
            triggered = false;
          }
        }

      } // end for loop

      /* Start Generating the channel data */
      if (!app.search) {
        let chanNum = 2000;

        for (let key of Object.keys(config.groups)) {

          for (let line of config.groups[key].channels) {
            let entry = line;

            if (line.startsWith('#EXTINF:')) {
              entry = prop.addChanNum(line, chanNum++);
            }

            newFileContents.push(entry);
          }

          const len = config.groups[key].channels.length;
          chanNum = (chanNum - len / 2 + 1000);
        }

        fs.writeFileSync(`${output}.m3u`, newFileContents.join('\n'));

        io.success(`${Math.floor(newFileContents.length / 2).toString()} Channels Added Successfully!`);
      }

    })
    .catch(err => {
      io.error(err);
      process.exit(1);
    });

  /* Start XMLTV Stuff */
  if (app.xmltv) {
    await parser.getXmlTv()
      .then(xmltv => {

        xmljs.parseString(xmltv, (err, results) => {
          if (err) {
            io.error(err);
            process.exit(1);
          }

          // modify the xml
          // io.debug(JSON.stringify(results.tv.channel[0].$.id));

          // create a new builder object and then convert
          // our json back to xml.
          const builder = new xmljs.Builder();
          const xml = builder.buildObject(results);

          fs.writeFileSync(`${output}.xml`, xml);

          io.success(`${output}.xml written successfully!`);
        });
      })
      .catch(err => {
        io.error(err);
        process.exit(1);
      });
  }

}

// Run the application
run();
