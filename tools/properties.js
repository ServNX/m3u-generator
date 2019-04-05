const group = (line) => {
  const regex = new RegExp('group-title="([a-zA-Z0-9\\s&:!\\/]{1,})"');
  const found = regex.exec(line);

  if(found)
    return found[1];

  return '';
};

const hasKeyword = (keyword, source) => {
  const kwCheck = new RegExp(`\\b${keyword.toLowerCase()}\\b`);
  return kwCheck.test(source);
};

const name = (line) => {
  const regex = new RegExp('tvg-name="([a-zA-Z0-9\\s&\\(\\)-:!\\/]{1,})"');
  const found = regex.exec(line);

  if(found)
    return found[1];

  return '';
};

const chanNum = (line) => {
  const regex = new RegExp('tvg-chno="([0-9]{1,})"');
  const found = regex.exec(line);

  if (found)
    return found[1];

  return false;
};

const addChanNum = (line, num) => {
  if (chanNum(line))
    return line.replace(`tvg-chno="${chanNum(line)}"`, `tvg-chno="${num}"`);

  return line.replace(` tvg-name="`, ` tvg-chno="${num}" tvg-name="`);
};

const includes = (find, source) => {
  const r = new RegExp(find);
  return r.test(source);
};

const isWest = (name) => {
  const isWest = new RegExp('^(WEST)\\s|\\s(WEST)$', 'g');
  return isWest.test(name);
};

const isEast = (name) => {
  const isEast = new RegExp('^(EAST)\\s|\\s(EAST)$', 'g');
  return isEast.test(name);
}

module.exports = {
  group,
  name,
  hasKeyword,
  chanNum,
  addChanNum,
  includes,
  isEast,
  isWest,
};
