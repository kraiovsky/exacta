# Exacta 🏆
Benchmarking library.

## Features
* Lightweight
* Zero dependencies
* Easy to use with your favourite test framework

## Install
```
npm i exacta
or
yarn add exacta
```

## Use
Among other use cases, you can run a benchmark as part of your test suite:
```
const Race = require('exacta')

const fn1 = require('./fn1')
const fn2 = require('./fn2')

const param1 = [1, 2, 3]
const param2 = 'your string'

test(`benchmark`, () => {
  new Race()
    .setRuns(100000) // optional, defaults to 1000
    .addFn(fn1) // add functions to run...
    .addFn(fn2) // ...as many as you have, one at a time
    .setParams(param1, param2) // add parameters that functions take
    .run() // and finally let them run
})
```
it will output something like this:
```
--= Race results =--

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

## The name
_Exacta_ stands for a method of betting, as on a horserace, in which the bettor must correctly pick those finishing in the first and second places in precisely that sequence. (https://www.thefreedictionary.com/exacta)

## License
MIT
