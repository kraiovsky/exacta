const Horserace = require('./')

const fn1 = jest.fn()
const fn2 = jest.fn()
const param1 = [1, 2, 3]
const param2 = 'abc'
const runs = 100
const defaultRuns = 1000

describe('Horserace', () => {
  test(`should create a Horserace with provided params and run it`, () => {
    const horserace = new Horserace()
      .setRuns(100)
      .addFn(fn1)
      .addFn(fn2)
      .setParams(param1, param2)
    expect(horserace._runs).toEqual(runs)
    expect(horserace._fns).toEqual([fn1, fn2])
    expect(horserace._params).toEqual([param1, param2])

    horserace.race()
    expect(fn1.mock.calls).toHaveLength(runs)
    expect(fn2.mock.calls).toHaveLength(runs)
    expect(fn1).toHaveBeenCalledWith(param1, param2)
    expect(fn2).toHaveBeenCalledWith(param1, param2)
  })
  test(`should set default number of runs for a Horserace and attempt to run functions with no result`, () => {
    const horserace = new Horserace()
    expect(horserace._runs).toEqual(defaultRuns)
    expect(horserace._fns).toEqual([])
    expect(horserace._params).toEqual([])
  })
})
