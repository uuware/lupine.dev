export class IsType {
  static getType(obj: any) {
    var type = typeof obj;
    if (type === 'undefined') return 'undefined';
    else if (type === 'string' || obj instanceof String) return 'string';
    else if (type === 'number' || obj instanceof Number) return 'number';
    else if (type === 'function' || obj instanceof Function) return 'function';
    else if (!!obj && obj.constructor === Array) return 'array';
    else if (obj && obj.nodeType === 1) return 'element';
    else if (type === 'object') return 'object';
    else return 'unknown';
  }

  static isArray(input: any) {
    return input instanceof Array || Object.prototype.toString.call(input) === '[object Array]';
  }

  static isObject(input: any) {
    // null is not object
    return input != null && Object.prototype.toString.call(input) === '[object Object]';
  }

  static isObjectEmpty(obj: any) {
    if (Object.getOwnPropertyNames) {
      return Object.getOwnPropertyNames(obj).length === 0;
    } else {
      var k;
      for (k in obj) {
        if (obj.hasOwnProperty(k)) {
          return false;
        }
      }
      return true;
    }
  }

  static isUndefined(input: any) {
    return input === void 0;
  }

  static isNumber(input: any) {
    return typeof input === 'number' || Object.prototype.toString.call(input) === '[object Number]';
  }

  static isDate(input: any) {
    return input instanceof Date || Object.prototype.toString.call(input) === '[object Date]';
  }
}
