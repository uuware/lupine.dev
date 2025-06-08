export class MessageHubData<T> {
  constructor(public actionId: string, public message: string, public extraData?: T) {}
}
export class MessageHub {
  private subscriptions: { [key: string]: { [key: string]: Function } } = {};
  private subscriptionValues: { [key: string]: any } = {};
  private lastId = 0;
  constructor(public passLastMsgWhenSubscribe = false) {}

  // * for listening to all events
  public subscribe(targetType: string, fn: Function, recessiveLassMsg = true) {
    const id = this.lastId++;
    if (!this.subscriptions[targetType]) {
      this.subscriptions[targetType] = {};
    }
    this.subscriptions[targetType][id] = fn;
    if (recessiveLassMsg && this.passLastMsgWhenSubscribe && this.subscriptionValues[targetType]) {
      this.notify(fn, this.subscriptionValues[targetType]);
    }

    return () => {
      delete this.subscriptions[targetType][id];
      var needDestroy = true;
      for (var key in this.subscriptions[targetType]) {
        needDestroy = false;
        break;
      }
      if (needDestroy) {
        delete this.subscriptions[targetType];
      }
    };
  }

  public send(targetType: string, arg: any) {
    if (targetType === '*') {
      for (var groupKey in this.subscriptions) {
        for (var key in this.subscriptions[groupKey]) {
          this.notify(this.subscriptions[groupKey][key], arg);
        }
      }
      return;
    }

    if (this.passLastMsgWhenSubscribe) {
      this.subscriptionValues[targetType] = arg;
    }

    if (this.subscriptions[targetType]) {
      for (var key in this.subscriptions[targetType]) {
        this.notify(this.subscriptions[targetType][key], arg);
      }
    }
    if (this.subscriptions['*']) {
      for (var key in this.subscriptions['*']) {
        this.notify(this.subscriptions['*'][key], arg);
      }
    }
  }

  public hasListener(targetType: string): boolean {
    if (targetType === '*') {
      // if has any subscriptions
      for (var groupKey in this.subscriptions) {
        return true;
      }
    } else {
      // if has any subscriptions of eventType
      for (var groupKey in this.subscriptions[targetType]) {
        return true;
      }
    }
    return false;
  }

  private notify(fn: Function, arg: any) {
    setTimeout(() => {
      fn(arg);
    }, 0);
  }
}

export const defaultMessageHub = new MessageHub();

// /*[TEST-START]*/
// function TEST_sample() {
//   var mHub = new MessageHub(true);
//   var unsubscribeA = mHub.subscribe('test', (msg: string) => {
//     console.log('MessageHub test', msg);
//   });
//   var unsubscribeB = mHub.subscribe('*', (msg: string) => {
//     console.log('MessageHub *', msg);
//   });
//   console.log(mHub.hasListener('test'));

//   mHub.send('test', new MessageHubData('aa', 'bb'));
//   mHub.send('*', new MessageHubData('aa*', 'bb*'));

//   unsubscribeA();
//   mHub.send('test', new MessageHubData('aa', 'bb'));
//   unsubscribeB();
//   mHub.send('*', new MessageHubData<string>('aa to * 2', 'bb', 'extra message'));
//   console.log(mHub.hasListener('test'));
// }
// // TEST_sample();
// /*[TEST-END]*/
