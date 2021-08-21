import { Block, isBlock, type BlockFactory } from '../block'
import { type HandlerInstance } from '../handler'

export const withHandler = (block: BlockFactory, handler: HandlerInstance) => {
  if (isBlock(block)) {
    return Block(block.__getScheme(), handler)
  }

  if (typeof block === 'object') {
    return Block(block, handler)
  }

  console.error('withHandler: to apply handler on non-block and non-scheme', block, handler)
  return block
}
