import { expect } from '@jest/globals'
import Block, { extend } from '../../index'

test('should extend two blocks', () => {
  const block = extend(Block({ a: 1, c: { d: 3 } }), Block({ b: 2, c: { e: 4 } }))
  const schema = block.__getScheme()

  expect(schema).toEqual({ a: 1, b: 2, c: { d: 3, e: 4 } })
})

test('should extend two objects', () => {
  const block = extend({ a: 1, c: { d: 3 } }, { b: 2, c: { e: 4 } })
  const schema = block.__getScheme()

  expect(schema).toEqual({ a: 1, b: 2, c: { d: 3, e: 4 } })
})

test('should extend object and block', () => {
  const block = extend({ a: 1, c: { d: 3 } }, Block({ b: 2, c: { e: 4 } }))
  const schema = block.__getScheme()

  expect(schema).toEqual({ a: 1, b: 2, c: { d: 3, e: 4 } })
})

test('should copy block if provided only it', () => {
  const block1 = Block({ a: 1 })
  const block2 = extend(block1)

  expect(block1 === block2).toBe(false)
})
