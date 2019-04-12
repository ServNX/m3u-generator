// copy or rename this file to config.js (which will be ignored in VCS)
module.exports = {
  // Set this to the URL or ABSOLUTE FILE PATH to your m3u playlist.
  m3u: 'http://****:2086/get.php?username=***&password=***&type=m3u_plus&output=ts',

  // Set this to the URL or ABSOLUTE FILE PATH to your m3u playlist.
  xmltv: 'http://****:2086/xmltv.php?username=***&password=***&type=m3u_plus&output=ts',

  // Set the output filenames here
  output: {
    m3u: 'mtp.m3u',
    xml: 'mtp.xml'
  },

  // Starts here and increments each channel by 1
  minChannelNum: 1000,

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
      replace: {
        'USA: ': '', // Replace 'USA: ' with '' (removing USA: from channel name)

        /* You can also use a regular expression by prefixing it with r/ like in the below example */
        'r/USA:\\s': '' // This does exactly the same as above but using a regular expression
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
    'DC COUNCIL CHANNEL',
    'classic tv',
    'DANCE MUSIC TV',
    'DANCESTAR TV',
    'DOG TV',
    'DPAN TV',
    'ESPN COLLEGE EXTRA',
    'ESPN Bases Loaded',
    'FASHION',
    'PAC 12',
    'STADIUM',
    'TVW',
    'TVW-2'
  ]

};
