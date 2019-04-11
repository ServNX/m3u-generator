const prop = require('../tools/properties');

module.exports = {
  getDiscoverJson (port, device) {
    return {
      BaseURL: `http://127.0.0.1:${port}`,
      DeviceAuth: 'm3upro',
      DeviceID: device.uuid,
      FirmwareName: `bin_${device.productVersion}`,
      FirmwareVersion: device.productVersion,
      FriendlyName: device.friendlyName,
      LineupURL: `http://127.0.0.1:${port}/lineup.json`,
      Manufacturer: 'nodejs',
      ModelNumber: device.productVersion,
      TunerCount: 3
    };
  },

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
  },

  async getLineupJson (port, m3u) {
    let name;
    let chno;
    let triggered = false;

    const guideData = [];

    for (const line of m3u) {

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
  },
};
