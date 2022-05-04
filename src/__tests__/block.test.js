import getPath from 'lodash/get'

import { memoHandler } from '../'
import { Block } from '../block'
import { createFieldReducer } from '../createFieldReducer'
import { createHandler } from '../handler'
import { value } from '../reducers'
import composeHandlers from '../composeHandlers'


describe('Block rendering', () => {
  test('do values setups immediately while processing new value from scheme', () => {
    const fn = jest.fn(() => { return 1 })
    const block = Block({
      a: {
        b: value([]),
        c: value(fn)
      }
    })
    const instance = block()
    const result = instance()

    expect(fn.mock.calls[0][0]).toEqual({
      a: expect.objectContaining({ b: [] })
    })
    expect(result).toEqual({ a: { b: [], c: 1 } })
  })

  test('Block renders properly', () => {
    const block = Block({
      a: 1,
      b: () => 'static_result',
      c: {
        d: true
      },
      e: value('initial')
    })

    const initialValue = block()()
    expect(initialValue).toEqual({
      a: 1,
      b: 'static_result',
      c: {
        d: true
      },
      e: 'initial'
    })
  })

  test('Block initial value renders properly', () => {
    const result = Block({ a: value(1) })({ a: 2 })()
    expect(result).toEqual({ a: 2 })
  })

  test('Block renders array of blocks properly', () => {
    const entry = Block({ b: value(1) })
    const block = Block({
      a: [
        entry,
        entry,
        entry
      ]
    })

    const instance = block()
    const result = instance()

    expect(result).toEqual({
      a: [
        { b: 1 },
        { b: 1 },
        { b: 1 },
      ]
    })
  })

  test('Block render array of blocks with initial value properly', () => {
    const entry = Block({ b: value(1) })
    const block = Block({
      a: [
        entry
      ]
    })

    const instance = block({ a: [{ b: 33 }] })
    const result = instance()

    expect(result).toEqual({
      a: [{ b: 33 }]
    })
  })
})

describe('reducing new value with arrays', () => {
  test('should override reference values', () => {
    const block = Block({
      a: value(),
    })
    const instance = block()

    instance({ a: [1, 2, 3, 4] })
    const result = instance({ a: [77] })


    expect(result).toEqual({ a: [77] })
  })

  test('should override reference values in nested objects', () => {
    const block = Block({
      a: {
        b: value()
      },
    })
    const instance = block()

    instance({ a: { b: [1, 2, 3, 4] } })
    const result = instance({ a: { b: [77] } })

    expect(result).toEqual({ a: { b: [77] } })
  })

  test('should override reference values in nested blocks', () => {
    const block = Block({
      a: Block({
        b: value()
      })
    })
    const instance = block()

    instance({ a: { b: [1, 2, 3] } })
    const result = instance({ a: { b: [44] } })

    expect(result).toEqual({ a: { b: [44] } })
  })
})

