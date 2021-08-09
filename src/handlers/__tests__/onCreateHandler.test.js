import Block, { onCreateHandler } from '../../'
import { value } from '../../reducers'

test('onCreateHandler will run only when instance is created', () => {
  const fn = jest.fn(() => { })
  const block = Block({
    a: value(1)
  }, onCreateHandler(fn))

  const instance = block()
  instance()
  instance()
  instance()
  instance()
  expect(fn.mock.calls.length).toBe(1)

  block()()
  expect(fn.mock.calls.length).toBe(2)
})