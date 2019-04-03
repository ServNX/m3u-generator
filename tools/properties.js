module.exports.group = (line) => {
  const regex = new RegExp('group-title="([a-zA-Z0-9\\s&:!\\/]{1,})"');
  const found = regex.exec(line);

  if(found)
    return found[1];

  return '';
};

module.exports.name = (line) => {
  const regex = new RegExp('tvg-name="([a-zA-Z0-9\\s&:!\\/]{1,})"');
  const found = regex.exec(line);

  if(found)
    return found[1];

  return '';
};

module.exports.setName = (name) => {
  return `tvg-name="${name}"`;
};

module.exports.addChanNum = (line, chanNum) => {
  return line.replace(` tvg-name="`, ` tvg-chno="${chanNum}" tvg-name="`).trim();
};
