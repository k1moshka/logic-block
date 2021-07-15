import fields from '../fields'

test('fields valid reduces new value', () => {
  const fn = jest.fn((a, b) => {
    return a + b
  })
  const reducer = fields(fn, ['a', 'b'])

  const result = reducer({ a: 1, b: 2, c: 100 }, {}, 'c')

  expect(result).toBe(3)
  expect(fn.mock.calls[0][0]).toBe(1)
  expect(fn.mock.calls[0][1]).toBe(2)
  expect(fn.mock.calls[0][2]).toBe(100)
})

