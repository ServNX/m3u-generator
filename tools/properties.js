module.exports.tvgId = tvgId = (line) => {
  const regex = new RegExp('tvg-id="([^"]+)"');
  const found = regex.exec(line);

  if(found)
    return found[1];

  return '';
};

module.exports.CUID = CUID = (line) => {
  const regex = new RegExp('channelID="([^"]+)"');
  const found = regex.exec(line);

  if (found)
    return found[1];

  return '';
};

module.exports.tvgName = tvgName = (line) => {
  const regex = new RegExp('tvg-name="([^"]+)"');
  const found = regex.exec(line);

  if (found)
    return found[1];

  return '';
};

module.exports.groupTitle = groupTitle = (line) => {
  const regex = new RegExp('group-title="([^"]+)"');
  const found = regex.exec(line);

  if (found)
    return found[1];

  return '';
};

module.exports.tvgLogo = tvgLogo = (line) => {
  const regex = new RegExp('tvg-logo="([^"]+)"');
  const found = regex.exec(line);

  if(found)
    return found[1];

  return '';
};

module.exports.tvgChno = tvgChno = (line) => {
  const regex = new RegExp('tvg-chno="([^"]+)"');
  const found = regex.exec(line);

  if (found)
    return found[1];

  return false;
};

module.exports.setChno = setChno = (line, num) => {
  if (tvgChno(line))
    return line.replace(`tvg-chno="${tvgChno(line)}"`, `tvg-chno="${num}"`);

  return line.replace(` tvg-name="`, ` tvg-chno="${num}" tvg-name="`);
};

module.exports.setCUID = setCUID = (line, num) => {
  if (CUID(line))
    return line.replace(`channelID="${CUID(line)}"`, `channelID="${num}"`);

  return line.replace(` tvg-id="`, ` channelID="${num}" tvg-id="`);
};

module.exports.hasKeyword = hasKeyword = (keyword, source) => {
  const kwCheck = new RegExp(`\\b${keyword.toLowerCase()}\\b`);
  return kwCheck.test(source);
};

module.exports.includes = includes = (find, source) => {
  const r = new RegExp(find);
  return r.test(source);
};

module.exports.isWest = isWest = (name) => {
  const isWest = new RegExp('^(WEST)\\s|\\s(WEST)$', 'g');
  return isWest.test(name);
};

module.exports.isEast = isEast = (name) => {
  const isEast = new RegExp('^(EAST)\\s|\\s(EAST)$', 'g');
  return isEast.test(name);
};
