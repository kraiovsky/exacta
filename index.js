'use strict'

module.exports = class Horserace {
  constructor() {
    this._runs = 1000
    this._fns = []
    this._params = []
  }

  setRuns(runs) {
    this._runs = runs
    return this
  }

  addFn(fns) {
    this._fns.push(fns)
    return this
  }

  addParams() {
    this._params = Array.from(arguments)
    return this
  }

  race() {
    const benchmark = {}
    const fnNamesLength = []
    let report = `--= Horserace results =--\n\n`
    report += `# of runs: ${this._runs}\n`
    report += `Parameters: ${JSON.stringify(this._params)}\n\n`

    for (const fn of this._fns) {
      fnNamesLength.push(fn.name.length)
      const start = new Date()
      for (let i = 0; i < this._runs; i++) {
        fn(...this._params)
      }
      const end = new Date()
      benchmark[fn.name] = end - start
    }

    const padding = Math.max(...fnNamesLength) + 7
    const fnTitle = 'Function'.padEnd(padding + 2)
    const timeTitle = 'Run time [↓]'
    const totalTitleLength = fnTitle.length + timeTitle.length
    report += `${fnTitle}${timeTitle}\n`
    report += `${'='.repeat(totalTitleLength)}\n`
    Object.entries(benchmark)
      .sort((a, b) => a[1] - b[1])
      .forEach(([name, time], index) => {
        const trophy = index === 0 ? '🏆 ' : '  '
        report += `${trophy}${`${name}()`.padEnd(padding)}${time} ms\n`
        report += `${'-'.repeat(totalTitleLength)}\n`
      })
    console.log(report)
  }
}
