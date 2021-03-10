'use strict'

/** Class representing a Race. */
module.exports = class Race {
  /**
   * Create a Horserace.
   */
  constructor() {
    this._runs = 1000
    this._fns = []
    this._params = []
  }

  /**
   * Set number of runs.
   *
   * @param {number} runs - Amount of runs, functions must be executed for benchmark.
   */
  setRuns(runs) {
    this._runs = runs
    return this
  }

  /**
   * Add function for benchmarking.
   *
   * @param {number} fn - Function to benchmark.
   */
  addFn(fn) {
    this._fns.push(fn)
    return this
  }

  /**
   * Set parameters for functions for benchmarking.
   *
   * @param {Array} arguments - Arguments to be parsed into params.
   */
  setParams() {
    this._params = Array.from(arguments)
    return this
  }

  /** Run the benchmark race. */
  run() {
    const benchmark = {}
    const fnNamesLength = []
    const fnNamesSet = new Set(this._fns.map(f => f.name));
    const duplicateCount = {};
    const fnNames = this._fns.map(f => {
      const n = f.name;
      if (fnNamesSet.has(n)) {
        // name is duplicate
        let version = duplicateCount[n] || 1;
        for (; version < 10000; version++) {
          const newName = n + '_' + version;
          if (!fnNamesSet.has(newName)) {
            duplicateCount[n] = version + 1;
            return newName;
          }
        }
      }
      return n;
    });
    for (let fnIdx = 0; fnIdx < this._fns.length; fnIdx++) {
      const fn = this._fns[fnIdx];
      const name = fnNames[fnIdx];
      fnNamesLength.push(name.length)
      const start = new Date()
      for (let i = 0; i < this._runs; i++) {
        fn(...this._params)
      }
      const end = new Date()
      benchmark[name] = end - start
    }

    // prepare report table, with fixed width of columns to fit the longest function name
    const padding = Math.max(...fnNamesLength) + 7
    const fnTitle = 'Function'.padEnd(padding + 2)
    const timeTitle = 'Run time [↓]'
    const totalTitleLength = fnTitle.length + timeTitle.length
    let report = [
      `--= Race results =--\n\n`,
      `# of runs: ${this._runs}\n`,
      `Parameters: ${JSON.stringify(this._params)}\n\n`,
      `${fnTitle}${timeTitle}\n`,
      `${'='.repeat(totalTitleLength)}\n`,
    ].join('')

    // add benchmark results to the report, sorted in desc order and prepended with trophy for the first place
    Object.entries(benchmark)
      .sort((a, b) => a[1] - b[1])
      .forEach(([name, time], index) => {
        const trophy = index === 0 ? '🏆 ' : '  '
        report += [
          `${trophy}${`${name}()`.padEnd(padding)}${time} ms\n`,
          `${'-'.repeat(totalTitleLength)}\n`,
        ].join('')
      })

    console.log(report)
  }
}
