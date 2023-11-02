const dateUtils = {
  // JavaScript에서 함수는 실행 시점에 평가되는 반면, 객체의 프로퍼티나 변수는 선언 시점에 평가.
  // 따라서 객체의 선언 시점이 아닌 뭔가가 실행되는 시점의 시간을 반환받기 원한다면 함수(메서드)를 이용해 반환받아야 함.
  now: function () {
    return new Date();
  },

  // 화살표 함수를 사용하면 this를 자신의 바깥 코드에서 가져옴
  // 그래서 객체의 메서드를 할당할 땐 일반 함수를 사용하는 게 바람직
  getYear: function () {
    const now = this.now();

    return now.getFullYear().toString();
  },
  getMonth: function () {
    const now = this.now();

    return ("0" + (now.getMonth() + 1).toString()).slice(-2);
  },
  getDate: function () {
    const now = this.now();

    return ("0" + now.getDate()).slice(-2);
  },
  getDay: function () {
    const now = this.now();

    return ["일", "월", "화", "수", "목", "금", "토"][now.getDay()];
  },
  getHour: function () {
    const now = this.now();

    return ("0" + now.getHours().toString()).slice(-2);
  },
  getMinute: function () {
    const now = this.now();

    return ("0" + now.getMinutes().toString()).slice(-2);
  },
  getSecond: function () {
    const now = this.now();

    return ("0" + now.getSeconds().toString()).slice(-2);
  },
  getTimeCode: function () {
    // YYYYMMDDHHMMSS(14자리)
    const now = this.now();
    const year = now.getFullYear().toString();
    const month = ("0" + (now.getMonth() + 1).toString()).slice(-2);
    const date = ("0" + now.getDate()).slice(-2);
    const hour = ("0" + now.getHours().toString()).slice(-2);
    const minute = ("0" + now.getMinutes().toString()).slice(-2);
    const second = ("0" + now.getSeconds().toString()).slice(-2);

    return `${year}${month}${date}${hour}${minute}${second}`;
  },
  getDate: function () {
    // YYYYMMDD(8자리)
    const now = this.now();
    const year = now.getFullYear().toString();
    const month = ("0" + (now.getMonth() + 1).toString()).slice(-2);
    const date = ("0" + now.getDate()).slice(-2);

    return `${year}${month}${date}`;
  },
  getTime: function () {
    // HHMMSS(6자리)
    const now = this.now();
    const hour = ("0" + now.getHours().toString()).slice(-2);
    const minute = ("0" + now.getMinutes().toString()).slice(-2);
    const second = ("0" + now.getSeconds().toString()).slice(-2);

    return `${hour}${minute}${second}`;
  },
  getAll: function () {
    const now = this.now();
    const year = now.getFullYear().toString();
    const month = ("0" + (now.getMonth() + 1).toString()).slice(-2);
    const date = ("0" + now.getDate()).slice(-2);
    const day = ["일", "월", "화", "수", "목", "금", "토"][now.getDay()];
    const hour = ("0" + now.getHours().toString()).slice(-2);
    const minute = ("0" + now.getMinutes().toString()).slice(-2);
    const second = ("0" + now.getSeconds().toString()).slice(-2);

    return `${year}${month}${date}${day}${hour}${minute}${second}`;
  },
};

module.exports = { dateUtils };