describe('Block updating', () => {
  test('Block update works properly', () => {
    const reducerFn = jest.fn((value, oldValue, path) => getPath(value, path))
    const block = Block({ a: createFieldReducer(reducerFn) })

    const instance = block()
    let result = instance()
    expect(result).toEqual({ a: undefined })

    result = instance({ a: 16 })
    expect(result).toEqual({ a: 16 })
    expect(reducerFn.mock.calls[1][0]).toEqual({ a: 16 }) // newValue
    expect(reducerFn.mock.calls[1][1]).toEqual({ a: undefined }) // oldValue
    expect(reducerFn.mock.calls[1][2]).toBe('a') // path
  })

  test('Block update nested logic-blocks properly', () => {
    const block = Block({ a: Block({ b: value(1) }) })
    const instance = block()
    const initial = instance()
    const result = instance({ a: { b: 2 } })

    expect(initial).toEqual({ a: { b: 1 } })
    expect(result).toEqual({ a: { b: 2 } })
  })

  test('Block update nested blocks properly', () => {
    const block = Block({ a: Block({ b: value(1) }) })
    const instance = block()
    const initial = instance()
    const result = instance({ a: { b: 2 } })

    expect(initial).toEqual({ a: { b: 1 } })
    expect(result).toEqual({ a: { b: 2 } })
  })

  test('Block update array of blocks with undefined values will not change the value', () => {
    const entry = Block({ b: value(1) })
    const entry2 = Block({ c: Block({ d: value(2) }) })
    const block = Block({
      a: [
        entry,
        entry2,
        entry
      ]
    })

    const instance = block()
    const initial = instance()
    const result1 = instance({ a: [undefined, undefined, undefined] })

    expect(initial).toEqual({
      a: [
        { b: 1 },
        { c: { d: 2 } },
        { b: 1 },
      ]
    })
    expect(result1).toEqual({
      a: [
        { b: 1 },
        { c: { d: 2 } },
        { b: 1 },
      ]
    })
  })

  test('Block update array of blocks update value properly', () => {
    const entry = Block({ b: value(1) })
    const entry2 = Block({ c: Block({ d: value(2) }) })
    const block = Block({
      a: [
        entry,
        entry2,
        entry
      ]
    })

    const instance = block()
    const initial = instance()
    const result1 = instance({ a: [undefined, undefined, { b: 15 }] })
    const result2 = instance({ a: [undefined, { c: { d: 33 } }, { b: 16 }] })

    expect(initial).toEqual({
      a: [
        { b: 1 },
        { c: { d: 2 } },
        { b: 1 },
      ]
    })
    expect(result1).toEqual({
      a: [
        { b: 1 },
        { c: { d: 2 } },
        { b: 15 },
      ]
    })
    expect(result2).toEqual({
      a: [
        { b: 1 },
        { c: { d: 33 } },
        { b: 16 },
      ]
    })
  })
})


describe('Block updating via function', () => {
  test('Block update function takes current value', () => {
    const block = Block({
      a: value(1)
    })

    const instance = block()
    const updaterFunc = jest.fn(() => { return {} })
    instance(updaterFunc)
    instance(updaterFunc)
    instance({ a: 33 })
    instance(updaterFunc)

    expect(updaterFunc.mock.calls.length).toBe(3)
    expect(updaterFunc.mock.calls[0][0]).toBeUndefined()
    expect(updaterFunc.mock.calls[1][0]).toEqual(
      expect.objectContaining({
        a: 1
      })
    )
    expect(updaterFunc.mock.calls[2][0]).toEqual(
      expect.objectContaining({
        a: 33
      })
    )
  })

  test('Block update function can provide new values', () => {
    const block = Block({
      a: value(1)
    })

    const instance = block()
    const increment = ({ a }) => ({ a: a + 1 })
    instance()
    const { a: a1 } = instance(increment)
    const { a: a2 } = instance(increment)

    expect(a1).toBe(2)
    expect(a2).toBe(3)
  })
})


describe('Block instance options', () => {
  test('Block handleUpdate works well', () => {
    const block = Block({
      a: value(1),
      b: value(2)
    })

    const fn = jest.fn(() => { })
    const instance = block(undefined, {
      handleUpdate: fn
    })

    instance()
    expect(fn.mock.calls.length).toBe(0)

    instance({ a: 2 })
    expect(fn.mock.calls.length).toBe(1)
    expect(fn.mock.calls[0][0]).toEqual({ a: 2, b: 2 })

    instance({ a: 2 })
    expect(fn.mock.calls.length).toBe(2)
    expect(fn.mock.calls[0][0]).toEqual({ a: 2, b: 2 })
  })
})

