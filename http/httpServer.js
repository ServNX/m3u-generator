const http = require('http');
const upnp = require('peer-upnp');
const URL = require('url');
const Axios = require('axios');

module.exports = class HttpServer {
  constructor (container) {
    this.m3uParser = container.m3uParser;

    this.port = port || 34800;
    this.axios = Axios.create({baseURL: `http://127.0.0.1:${this.port}`});
    this.peer = null;
    this.device = null;
  }

  async start () {
    /* Create Web Server */
    const server = http.createServer(this.onRequest).listen(this.port);
    console.log(`Listening on 127.0.0.1:${this.port}`);

    /* Create a HDHomeRun Device */
    this.peer = upnp.createPeer({
      prefix: '/upnp',
      server: server
    }).on('ready', () => {
      console.log('Device Ready');
      this.device.advertise();
    }).on('close', () => {
      console.log('closed');
    }).start();

    this.device = this.peer.createDevice({
      autoAdvertise: true,
      uuid: 'be976c91-6de8-4bec-b3b5-b635cd55c6ef',
      productName: 'M3U-Pro',
      productVersion: '0.1.0',
      domain: 'schemas-upnp-org',
      type: 'MediaServer',
      version: '1',
      friendlyName: 'M3U-Pro',
      manufacturer: 'Silicondust',
      modelName: 'HDTC-2US',
      modelNumber: 'HDTC-2US',
    });
  }

  onRequest (req, res) {
    const url = URL.parse(req.url, true);

    if (url.pathname.indexOf(this.device.peer.prefix) !== 0) {
      switch (req.url) {
        case '/device.xml':
        case '/capability':
          res.writeHead(302, {
            'Location': this.device.descriptionURL
          });
          res.end();
          break;
        case '/discover.json':
          res.setHeader('Content-Type', 'application/json');
          if (req.method === 'GET') res.write(JSON.stringify(this.getDiscoverJson()));
          res.end();
          break;
        case '/lineup_status.json':
          res.setHeader('Content-Type', 'application/json');
          if (req.method === 'GET') res.write(JSON.stringify(this.getLineupStatusJson()));
          res.end();
          break;
        case '/lineup.json':
          res.setHeader('Content-Type', 'application/json');
          if (req.method === 'GET') res.write(JSON.stringify(this.getLineupJson()));
          res.end();
          break;
        default:
          res.writeHead(302, {
            'Location': this.device.descriptionURL
          });
          res.end();
      }
    }
  }

  /* HANDLERS */
  getDiscoverJson () {
    return {
      BaseURL: `http://127.0.0.1:${this.port}`,
      DeviceAuth: 'm3upro',
      DeviceID: this.device.uuid,
      FirmwareName: `bin_${this.device.productVersion}`,
      FirmwareVersion: this.device.productVersion,
      FriendlyName: this.device.friendlyName,
      LineupURL: `http://127.0.0.1:${this.port}/lineup.json`,
      Manufacturer: 'nodejs',
      ModelNumber: this.device.productVersion,
      TunerCount: 3
    };
  }

  async getLineupJson () {
    let name;
    let chno;
    let triggered = false;

    const guideData = [];

    for (const line of this.m3uParser.getNewData()) {

      if (line.startsWith('#EXTINF:')) {
        name = prop.tvgName(line);
        chno = prop.tvgChno(line);
        triggered = true;
        continue;
      }

      if (triggered) {
        guideData.push({
          GuideName: name,
          GuideNumber: chno,
          URL: line
        });
        triggered = false;
      }
    }

    return guideData;
  }

  getLineupStatusJson () {
    return {
      ScanInProgress: 0,
      ScanPossible: 1,
      Source: 'Cable',
      SourceList: [
        'Antenna',
        'Cable'
      ]
    };
  }

};