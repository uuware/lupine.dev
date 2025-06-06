// inspired by rxjs

export class Subscription {
  private _unsubscribe;
  constructor(unsubscribe: () => void) {
    this._unsubscribe = unsubscribe;
  }
  unsubscribe(): void {
    if (this._unsubscribe) {
      this._unsubscribe();
    }
  }
}

export class Observable<T> {
  constructor() {}
  subscribe(next?: (value: T) => void, error?: (error: any) => void, complete?: () => void): Subscription {
    throw new Error('subscribe is not implemented');
  }
}

export class Subject<T> extends Observable<T> {
  private observers: {
    next?: (value: T) => void;
    error?: (error: any) => void;
    complete?: () => void;
  }[] = [];
  private isStopped = false;
  private _hasError = false;
  private passLastMsgWhenSubscribe;
  private lastSaved: { [key: string]: T } = {};

  constructor(passLastMsgWhenSubscribe = false) {
    super();
    this.passLastMsgWhenSubscribe = passLastMsgWhenSubscribe;
  }

  next(value?: T) {
    if (this.isStopped) {
      throw new Error('Subject is closed');
    }

    const len = this.observers.length;
    const copy = this.observers.slice();
    for (let i = 0; i < len; i++) {
      const item = copy[i].next;
      if (typeof item !== 'undefined' && typeof value !== 'undefined') {
        item(value);
      }
    }
    if (this.passLastMsgWhenSubscribe) {
      if (typeof value !== 'undefined') {
        this.lastSaved['value'] = value;
      }
    }
  }

  error(err: any) {
    if (this.isStopped) {
      throw new Error('Subject is closed');
    }

    this._hasError = true;
    this.isStopped = true;
    const len = this.observers.length;
    const copy = this.observers.slice();
    for (let i = 0; i < len; i++) {
      const item = copy[i].error;
      if (typeof item !== 'undefined' && typeof err !== 'undefined') {
        item(err);
      }
    }
    this.observers.length = 0;
  }

  complete() {
    if (this.isStopped) {
      throw new Error('Subject is closed');
    }

    this.isStopped = true;
    const copy = this.observers.slice();
    const len = copy.length;
    for (let i = 0; i < len; i++) {
      const item = copy[i].complete;
      if (typeof item !== 'undefined') {
        item();
      }
    }
    if (this.observers.length != len) {
      console.warn(`Subscribe count changed from ${len} to ${this.observers.length}`);
    }
    this.observers.length = 0;
  }

  hasError() {
    return this._hasError;
  }

  private unsubscribe(observer: {}) {
    const index = this.observers.findIndex((item) => item === observer);
    if (index > -1) {
      this.observers.splice(index, 1);
    }
  }

  subscribe(next?: (value: T) => void, error?: (error: any) => void, complete?: () => void): Subscription {
    if (this.isStopped) {
      throw new Error('Subject is stopped');
    }

    const observer = {
      next,
      error,
      complete,
    };
    this.observers.push(observer);
    if (this.passLastMsgWhenSubscribe) {
      if (typeof observer.next !== 'undefined' && typeof this.lastSaved['value'] !== 'undefined') {
        observer.next(this.lastSaved['value']);
      }
    }
    const ret = new Subscription(() => {
      this.unsubscribe(observer);
    });
    return ret;
  }

  asObservable(): Observable<T> {
    return this as Observable<T>;
  }
}

// /*[TEST-START]*/
// function TEST_sample() {
//   const flag = new Subject(true);
//   const observable1 = flag.asObservable();
//   const unsubscribeA = observable1.subscribe(
//     (next) => {
//       console.log('A', next);
//     },
//     (error) => {
//       console.log('A error:', error);
//     }
//   );
//   const unsubscribeB = observable1.subscribe(
//     (next) => {
//       console.log('B', next);
//     },
//     (error) => {
//       console.log('B error:', error);
//     }
//   );

//   flag.next('test 1');
//   unsubscribeA.unsubscribe();
//   flag.next('test 2');
//   flag.error('error 1');
// }
// TEST_sample();
/*[TEST-END]*/

// const flag: BehaviorSubject<Date>;
// getFlag(): Observable<Date> {
//     return this.flag.asObservable();
// }
// setFlag(flag) {
//     this.flag.next(flag);
// }

// getAll(): Observable<string[]> {
//     this.labelsSubject = new ReplaySubject(1);
//     this.http.get().subscribe(result => {
//         this.labelsSubject.next(result);
//     });

//     return new Observable<string[]>(observer => {
//         this.labelsSubject.subscribe(result => {
//             observer.next(result);
//             observer.complete();
//         }, error => {
//             observer.error(error);
//         });
//     });
// }

// getAll().subscribe(labels => labels.push(res));
// sub.unsubscribe()