describe('Block handler', () => {
  test('Block handler works properly', () => {
    const fn = jest.fn(() => { })
    const block = Block({
      a: value(1),
      b: value(2)
    }, createHandler(fn))

    const instance = block()
    expect(fn.mock.calls.length).toBe(0)

    instance()
    expect(fn.mock.calls.length).toBe(1)

    instance()
    expect(fn.mock.calls.length).toBe(2)


    instance({ a: 3 })
    expect(fn.mock.calls.length).toBe(3)
    expect(fn.mock.calls[2][0]).toEqual({ a: 3, b: 2 }) // newValue
    expect(fn.mock.calls[2][2]).toEqual({ a: 1, b: 2 }) // oldValue
  })

  test('Block handler sync update works properly', () => {
    const block = Block({
      a: value(1),
      b: value(2)
    }, createHandler(({ a }, update) => {
      if (a === 3) {
        update({ a: 4, b: 100 })
      }
    }))

    const fn = jest.fn(() => { })
    const instance = block(undefined, { handleUpdate: fn })
    instance()

    const result = instance({ a: 3 }) // will update immediately and return new value
    expect(result).toEqual({ a: 4, b: 100 })
    expect(fn.mock.calls[0][0]).toEqual({ a: 4, b: 100 })

    const result2 = instance({ a: 5 })
    expect(result2).toEqual({ a: 5, b: 100 })
  })


  test('Block handler async update works properly', async () => {
    await new Promise((resolve) => {
      let updated = false
      const block = Block({
        a: value(1),
        b: value(2)
      }, createHandler(({ a }, update) => {
        if (a === 3) {
          setTimeout(() => { updated = true; update({ a: 4, b: 100 }) }, 1000)
        }
      }))

      const fn = jest.fn(({ a }) => { if (a === 4 && updated) { resolve() } })
      const instance = block(undefined, { handleUpdate: fn })
      instance()

      const result = instance({ a: 3 }) // here we run async update in handler
      expect(result).toEqual({ a: 3, b: 2 })
      expect(fn.mock.calls[0][0]).toEqual({ a: 3, b: 2 })

      const result2 = instance({ a: 5 })
      expect(result2).toEqual({ a: 5, b: 2 })
    })
  })

  test('does async update pass valid values to handlers', () => {
    return new Promise(resolve => {
      const fn = jest.fn(async (value, update) => {
        if (value.a === 1 && !value.l) {
          const state1 = update({ l: true })
          expect(state1).toEqual({ a: 1, l: true })

          const a = await new Promise(r => {
            setTimeout(() => {
              r(2)
            }, 100)
          })

          const state2 = update({ a })
          expect(state2).toEqual({ a: 2, l: true })

          const a2 = await new Promise(r => {
            setTimeout(() => {
              r(3)
            }, 100)
          })

          const state3 = update({ a: a2 })
          expect(state3).toEqual({ a: 3, l: true })
        }

        if (value.a === 3) {
          expect(fn.mock.calls.length).toBe(4)
          expect(fn.mock.calls[0][0]).toEqual({ a: 1, l: false }) // value
          expect(fn.mock.calls[0][2]).toBe(undefined) // oldValue


          expect(fn.mock.calls[1][0]).toEqual({ a: 1, l: true })
          expect(fn.mock.calls[1][2]).toEqual({ a: 1, l: false })


          expect(fn.mock.calls[2][0]).toEqual({ a: 2, l: true })
          expect(fn.mock.calls[2][2]).toEqual({ a: 1, l: true })


          expect(fn.mock.calls[3][0]).toEqual({ a: 3, l: true })
          expect(fn.mock.calls[3][2]).toEqual({ a: 2, l: true })

          resolve()
        }
      })
      const block = Block({
        a: value(1),
        l: value(false)
      }, composeHandlers(fn)
      )

      const instance = block()
      instance()
    })
  })


  test('Nested block handler works properly', () => {
    const fn = jest.fn(() => { })
    const ctxBlock = Block({
      a: value(1),
      b: value(2)
    }, createHandler(fn))
    const block = Block({
      ctx: ctxBlock
    })

    const instance = block()
    expect(fn.mock.calls.length).toBe(0)

    instance()
    expect(fn.mock.calls.length).toBe(1)

    instance()
    expect(fn.mock.calls.length).toBe(2)


    const result = instance({ ctx: { a: 3 } })
    expect(result).toEqual({ ctx: { a: 3, b: 2 } })
    expect(fn.mock.calls.length).toBe(3)
    expect(fn.mock.calls[2][0]).toEqual({ a: 3, b: 2 }) // newValue
    expect(fn.mock.calls[2][2]).toEqual({ a: 1, b: 2 }) // oldValue
  })

  test('Nested block handler can update the whole block', () => {
    const ctxBlock = Block({
      a: value(1),
      b: value(2)
    }, createHandler(({ a }, update) => {
      if (a === 3) {
        update({ a: 4, b: 100 })
      }
    }))

    const block = Block({
      ctx: ctxBlock
    })

    const instance = block()
    instance()
    instance({ ctx: { a: 2 } })
    const result = instance({ ctx: { a: 3 } })

    expect(result).toEqual({ ctx: { a: 4, b: 100 } })
  })

  test('incremental state updates work properly', () => {
    const block = Block({
      update: value(false),
      a: value(1),
      b: value(1)
    }, memoHandler((upd, update) => {
      if (!upd) {
        return
      }
      update({ a: 2 })
      const newValue = update({ b: 2 })
      expect(newValue).toEqual({ a: 2, b: 2, update: true })
    }, ['update']))

    const instance = block()
    instance()
    const res = instance({ update: true })

    expect(res).toEqual({ a: 2, b: 2, update: true })
  })

  test('incremental state updates work in nested block properly', () => {
    const block = Block({
      update: value(false),
      nested: Block({
        a: value(1),
        b: value(1)
      })
    }, memoHandler((upd, update) => {
      if (upd) {
        update({ nested: { a: 2 } })
        update({ nested: { b: 2 } })
      }
    }, ['update']))

    const instance = block()
    instance()
    const res = instance({ update: true })

    expect(res).toEqual({ update: true, nested: { a: 2, b: 2 } })
  })

  test('incremental state updates work in nested sibling blocks properly', () => {
    const block = Block({
      update: value(false),
      n1: Block({
        a: value(1)
      }),
      n2: Block({
        b: value(1)
      })
    }, memoHandler((upd, update) => {
      if (upd) {
        update({ n1: { a: 2 } })
        update({ n2: { b: 2 } })
      }
    }, ['update']))

    const instance = block()
    instance()
    const res = instance({ update: true })

    expect(res).toEqual({ update: true, n1: { a: 2 }, n2: { b: 2 } })
  })


  test('should async increment handler updates work properly', async () => {
    return new Promise((resolve) => {
      const b1 = Block({
        upd: value(false),
        a: value(0)
      }, memoHandler((upd, update) => {
        if (upd) {
          setTimeout(() => {
            update({ a: 50 })
          }, 100)
        }
      }, ['upd']))

      const b2 = Block({
        upd: value(false),
        b: value(0)
      }, memoHandler((upd, update) => {
        if (upd) {
          setTimeout(() => {
            update({ b: 100 })
          }, 200)
        }
      }, ['upd']))

      const block = Block({
        update: value(false),

        b1,
        b2
      }, memoHandler((upd, update) => {
        if (upd) {
          update({ b1: { upd } })
          update({ b2: { upd } })
        }
      }, ['update']))

      let v
      const instance = block(undefined, {
        handleUpdate: (newValue) => {
          v = newValue
        }
      })
      instance()
      instance({ update: true })

      setTimeout(() => {
        expect(v).toEqual({ update: true, b1: { upd: true, a: 50 }, b2: { upd: true, b: 100 } })

        resolve()
      }, 500)
    })
  })

  // TODO: implement it
  // test('Really deep nested blocks with updates', () => {
  // })
})
