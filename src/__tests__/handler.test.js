import Block, { value, createHandler } from '../'

describe('handler works properly', () => {
  test('handler can get value', () => {
    const handler = jest.fn(() => {})
    const block = Block({
      a: value(1)
    }, createHandler(handler))

    const instance = block()

    instance()
    instance({ a: 2 })

    expect(handler.mock.calls.length).toBe(2)
    expect(handler.mock.calls[0][0]).toEqual({ a: 1 })
    expect(handler.mock.calls[1][0]).toEqual({ a: 2 })
  })

  test('handler can update value', () => {
    const handler = jest.fn(({ a }, update) => {
      if (a === 1) {
        update({ a: 2 })
      }
    })
    const block = Block({
      a: value(1)
    }, createHandler(handler))

    const instance = block()

    instance()

    expect(handler.mock.calls.length).toBe(2)
    expect(handler.mock.calls[0][0]).toEqual({ a: 1 })
    expect(handler.mock.calls[1][0]).toEqual({ a: 2 })
  })
})