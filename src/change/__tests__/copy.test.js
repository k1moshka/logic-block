import Block, { copy } from '../../index'

test('should copy work as expected', () => {
  const block1 = Block({})
  const block2 = copy(block1)

  expect(block1 === block2).toBe(false)
})

