const utils = require("./utils");

function getTimeCode() {
  const timeCode = utils.dateUtils.getAll();

  return timeCode;
}

module.exports = getTimeCode;
