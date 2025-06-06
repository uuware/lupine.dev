export class DateUtils {
  /*
   * returns the number of milliseconds elapsed since January 1, 1970 00:00:00 UTC.
   */
  static now(): number {
    return Date.now();
  }

  // Date time string format: YYYY-MM-DDTHH:mm:ss.sssZ
  // The string that you want to parse into a Date should match this format or a portion of this format.
  // The “T” character separates the date from the time portion of the string. The “Z” character is the UTC offset representation.
  static toDate(str: string): Date {
    return new Date(Date.parse(str));
  }

  static clone(dt: Date): Date {
    return new Date(dt.valueOf());
  }

  static isLeapYear(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  }

  static daysInMonth(year: number, month: number) {
    return month === 1 ? (DateUtils.isLeapYear(year) ? 29 : 28) : 31 - ((month % 7) % 2);
  }

  static createDate(
    year: number,
    monthIndex: number,
    date?: number,
    hours?: number,
    minutes?: number,
    seconds?: number,
    ms?: number
  ): Date {
    const dt = new Date(year, monthIndex, date, hours, minutes, seconds, ms);
    return dt;
  }

  // It returns the number of milliseconds since January 1, 1970, 00:00:00 UTC instead of local (regardless of which time zone you are in).
  static createUTCDate(
    year: number,
    monthIndex?: number,
    date?: number,
    hours?: number,
    minutes?: number,
    seconds?: number,
    ms?: number
  ): Date {
    const dt = new Date(Date.UTC.apply(null, [year, monthIndex, date, hours, minutes, seconds, ms]));
    return dt;
  }

  static set(
    dt: Date,
    year?: number,
    monthIndex?: number,
    date?: number,
    hours?: number,
    minutes?: number,
    seconds?: number,
    ms?: number
  ): Date {
    if (!dt) {
      dt = new Date(DateUtils.now());
    }
    if (typeof year === 'number') {
      dt.setFullYear(year);
    }
    if (typeof monthIndex === 'number') {
      dt.setMonth(monthIndex);
    }
    if (typeof date === 'number') {
      dt.setDate(date);
    }
    if (typeof hours === 'number') {
      dt.setHours(hours);
    }
    if (typeof minutes === 'number') {
      dt.setMinutes(minutes);
    }
    if (typeof seconds === 'number') {
      dt.setSeconds(seconds);
    }
    if (typeof ms === 'number') {
      dt.setMilliseconds(ms);
    }
    return dt;
  }

  static add(
    dt: Date,
    year?: number,
    monthCount?: number,
    date?: number,
    hours?: number,
    minutes?: number,
    seconds?: number,
    ms?: number
  ): Date {
    if (!dt) {
      dt = new Date(DateUtils.now());
    }
    if (typeof year === 'number') {
      dt.setFullYear(dt.getFullYear() + year);
    }
    if (typeof monthCount === 'number') {
      dt.setMonth(dt.getMonth() + monthCount);
    }
    if (typeof date === 'number') {
      dt.setDate(dt.getDate() + date);
    }
    if (typeof hours === 'number') {
      dt.setHours(dt.getHours() + hours);
    }
    if (typeof minutes === 'number') {
      dt.setMinutes(dt.getMinutes() + minutes);
    }
    if (typeof seconds === 'number') {
      dt.setSeconds(dt.getSeconds() + seconds);
    }
    if (typeof ms === 'number') {
      dt.setMilliseconds(dt.getMilliseconds() + ms);
    }
    return dt;
  }

  // returns a difference object from two dates
  static diff(endDate: Date, startDate: Date): DiffDate {
    const startYear = startDate.getFullYear();
    let yearDiff = endDate.getFullYear() - startYear;
    let monthDiff = endDate.getMonth() - startDate.getMonth();
    if (monthDiff < 0) {
      yearDiff--;
      monthDiff += 12;
    }
    let dayDiff = endDate.getDate() - startDate.getDate();
    if (dayDiff < 0) {
      if (monthDiff > 0) {
        monthDiff--;
      } else {
        yearDiff--;
        monthDiff = 11;
      }
      dayDiff += DateUtils.daysInMonth(startYear, startDate.getMonth());
    }
    const msTotal = endDate.valueOf() - startDate.valueOf(); // milliseconds
    const secondTotal = Math.floor(msTotal / 1000); // milliseconds -> seconds
    const hourDiff = Math.floor(secondTotal / (60 * 60)) % 24;
    const minuteDiff = Math.floor(secondTotal / 60) % 60;
    const secondDiff = secondTotal % 60;
    const msDiff = msTotal % 1000;
    return new DiffDate(yearDiff, monthDiff, dayDiff, hourDiff, minuteDiff, secondDiff, msDiff);
  }

  // returns a time difference string from two dates
  static diffString(endDate: Date, startDate: Date, printMS = false): string {
    const diff = DateUtils.diff(endDate, startDate);
    let ret = '';
    if (diff.years !== 0) {
      ret = ret + diff.years + ' years(s), ';
    }
    if (diff.years !== 0 || diff.months !== 0) {
      ret = ret + diff.months + ' month(s), ';
    }
    if (diff.years !== 0 || diff.months !== 0 || diff.days !== 0) {
      ret = ret + diff.days + ' day(s), ';
    }
    if (diff.years !== 0 || diff.months !== 0 || diff.days !== 0 || diff.hours !== 0) {
      ret = ret + diff.hours + ' hour(s), ';
    }
    if (diff.years !== 0 || diff.months !== 0 || diff.days !== 0 || diff.hours !== 0 || diff.minutes !== 0) {
      ret = ret + diff.minutes + ' minute(s), ';
    }
    if (
      diff.years !== 0 ||
      diff.months !== 0 ||
      diff.days !== 0 ||
      diff.hours !== 0 ||
      diff.minutes !== 0 ||
      diff.seconds !== 0 ||
      !printMS
    ) {
      ret = ret + diff.seconds + ' second(s)';
      if (printMS) {
        ret += ', ';
      }
    }
    if (printMS) {
      ret = ret + diff.milliseconds + ' ms';
    }
    return ret;
  }

  // returns a YYYYMMDD format string
  static toYMD(dt: Date, separator: string) {
    separator = typeof separator === 'undefined' ? '-' : separator;
    return (
      dt.getFullYear() +
      separator +
      ('0' + (dt.getMonth() + 1)).toString().slice(-2) +
      separator +
      ('0' + dt.getDate()).toString().slice(-2)
    );
  }
  static toYmdHms(dt: Date, separator: string) {
    separator = typeof separator === 'undefined' ? '-' : separator;
    return (
      dt.getFullYear() +
      separator +
      ('0' + (dt.getMonth() + 1)).toString().slice(-2) +
      separator +
      ('0' + dt.getDate()).toString().slice(-2) +
      ' ' +
      ('0' + dt.getHours()).toString().slice(-2) +
      ':' +
      ('0' + dt.getMinutes()).toString().slice(-2) +
      ':' +
      ('0' + dt.getSeconds()).toString().slice(-2)
    );
  }

  static toJSONString(dt: Date) {
    // return dt.getUTCFullYear() + '-' + ('0' + (dt.getUTCMonth() + 1)).toString().slice(-2) +
    //     '-' + ('0' + dt.getUTCDate()).toString().slice(-2) + ' ' + ('0' + dt.getUTCHours()).toString().slice(-2) +
    //     ':' + ('0' + dt.getUTCMinutes()).toString().slice(-2) + ':' + ('0' + dt.getUTCSeconds()).toString().slice(-2) + 'Z';
    return dt.toJSON();
  }

  static showJSONString(dt: string, separator = '-') {
    return DateUtils.toYmdHms(DateUtils.toDate(dt), separator);
  }

  static fromJSONString(dt: string) {
    return DateUtils.toDate(dt);
  }

  static clearTime(dt: Date) {
    dt.setHours(0);
    dt.setMinutes(0);
    dt.setSeconds(0);
    dt.setMilliseconds(0);
    return dt;
  }

  static clearUTCTime(dt: Date) {
    dt.setUTCHours(0);
    dt.setUTCMinutes(0);
    dt.setUTCSeconds(0);
    dt.setUTCMilliseconds(0);
    return dt;
  }

  static format(dt: Date, fmt: string) {
    if (!fmt) {
      fmt = 'YYYY-MM-DD';
    }
    if (!dt) {
      dt = new Date();
    }

    const parts: { [key: string]: string } = {
      YYYY: dt.getFullYear().toString(),
      YY: ('00' + (dt.getFullYear() - 100)).toString().slice(-2),
      MM: ('0' + (dt.getMonth() + 1)).toString().slice(-2),
      M: (dt.getMonth() + 1).toString(),
      DD: ('0' + dt.getDate()).toString().slice(-2),
      D: dt.getDate().toString(),
      hh: ('0' + dt.getHours()).toString().slice(-2),
      h: dt.getHours().toString(),
      mm: ('0' + dt.getMinutes()).toString().slice(-2),
      ss: ('0' + dt.getSeconds()).toString().slice(-2),
      SSS: ('00' + dt.getMilliseconds()).toString().slice(-3),
      S: Math.floor(dt.getMilliseconds() / 100)
        .toString()
        .slice(-1),
    };

    const array = fmt.match(/(\[[^\[]*\])|(\\)?(YYYY|YY|MM?|DD?|hh?|mm?|ss?|SSS|S|.)/g) as string[];
    for (let i = 0, length = array.length; i < length; i++) {
      if (parts[array[i]]) {
        array[i] = parts[array[i]];
      }
    }
    const ret = array.join('');
    return ret;
  }
}

export class DiffDate {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;

  constructor(
    years: number,
    months: number,
    days: number,
    hours: number,
    minutes: number,
    seconds: number,
    milliseconds: number
  ) {
    this.years = years;
    this.months = months;
    this.days = days;
    this.hours = hours;
    this.minutes = minutes;
    this.seconds = seconds;
    this.milliseconds = milliseconds;
  }
}
