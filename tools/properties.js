const group = (line) => {
  const regex = new RegExp('group-title="([a-zA-Z0-9\\s&:!\\/]{1,})"');
  const found = regex.exec(line);

  if(found)
    return found[1];

  return '';
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

module.exports = {
  group,
  name,
  chanNum,
  addChanNum,
  includes,
};
