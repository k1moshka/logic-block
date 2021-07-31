import { Block } from '../../block'
import memo from '../memo'
import value from '../value'

test('memo valid reduces new value', () => {
  const reducer = memo((a, b) => {
    return a + b
  }, ['a', 'b'])

  const result = reducer({ a: 3, b: 5, c: 100 }, {}, 's')

  expect(result).toBe(8)
})

test('memo run if deps have changed', () => {
  const reduceFn = jest.fn((a, b) => {
    return a + b
  })

  const reducer = memo(reduceFn, ['a', 'b'])

  const currentValue = { a: 3, b: 5 }
  const newValue = { ...currentValue, b: 4 }
  const result = reducer(newValue, currentValue, 's')

  expect(result).toBe(7)
  expect(reduceFn.mock.calls.length).toBe(1)
})

test('memo does not run if deps have not changed', () => {
  const reduceFn = jest.fn((a, b) => {
    return a + b
  })

  const reducer = memo(reduceFn, ['a', 'b'])

  const currentValue = { a: 3, b: 5 }
  const newValue = { ...currentValue }
  reducer(newValue, currentValue, 's')

  expect(reduceFn.mock.calls.length).toBe(0)
})

test('memo apply new value if deps have not changed', () => {
  const reducer = memo((a, b) => a + b, ['a', 'b'])

  const currentValue = { a: 3, b: 5, s: 8 }
  const newValue = { ...currentValue, s: 12 }
  const result = reducer(newValue, currentValue, 's')

  expect(result).toBe(12)
})

test('memo should work on initial render with block initial data properly', () => {
  const fn = jest.fn(a => a + 1)
  const block = Block({
    a: value(1),
    m: memo(fn, ['a'])
  })

  const instance = block({ a: 2 })
  const result = instance()

  expect(fn.mock.calls.length).toBe(1)
  expect(result).toEqual({ a: 2, m: 3 })
})
