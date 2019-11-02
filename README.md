# Horserace 🏇
Benchmarking library.

## Features
* Lightweight
* Zero dependencies
* Easy to use with your favourite test framework

## Install
```
npm i horserace
or
yarn add horserace
```

## Use
Among other use cases, you can run a benchmark as part of your test suite:
```
const Horserace = require('horserace')

const fn1 = require('./fn1')
const fn2 = require('./fn2')

const param1 = [1, 2, 3]
const param2 = 'your string'

test(`benchmark`, () => {
  new Horserace()
    .setRuns(100000) // optional, defaults to 1000
    .addFn(fn1) // add functions to run...
    .addFn(fn2) // ...as many as you have, one at a time
    .setParams(param1, param2) // add parameters that functions take
    .race() // and finally let them run
})
```
it will output something like this:
```
--= Horserace results =--

# of runs: 100000
Parameters: [[1,2,3],"your string"]

Function                Run time [↓]
====================================
🏆 fn1()                10 ms
------------------------------------
   fn2()                20 ms
------------------------------------
```

## Author
Roman Krayovskyy (rkrayovskyy@gmail.com)

## License
MIT
