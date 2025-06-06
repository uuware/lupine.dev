/*
(async () => {
    var vars = {
        TEST: undefined,
        TEST1: '', // false
        TEST2: '2',
        PROD: false,
    }
      const x = await processOneFile(vars, 'test.js');
  console.log(x);
  process.exit(0);
})();
*/
console.log('test start');
console.log('test start');
// #if TEST
console.log('test');
// #elseif PROD
console.log('prod');
// #else
console.log('not test');
// #endif
console.log('test end');
console.log('test end');
// #if TEST1 && TEST2
console.log('test1 and test2');
// #endif

// #if TEST1 || TEST2
console.log('test1 or test2');
// #endif

// #if TEST2
console.log('test2');
// #endif
console.log('test end');
console.log('test end');
