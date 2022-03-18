import Block, { value, inherit, createHandler } from '../../index'

test('inherit passes parent handler to new block', () => {
  const handlerFn = jest.fn((value, update) => {
    if (value.a === 1) { update({ a: 2 }) }
  })
  const handler = createHandler(handlerFn)
  const parentBlock = Block({ a: value(1) }, handler)

  const block = inherit(parentBlock, { b: 2 })
  const instance = block()
  const blockValue = instance() // handler fn should invokes here
  // second invoke will happen after update call inside handler

  expect(blockValue).toEqual({
    a: 2,
    b: 2
  })
  expect(handlerFn.mock.calls.length).toBe(2)
})

test('inherit passes extraHandler well', () => {
  const handlerFn = jest.fn((value, update) => {
    if (value.a === 1) { update({ a: 2 }) }
  })
  const handler = createHandler(handlerFn)
  const parentBlock = Block({ a: value(1) })

  const block = inherit(parentBlock, { b: 2 }, handler)
  const instance = block()
  const blockValue = instance() // handler fn should invokes here
  // second invoke will happen after update call inside handler

  expect(blockValue).toEqual({
    a: 2,
    b: 2
  })
  expect(handlerFn.mock.calls.length).toBe(2)
})

test('inherit combine parent handler and extra handler well', () => {
  const parentHandlerFn = jest.fn()
  const parentHandler = createHandler(parentHandlerFn)
  const parentBlock = Block({ a: value(1) }, parentHandler)

  const extendingHandlerFn = jest.fn()
  const extendingHandler = createHandler(extendingHandlerFn)
  const block = inherit(parentBlock, { b: 2 }, extendingHandler)

  const instance = block()
  const blockValue = instance() // handlers fns should invoke here

  expect(blockValue).toEqual({
    a: 1,
    b: 2
  })
  expect(parentHandlerFn.mock.calls.length).toBe(1)
  expect(extendingHandlerFn.mock.calls.length).toBe(1)
})

test('inherit with invalid parameters throws error', () => {
  expect(() => {
    inherit(undefined, {})
  }).toThrow(TypeError)

  expect(() => {
    inherit({}, undefined)
  }).toThrow(TypeError)

  expect(() => {
    inherit(undefined, {}, {})
  }).toThrow(TypeError)

  expect(() => {
    inherit(undefined, {}, () => {})
  }).toThrow(TypeError)
})

