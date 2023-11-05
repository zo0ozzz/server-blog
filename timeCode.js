const utils = require("./utils");

function getTimeCode() {
  const timeCode = utils.dateUtils.getType1();

  return timeCode;
}

module.exports = getTimeCode;
