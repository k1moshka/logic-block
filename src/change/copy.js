import { extend } from './extend'
import { withHandler } from './withHandler'
import { type BlockFactory } from '../block'

export const copy = (block: BlockFactory) => {
  return withHandler(extend(block), block.__getHandler())
}
