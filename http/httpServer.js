const http = require('http');
const upnp = require('peer-upnp');
const URL = require('url');
const PORT = 34800;

let axios = require('axios');
axios = axios.create({baseURL: `http://127.0.0.1:${PORT}`});

const handlers = require('./handlers');
const getDiscoverJson = handlers.getDiscoverJson;
const getLineupStatusJson = handlers.getLineupStatusJson;
const getLineupJson = handlers.getLineupJson;

module.exports.start = (m3u) => {
  function onRequest (req, res) {
    const url = URL.parse(req.url, true);

    if (url.pathname.indexOf(device.peer.prefix) !== 0) {
      switch (req.url) {
        case '/device.xml':
        case '/capability':
          res.writeHead(302, {
            'Location': device.descriptionURL
          });
          res.end();
          break;
        case '/discover.json':
          res.setHeader('Content-Type', 'application/json');
          if (req.method === 'GET') res.write(JSON.stringify(getDiscoverJson(PORT, device)));
          break;
        case '/lineup_status.json':
          res.setHeader('Content-Type', 'application/json');
          if (req.method === 'GET') res.write(JSON.stringify(getLineupStatusJson()));
          break;
        case '/lineup.json':
          res.setHeader('Content-Type', 'application/json');
          if (req.method === 'GET') res.write(JSON.stringify(getLineupJson(PORT, m3u)));
          break;
        default:
          res.writeHead(302, {
            'Location': device.descriptionURL
          });
          res.end();
      }

      res.end();
    }
  }

  const httpServer = http.createServer(onRequest).listen(PORT);
  console.log(`Listening on 127.0.0.1:${PORT}`);

// Create a HDHomeRun Device
  const peer = upnp.createPeer({
    prefix: '/upnp',
    server: httpServer
  }).on('ready', () => {
    console.log('Device Ready');
    device.advertise();
  }).on('close', () => {
    console.log('closed');
  }).start();

  const device = peer.createDevice({
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
};
