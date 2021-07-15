import value from '../value'


test('value valid reduces new value', () => {
  const reducer = value()
  const result = reducer({ a: 'new_value' }, {}, 'a')

  expect(result).toBe('new_value')
})

test('value valid reduces default value', () => {
  const reducer = value('default_value')
  const result = reducer()

  expect(result).toBe('default_value')
})

test('value func is running for setting default value', () => {
  const fn = jest.fn(({ a }) => { return a + 1 })
  const reducer = value(fn)
  const result = reducer({ a: 2 }, undefined, '')

  expect(fn.mock.calls.length).toBe(1)
  expect(result).toBe(3)
})
