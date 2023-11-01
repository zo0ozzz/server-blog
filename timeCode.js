function getTimeCode() {
  const now = new Date();

  // const dayArr = ["일", "월", "화", "수", "목", "금", "토"];

  const year = now.getFullYear().toString().slice(-2);
  const month = ("0" + (now.getMonth() + 1).toString()).slice(-2);
  const date = ("0" + now.getDate()).slice(-2);
  // const day = dayArr[now.getDay()];
  const hours = ("0" + now.getHours().toString()).slice(-2);
  const minutes = ("0" + now.getMinutes().toString()).slice(-2);
  const seconds = ("0" + now.getSeconds().toString()).slice(-2);

  // const timeCode = `${year}. ${month}. ${date}. (${day}) / ${hours}:${minutes}:${seconds}`;

  const timeCode = `${year}${month}${date}${hours}${minutes}${seconds}`;

  return timeCode;
}

module.exports = getTimeCode;
