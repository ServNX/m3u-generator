// copy or rename this file to config.js (which will be ignored in VCS)
module.exports = {
  // Set this to the URL or FILE PATH to your m3u playlist.
  m3u: 'http://****:2086/get.php?username=***&password=***&type=m3u_plus&output=ts',

  // Allow Western Timezones ?
  west: false,

  // All Eastern Timezones ?
  east: true,

  // ZAP2IT Login Info
  zap: {
    email: 'email@gmail.com',
    password: 'PASSWORD'
  },

  // Groups that you want to GRAB from your m3u playlist
  // Note: Is pulled from the tvg-group property
  groups: {
    'USA TV': {
      // Replace feature
      // Example: In this group I want to replace USA: with nothing (removing USA: from the channel name)
      replace: {
        'USA:\\s': ''
      }
    },
    'KIDS TV': {},
    'NFL': {},
    '24/7 CHANNELS': {},
  },

  // Excludes channels from if the tvg-name property contains ANY of the keywords defined here
  excludes: [
    'afn',
    'adult swim',
    'bein',
    'fox sports',
    'abc',
    'sports 4u',
    'AMAZING DISCOVERIES',
    'ANTENNA TV',
    'ATLANTA CHANNEL',
    'AXS TV',
    'bounce',
    'BUZZR',
    'AKC TV',
    'cbn',
    'CELEBRITY PAGE TV',
    'CLASSIC ARTS',
    'CHARGE!',
    'DC COUNCIL CHANNEL',
    'classic tv',
    'DANCE MUSIC TV',
    'DANCESTAR TV',
    'DECADES',
    'DISCOVERY SHOWCASE',
    'DISTRICT',
    'DITTY',
    'DOCUMENTARIES 4U',
    'DOCURAMA',
    'DOG TV',
    'DPAN TV',
    'dw',
    'ELEVEN SPORTS',
    'ESPN COLLEGE EXTRA',
    'ESPN Bases Loaded',
    'FASHION',
    'FOX DEPORTS',
    'FOX SOCCER',
    'FLASHBACK',
    'FRONTDOOR',
    'nbc sports',
    'nesn',
    'PAC 12',
    'STADIUM',
    'TVW',
    'TVW-2'
  ]

};
