import { Block } from '../block'
import { memoHandler } from '../handlers'
import composeHandlers, { composeChainHandlers } from '../composeHandlers'
import { value } from '../reducers'

describe('composeHandlers works properly', () => {
  test('composeChainHandlers pass new values properly', () => {

    const fn1 = jest.fn((value, update) => {
      if (value.a === 1) {
        update({ a: 2 })
      }
    })
    const fn2 = jest.fn((value, update) => {
      if (value.a === 2) {
        update({ a: 3 })
      }
    })
    const fn3 = jest.fn(() => { })


    const block = Block({ a: value(1) }, composeChainHandlers(fn1, fn2, fn3))
    const instance = block()

    const result = instance()
    expect(fn1.mock.calls.length).toBe(3)
    expect(fn1.mock.calls[0][0]).toEqual({ a: 1 })
    expect(fn1.mock.calls[1][0]).toEqual({ a: 2 })
    expect(fn1.mock.calls[2][0]).toEqual({ a: 3 })

    expect(fn2.mock.calls.length).toBe(2)
    expect(fn2.mock.calls[0][0]).toEqual({ a: 2 })
    expect(fn2.mock.calls[1][0]).toEqual({ a: 3 })

    expect(fn3.mock.calls.length).toBe(1)
    expect(fn3.mock.calls[0][0]).toEqual({ a: 3 })

    expect(result).toEqual({ a: 3 })
  })

  test('composeHandlers pass new values properly', () => {
    const fn1 = jest.fn((a, update) => {
      if (a === 1) {
        update({ a: 2 })
      }
    })

    const fn2 = jest.fn((value, update) => {
      if (value.a === 1) {
        update({ c: 3 })
      }
    })
    const fn3 = jest.fn(() => { })


    const block = Block({ a: value(1), c: value(2) }, composeHandlers(memoHandler(fn1, ['a']), fn2, fn3))
    const instance = block()

    const result = instance()

    expect(fn1.mock.calls.length).toBe(2) // because memo
    expect(fn2.mock.calls.length).toBe(3)
    expect(fn3.mock.calls.length).toBe(3)

    expect(result).toEqual({ a: 2, c: 3 })
  })
})