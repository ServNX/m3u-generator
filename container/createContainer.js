const Container = require('./Container');

module.exports = () => {
  const container = new Container();

  require('../providers/AppProvider')(container);

  return container;
};
