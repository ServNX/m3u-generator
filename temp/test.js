const fs = require('fs-extra');
const path = require('path');
const upnp = require("peer-upnp");
const xml2js = require('xml2js');
const http = require("http");
const PORT = 34800;

let axios = require('axios');
axios = axios.create({baseURL: `http://localhost:${PORT}`});


function onRequest(req, res) {


  let json = null;
  let xml = null;

  switch (req.url) {
    case '/discover.json':
      res.setHeader('Content-Type', 'application/json;charset=utf-8');
      if (req.method === 'GET') json = getDiscoverJson();
      break;
    case '/lineup.json':
      // res.setHeader(name, value);
      if (req.method === 'GET') json = getLineupJson();
      break;
    default:
      json = getDiscoverJson();
  }

  json ? res.write(JSON.stringify(json)) : null;
  xml ? res.send(xml) : null;
  res.end();
}

function getDiscoverJson() {
  console.log('Requested discover.json');

  return {
    "BaseURL": `http://192.168.1.2:${PORT}`,
    "DeviceAuth": "m3upro",
    "DeviceID": device.uuid,
    "FirmwareName": `bin_${device.productVersion}`,
    "FirmwareVersion": device.productVersion,
    "FriendlyName": device.friendlyName,
    "LineupURL": `http://192.168.1.2:${PORT}/lineup.json`,
    "Manufacturer": "nodejs",
    "ModelNumber": device.productVersion,
    "TunerCount": 3
  };
}

function getLineupJson() {
  console.log('Requested lineup.json');

  return [
    {
      "GuideName": "HBO",
      "GuideNumber": "1000",
      "URL": `http://192.168.1.2:${PORT}/stream/aHR0cDovL3RoZXBrLmNvOjIwODYvNjU1NjU4MjU1NC85NjUxMjM0MDMwLzEyNzI=`
    },
  ];
}

const httpServer = http.createServer(onRequest).listen(PORT);
console.log("Listening on " + PORT);

// Create a UPnP Peer.
const peer = upnp.createPeer({
  prefix: "/upnp",
  server: httpServer
}).on("ready", async (peer) => {
  console.log("Device Ready");
  device.advertise();
}).on("close", (peer) => {
  console.log("closed");
}).start();

const device = peer.createDevice({
  autoAdvertise: true,
  uuid: "be976c91-6de8-4bec-b3b5-b635cd55c6ef",
  productName: "M3U-Pro",
  productVersion: "0.1.0",
  domain: "schemas-upnp-org",
  type: "MediaServer",
  version: "1",
  friendlyName: "M3U-Pro",
  manufacturer: "Silicondust",
  modelName: "HDTC-2US",
  modelNumber: "HDTC-2US",
});
