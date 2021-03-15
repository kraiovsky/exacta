'use strict'

/** Class representing a Race. */
module.exports = class Race {
  /**
   * Create a Horserace.
   */
  constructor() {
    this._runs = 1000
    this._warmup = 100
    this._samples = 10
    this._fns = []
    this._params = []
    this.console = console
  }

  /**
   * set custom console.
   * console must implement `console.log(string)`
   */
  setConsole(customConsole) {
    this.console = customConsole
    return this
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
   * Set number of samples.
   *
   * @param {number} samples - How often to repeat the benchmark runs.
   */
  setSamples(samples) {
    this._samples = samples
    return this
  }

  /**
   * Set number of warmup runs.
   *
   * @param {number} millisec - Run every function for `millisec` milliseconds before benchmark.
   */
  setWarmup(millisec) {
    this._warmup = millisec
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
  async run() {
    function get_time() {
      return new Date(); // TODO use high-resolution timer
    }
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
    const average = arr => arr.reduce((sum, val) => sum + val, 0) / arr.length;
    const standardDeviation = arr => {
      const avg = average(arr);
      return Math.sqrt(average(arr.map(val => {
        const dif = val - avg;
        return dif * dif;
      })));
    };
    const warmupDone = new Set();
    const results = {};
    const sampleWidth = `${this._samples}`.length;
    const fname = '123456789abcdefghijklmnopqrstuvwxyz'; // max 35 fns
    for (let sample = 0; sample < this._samples; sample++) {
      const linetimes = [];
      for (let fnIdx = 0; fnIdx < this._fns.length; fnIdx++) {
        const fn = this._fns[fnIdx];
        const name = fnNames[fnIdx];
        if (sample == 0) results[name] = [];
        fnNamesLength.push(name.length)
        if (!warmupDone.has(fn)) {
          const t2 = Date.now() + this._warmup;
          this.console.log(`warmup: run ${name} for ${this._warmup} ms`)
          while (Date.now() < t2) {
            await fn(...this._params)
          }
          warmupDone.add(fn);
        }

        const start = get_time()
        for (let i = 0; i < this._runs; i++) {
          await fn(...this._params)
        }
        const end = get_time()

        const diff = end - start
        //const diff = 100 // test: where is x = zero

        results[name].push(diff)
        linetimes.push(diff);
      }

      // show time proportions
      const timesum = linetimes.reduce((a, v) => (a + v), 0);
      const termwidth = 80;
      const t_to_width = 1 / timesum * (termwidth-2) * this._fns.length;
      const widths = linetimes.map(t => (termwidth - 2 - (t * t_to_width - 0.5 * (termwidth-2))));
      const space = '                                                                                                                        '; // 120 * ' '
      const linestr = widths.map((w,i) => {
        return space.slice(0, w) + fname[i];
      }).join('\n');
      // here we need await to run this in a browser and see the live output
      await this.console.log(linestr +
        '\nslow <-------------------------------- o --------------------------------> fast')
    }

    for (let fnIdx = 0; fnIdx < this._fns.length; fnIdx++) {
      const name = fnNames[fnIdx];
      benchmark[name] = {
        results: results[name],
        avg: average(results[name]),
        dev: standardDeviation(results[name]),
        min: Math.min(...results[name]),
        max: Math.max(...results[name]),
        fnIdx,
      };
    }

    // prepare report table, with fixed width of columns to fit the longest function name
    const padding = Math.max(...fnNamesLength) + 7
    const fnTitle = 'Function'.padEnd(padding + 2)
    const timeTitle = 'Minimum Time'
    const totalTitleLength = fnTitle.length + timeTitle.length
    let report = [
      `\n--= Race results =--\n\n`,
      `# of runs: ${this._runs}\n`,
      //`Parameters: ${JSON.stringify(this._params)}\n\n`,
      `${fnTitle}${timeTitle}\n`,
      `${'='.repeat(totalTitleLength)}\n`,
    ].join('')

    // add benchmark results to the report, sorted in desc order and prepended with trophy for the first place
    Object.entries(benchmark)
      .sort((a, b) => a[1].min - b[1].min)
      .forEach(([name, { avg, min, max, dev, results, fnIdx }], resIdx) => {
        report += [
          `${fname[fnIdx]}. ${`${name}`.padEnd(padding)}${min} ms (avg ${avg}) (max ${max}) (dev ${dev.toFixed(1)})\n`,
          `${'-'.repeat(totalTitleLength)}\n`,
        ].join('')
      })

    this.console.log(report)
  }
}
